(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before Decision Experience scenarios.');

  const clone=(value)=>{
    if(value===undefined||value===null||typeof value!=='object')return value;
    if(typeof structuredClone==='function')return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  };
  const round=(value,places=1)=>{
    const factor=10**places;
    return Math.round(value*factor)/factor;
  };

  AhaFrame.registerDecisionExperienceScenario=function(definition){
    if(!definition||typeof definition!=='object')throw new TypeError('Decision Experience definition must be an object.');
    if(typeof definition.id!=='string'||!definition.id.trim())throw new TypeError('Decision Experience requires an id.');
    if(!definition.controls||typeof definition.controls!=='object')throw new TypeError(`Decision Experience ${definition.id} requires controls.`);
    if(!definition.baseMetrics||typeof definition.baseMetrics!=='object')throw new TypeError(`Decision Experience ${definition.id} requires baseMetrics.`);

    const controls=Object.entries(definition.controls);
    const actionMap=new Map();
    const initialState={};
    controls.forEach(([key,control])=>{
      if(!control||typeof control!=='object')throw new TypeError(`Decision Experience ${definition.id} control ${key} is invalid.`);
      if(typeof control.actionType!=='string'||!control.actionType.trim())throw new TypeError(`Decision Experience ${definition.id} control ${key} requires actionType.`);
      if(!control.options||typeof control.options!=='object'||!Object.keys(control.options).length)throw new TypeError(`Decision Experience ${definition.id} control ${key} requires options.`);
      if(!Object.prototype.hasOwnProperty.call(control.options,control.initial))throw new Error(`Decision Experience ${definition.id} control ${key} initial option is unknown.`);
      if(actionMap.has(control.actionType))throw new Error(`Decision Experience ${definition.id} duplicates action ${control.actionType}.`);
      actionMap.set(control.actionType,{key,control});
      initialState[key]=control.initial;
    });

    AhaFrame.registerLabScenario({
      id:definition.id,
      version:definition.version||'1.0.0',
      title:definition.title||definition.id,
      initialState,
      reduce(state,action){
        const match=actionMap.get(action.type);
        if(!match)throw new Error(`Unsupported ${definition.id} action: ${action.type}`);
        const value=action.payload?.value;
        if(!Object.prototype.hasOwnProperty.call(match.control.options,value))throw new RangeError(`${match.key} option is not supported: ${String(value)}`);
        return {...state,[match.key]:value};
      },
      derive(state){
        const metrics=clone(definition.baseMetrics);
        const optionNotes=[];
        controls.forEach(([key,control])=>{
          const selected=state[key];
          const option=control.options[selected];
          Object.entries(option.effects||{}).forEach(([metric,delta])=>{
            if(typeof metrics[metric]!=='number')throw new Error(`Decision Experience ${definition.id} effect references unknown metric ${metric}.`);
            metrics[metric]+=Number(delta);
          });
          if(option.note)optionNotes.push({control:key,choice:selected,note:option.note});
        });
        Object.keys(metrics).forEach((metric)=>{metrics[metric]=round(metrics[metric],definition.metricPrecision?.[metric]??1);});
        if(typeof definition.normalizeMetrics==='function')definition.normalizeMetrics(metrics,state);
        const diagnosisCode=typeof definition.classify==='function'?definition.classify(clone(metrics),clone(state)):'UNCLASSIFIED';
        const evidence=clone(definition.evidence||{});
        evidence.policy=clone(state);
        evidence.metrics=clone(metrics);
        evidence.audit={diagnosisCode,selectedOptions:optionNotes};
        if(typeof definition.extendEvidence==='function')definition.extendEvidence(evidence,clone(metrics),clone(state));
        return {metrics,evidence,diagnosisCode};
      },
    });
  };
})(typeof window!=='undefined'?window:globalThis);
