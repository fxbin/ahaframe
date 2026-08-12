(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  const scenarios=new Map();

  function clone(value){
    if(value===undefined||value===null||typeof value!=='object')return value;
    if(typeof structuredClone==='function')return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function assertPlainState(value,label){
    if(!value||typeof value!=='object'||Array.isArray(value)){
      throw new TypeError(`${label} must be a plain state object.`);
    }
  }

  function normalizeAction(typeOrAction,payload){
    if(typeof typeOrAction==='string'){
      if(!typeOrAction.trim())throw new TypeError('Lab action type cannot be empty.');
      return {type:typeOrAction,payload:clone(payload??{})};
    }
    if(!typeOrAction||typeof typeOrAction!=='object'||typeof typeOrAction.type!=='string'||!typeOrAction.type.trim()){
      throw new TypeError('Lab action must be a string or an object with a non-empty type.');
    }
    return clone(typeOrAction);
  }

  function diffTopLevel(before={},after={}){
    const diff={};
    const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
    keys.forEach((key)=>{
      const a=before?.[key];
      const b=after?.[key];
      if(JSON.stringify(a)!==JSON.stringify(b))diff[key]={before:clone(a),after:clone(b)};
    });
    return diff;
  }

  function validateScenario(definition){
    if(!definition||typeof definition!=='object')throw new TypeError('Lab scenario must be an object.');
    if(typeof definition.id!=='string'||!definition.id.trim())throw new TypeError('Lab scenario requires a non-empty id.');
    if(typeof definition.reduce!=='function')throw new TypeError(`Lab scenario ${definition.id} requires a reducer.`);
    if(definition.derive!==undefined&&typeof definition.derive!=='function')throw new TypeError(`Lab scenario ${definition.id} derive must be a function.`);
    if(definition.compare!==undefined&&typeof definition.compare!=='function')throw new TypeError(`Lab scenario ${definition.id} compare must be a function.`);
    const initial=typeof definition.initialState==='function'?definition.initialState({}):definition.initialState;
    assertPlainState(initial,`Lab scenario ${definition.id} initialState`);
  }

  AhaFrame.registerLabScenario=function(definition){
    validateScenario(definition);
    if(scenarios.has(definition.id))throw new Error(`Lab scenario already registered: ${definition.id}`);
    const stored=Object.freeze({...definition,version:definition.version||'1.0.0'});
    scenarios.set(stored.id,stored);
    return stored;
  };

  AhaFrame.listLabScenarios=function(){
    return [...scenarios.values()].map(({id,version,title})=>({id,version,title:title||id}));
  };

  AhaFrame.getLabScenario=function(id){
    return scenarios.get(id)||null;
  };

  AhaFrame.createLab=function(idOrDefinition,options={}){
    const definition=typeof idOrDefinition==='string'?scenarios.get(idOrDefinition):idOrDefinition;
    if(!definition)throw new Error(`Unknown lab scenario: ${idOrDefinition}`);
    validateScenario(definition);

    const maxHistory=Math.max(1,Number(options.maxHistory)||100);
    const listeners=new Set();
    const checkpoints=new Map();
    const makeInitial=()=>clone(typeof definition.initialState==='function'?definition.initialState(options):definition.initialState);
    let state=makeInitial();
    let history=[];

    function makeFrame(action=null){
      const stateCopy=clone(state);
      const derived=definition.derive?definition.derive(clone(stateCopy),{options,action:clone(action)}):{};
      return {
        id:definition.id,
        version:definition.version||'1.0.0',
        state:stateCopy,
        derived:clone(derived||{}),
        action:action?clone(action):null,
        historyLength:history.length,
      };
    }

    function notify(frame){
      listeners.forEach((listener)=>{
        try{listener(clone(frame));}
        catch(error){console.error(`[AhaFrame Lab ${definition.id}] subscriber failed`,error);}
      });
    }

    function dispatch(typeOrAction,payload){
      const action=normalizeAction(typeOrAction,payload);
      const before=makeFrame(action);
      const next=definition.reduce(clone(state),clone(action),{options,id:definition.id});
      assertPlainState(next,`Lab scenario ${definition.id} reducer result for ${action.type}`);
      state=clone(next);
      const after=makeFrame(action);
      history.push({action:clone(action),before:clone(before),after:clone(after),at:Date.now()});
      if(history.length>maxHistory)history=history.slice(history.length-maxHistory);
      after.historyLength=history.length;
      if(options.track!==false&&typeof AhaFrame.track==='function'){
        AhaFrame.track('lab_action',{lab:definition.id,action:action.type});
      }
      notify(after);
      return clone(after);
    }

    function reset({silent=false,keepHistory=false}={}){
      state=makeInitial();
      if(!keepHistory)history=[];
      const frame=makeFrame({type:'RESET',payload:{}});
      if(options.track!==false&&typeof AhaFrame.track==='function')AhaFrame.track('lab_reset',{lab:definition.id});
      if(!silent)notify(frame);
      return clone(frame);
    }

    function subscribe(listener,{immediate=true}={}){
      if(typeof listener!=='function')throw new TypeError('Lab subscriber must be a function.');
      listeners.add(listener);
      if(immediate)listener(clone(makeFrame()));
      return ()=>listeners.delete(listener);
    }

    function checkpoint(name='default'){
      if(typeof name!=='string'||!name.trim())throw new TypeError('Checkpoint name cannot be empty.');
      const frame=makeFrame();
      checkpoints.set(name,clone(frame));
      return clone(frame);
    }

    function resolveComparable(value){
      if(typeof value==='string'){
        const saved=checkpoints.get(value);
        if(!saved)throw new Error(`Unknown lab checkpoint: ${value}`);
        return clone(saved);
      }
      if(value&&typeof value==='object'&&value.state)return clone(value);
      if(value&&typeof value==='object')return {state:clone(value),derived:{}};
      throw new TypeError('Compare values must be checkpoint names, frames, or state objects.');
    }

    function compare(left,right=makeFrame()){
      const before=resolveComparable(left);
      const after=resolveComparable(right);
      if(definition.compare)return clone(definition.compare(before,after,{options,id:definition.id}));
      return {
        state:diffTopLevel(before.state,after.state),
        metrics:diffTopLevel(before.derived?.metrics||{},after.derived?.metrics||{}),
      };
    }

    function replay(actions,{resetFirst=true}={}){
      if(!Array.isArray(actions))throw new TypeError('Replay requires an array of actions.');
      if(resetFirst)reset({silent:true,keepHistory:false});
      let frame=makeFrame();
      actions.forEach((action)=>{frame=dispatch(action);});
      return clone(frame);
    }

    return Object.freeze({
      id:definition.id,
      version:definition.version||'1.0.0',
      dispatch,
      reset,
      subscribe,
      checkpoint,
      compare,
      replay,
      getFrame:()=>clone(makeFrame()),
      getHistory:()=>clone(history),
      getCheckpoint:(name)=>clone(checkpoints.get(name)||null),
      clearHistory:()=>{history=[];},
    });
  };
})(typeof window!=='undefined'?window:globalThis);
