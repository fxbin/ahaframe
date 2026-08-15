(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.createLab!=='function')throw new Error('AhaFrame Lab Engine must load before Mission Engine.');

  const missions=new Map();
  const PHASES=Object.freeze(['BRIEF','INVESTIGATE','INTERVENE','SIMULATE','REVIEW','DECIDE','DEBRIEF','COMPLETE']);
  const DEFAULT_DECISIONS=Object.freeze(['SHIP','BLOCK','INCONCLUSIVE']);

  function clone(value){
    if(value===undefined||value===null||typeof value!=='object')return value;
    if(typeof structuredClone==='function')return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function assertToken(value,label){
    if(typeof value!=='string'||!value.trim())throw new TypeError(`${label} must be a non-empty string.`);
  }

  function assertUnique(items,label){
    const seen=new Set();
    items.forEach((item)=>{
      assertToken(item.id,`${label} id`);
      if(seen.has(item.id))throw new Error(`Duplicate ${label} id: ${item.id}`);
      seen.add(item.id);
    });
  }

  function resolvePath(value,path){
    if(!path)return value;
    return String(path).split('.').filter(Boolean).reduce((current,key)=>current==null?undefined:current[key],value);
  }

  function compareValue(actual,op,expected){
    switch(op){
      case '<': return actual<expected;
      case '<=': return actual<=expected;
      case '>': return actual>expected;
      case '>=': return actual>=expected;
      case '==': return actual===expected;
      case '!=': return actual!==expected;
      default: throw new RangeError(`Unsupported Mission constraint operator: ${op}`);
    }
  }

  function validateMission(definition){
    if(!definition||typeof definition!=='object')throw new TypeError('Mission definition must be an object.');
    assertToken(definition.id,'Mission id');
    assertToken(definition.scenarioId,`Mission ${definition.id} scenarioId`);

    const evidence=definition.evidence||[];
    const interventions=definition.interventions||[];
    const constraints=definition.constraints||[];
    if(!Array.isArray(evidence)||!Array.isArray(interventions)||!Array.isArray(constraints)){
      throw new TypeError(`Mission ${definition.id} evidence, interventions and constraints must be arrays.`);
    }
    assertUnique(evidence,'Mission evidence');
    assertUnique(interventions,'Mission intervention');
    assertUnique(constraints,'Mission constraint');

    evidence.forEach((item)=>{
      if(!['state','derived'].includes(item.source))throw new RangeError(`Mission evidence ${item.id} source must be state or derived.`);
      assertToken(item.path,`Mission evidence ${item.id} path`);
    });

    interventions.forEach((item)=>{
      assertToken(item.actionType,`Mission intervention ${item.id} actionType`);
      const cost=Number(item.cost??0);
      if(!Number.isFinite(cost)||cost<0)throw new RangeError(`Mission intervention ${item.id} cost must be a non-negative number.`);
    });

    constraints.forEach((item)=>{
      if(item.metric===undefined&&item.path===undefined)throw new TypeError(`Mission constraint ${item.id} requires metric or path.`);
      if(item.metric!==undefined)assertToken(item.metric,`Mission constraint ${item.id} metric`);
      if(item.path!==undefined)assertToken(item.path,`Mission constraint ${item.id} path`);
      if(!['veto','target','budget','diagnostic'].includes(item.severity||'target')){
        throw new RangeError(`Mission constraint ${item.id} has unsupported severity.`);
      }
      compareValue(0,item.op||'>=',0);
    });

    if(definition.classifyOutcome!==undefined&&typeof definition.classifyOutcome!=='function'){
      throw new TypeError(`Mission ${definition.id} classifyOutcome must be a function.`);
    }

    if(definition.interventionBudget!==undefined){
      const budget=Number(definition.interventionBudget);
      if(!Number.isFinite(budget)||budget<0)throw new RangeError(`Mission ${definition.id} interventionBudget must be a non-negative number.`);
    }

    const decisions=definition.releaseDecisions||DEFAULT_DECISIONS;
    if(!Array.isArray(decisions)||decisions.length===0)throw new TypeError(`Mission ${definition.id} requires release decisions.`);
    decisions.forEach((decision)=>assertToken(decision,`Mission ${definition.id} release decision`));
  }

  function evaluateConstraint(constraint,frame){
    let actual;
    if(constraint.path){
      actual=resolvePath(frame,constraint.path);
    }else{
      actual=frame?.derived?.metrics?.[constraint.metric];
    }
    const expected=constraint.value;
    const op=constraint.op||'>=';
    const comparable=actual!==undefined&&actual!==null;
    return {
      id:constraint.id,
      severity:constraint.severity||'target',
      metric:constraint.metric||null,
      path:constraint.path||null,
      op,
      expected:clone(expected),
      actual:clone(actual),
      pass:comparable?compareValue(actual,op,expected):false,
      comparable,
    };
  }

  AhaFrame.registerMission=function(definition){
    validateMission(definition);
    if(missions.has(definition.id))throw new Error(`Mission already registered: ${definition.id}`);
    const stored=Object.freeze({
      ...definition,
      version:definition.version||'0.8.0',
      evidence:Object.freeze((definition.evidence||[]).map((item)=>Object.freeze({...item}))),
      interventions:Object.freeze((definition.interventions||[]).map((item)=>Object.freeze({...item,cost:Number(item.cost??0)}))),
      constraints:Object.freeze((definition.constraints||[]).map((item)=>Object.freeze({...item,severity:item.severity||'target',op:item.op||'>='}))),
      releaseDecisions:Object.freeze([...(definition.releaseDecisions||DEFAULT_DECISIONS)]),
    });
    missions.set(stored.id,stored);
    return stored;
  };

  AhaFrame.listMissions=function(){
    return [...missions.values()].map(({id,version,scenarioId,chapterId})=>({id,version,scenarioId,chapterId:chapterId||null}));
  };

  AhaFrame.getMission=function(id){
    return missions.get(id)||null;
  };

  AhaFrame.createMission=function(idOrDefinition,options={}){
    const definition=typeof idOrDefinition==='string'?missions.get(idOrDefinition):idOrDefinition;
    if(!definition)throw new Error(`Unknown Mission: ${idOrDefinition}`);
    validateMission(definition);
    if(typeof AhaFrame.getLabScenario==='function'&&!AhaFrame.getLabScenario(definition.scenarioId)){
      throw new Error(`Mission ${definition.id} cannot start because Lab scenario is not registered: ${definition.scenarioId}`);
    }

    const lab=AhaFrame.createLab(definition.scenarioId,{...(options.labOptions||{}),track:false});
    const now=typeof options.clock==='function'?options.clock:()=>Date.now();
    const interventionBudget=definition.interventionBudget===undefined?null:Number(definition.interventionBudget);
    const interventionById=new Map((definition.interventions||[]).map((item)=>[item.id,item]));
    const evidenceById=new Map((definition.evidence||[]).map((item)=>[item.id,item]));
    const releaseDecisions=[...(definition.releaseDecisions||DEFAULT_DECISIONS)];

    let runtime;
    let appliedActions;

    function freshRuntime(){
      return {
        missionId:definition.id,
        missionVersion:definition.version||'0.8.0',
        scenarioId:definition.scenarioId,
        phase:'BRIEF',
        startedAt:null,
        attemptCount:0,
        simulationRunCount:0,
        inspectedEvidenceIds:[],
        interventionActionCount:0,
        interventionBudget,
        interventionBudgetSpent:0,
        attemptFrames:[],
        releaseDecision:null,
        outcomeCode:null,
        debriefUnlocked:false,
        completed:false,
      };
    }

    function resetInternal(){
      lab.reset({silent:true,keepHistory:false});
      runtime=freshRuntime();
      appliedActions=[];
    }
    resetInternal();

    function ensurePhase(allowed,action){
      if(!allowed.includes(runtime.phase))throw new Error(`${action} is not allowed during Mission phase ${runtime.phase}.`);
    }

    function constraintResults(frame=lab.getFrame()){
      return (definition.constraints||[]).map((item)=>evaluateConstraint(item,frame));
    }

    function genericOutcome(results){
      if(results.some((result)=>result.severity==='veto'&&!result.pass))return 'SAFETY_VETO';
      const required=results.filter((result)=>['target','budget'].includes(result.severity));
      if(required.length&&required.every((result)=>result.pass))return 'PRODUCTION_VIABLE';
      return 'CONSTRAINT_MISS';
    }

    function missionState(){
      return {
        ...clone(runtime),
        remainingBudget:interventionBudget===null?null:Math.max(0,interventionBudget-runtime.interventionBudgetSpent),
      };
    }

    function snapshot(){
      const frame=lab.getFrame();
      return {
        mission:missionState(),
        frame,
        constraints:constraintResults(frame),
      };
    }

    function start(){
      ensurePhase(['BRIEF'],'start');
      runtime.phase='INVESTIGATE';
      runtime.startedAt=now();
      return snapshot();
    }

    function inspectEvidence(id){
      ensurePhase(['INVESTIGATE','INTERVENE','REVIEW','DECIDE'],'inspectEvidence');
      const evidence=evidenceById.get(id);
      if(!evidence)throw new Error(`Unknown Mission evidence: ${id}`);
      if(!runtime.inspectedEvidenceIds.includes(id))runtime.inspectedEvidenceIds.push(id);
      const frame=lab.getFrame();
      const source=evidence.source==='state'?frame.state:frame.derived;
      return {id:evidence.id,value:clone(resolvePath(source,evidence.path))};
    }

    function intervene(id,payload={}){
      ensurePhase(['INVESTIGATE','INTERVENE','REVIEW','DECIDE'],'intervene');
      const intervention=interventionById.get(id);
      if(!intervention)throw new Error(`Unknown Mission intervention: ${id}`);
      const nextSpent=runtime.interventionBudgetSpent+Number(intervention.cost||0);
      if(interventionBudget!==null&&nextSpent>interventionBudget){
        throw new Error(`Mission intervention budget exceeded: ${nextSpent} > ${interventionBudget}.`);
      }
      const action={type:intervention.actionType,payload:clone(payload)};
      const frame=lab.dispatch(action);
      appliedActions.push(action);
      runtime.interventionActionCount+=1;
      runtime.interventionBudgetSpent=nextSpent;
      runtime.phase='INTERVENE';
      return {mission:missionState(),frame};
    }

    function runSimulation(){
      ensurePhase(['INVESTIGATE','INTERVENE','REVIEW'],'runSimulation');
      runtime.phase='SIMULATE';
      const frame=lab.getFrame();
      const results=constraintResults(frame);
      const provisional=missionState();
      const outcome=definition.classifyOutcome
        ? definition.classifyOutcome(clone(frame),clone(provisional),clone(results))
        : genericOutcome(results);
      assertToken(outcome,`Mission ${definition.id} outcome code`);
      const attempt={
        attemptNumber:runtime.attemptCount+1,
        at:now(),
        frame:clone(frame),
        constraintResults:clone(results),
        outcomeCode:outcome,
        interventionBudgetSpent:runtime.interventionBudgetSpent,
        actions:clone(appliedActions),
      };
      runtime.attemptFrames.push(attempt);
      runtime.attemptCount+=1;
      runtime.simulationRunCount+=1;
      runtime.outcomeCode=outcome;
      runtime.phase='REVIEW';
      return {mission:missionState(),attempt:clone(attempt)};
    }

    function attemptByNumber(number){
      const numeric=Number(number);
      if(!Number.isInteger(numeric)||numeric<1)throw new TypeError('Mission attempt number must be a positive integer.');
      const attempt=runtime.attemptFrames.find((item)=>item.attemptNumber===numeric);
      if(!attempt)throw new Error(`Unknown Mission attempt: ${number}`);
      return attempt;
    }

    function compareAttempts(leftNumber,rightNumber){
      ensurePhase(['REVIEW','DECIDE','DEBRIEF','COMPLETE'],'compareAttempts');
      const left=attemptByNumber(leftNumber);
      const right=attemptByNumber(rightNumber);
      return {
        left:left.attemptNumber,
        right:right.attemptNumber,
        lab:lab.compare(left.frame,right.frame),
        outcomes:{before:left.outcomeCode,after:right.outcomeCode},
        constraints:{before:clone(left.constraintResults),after:clone(right.constraintResults)},
        budgetSpent:{before:left.interventionBudgetSpent,after:right.interventionBudgetSpent},
      };
    }

    function restoreAttempt(number){
      ensurePhase(['REVIEW','DECIDE'],'restoreAttempt');
      const attempt=attemptByNumber(number);
      const frame=lab.replay(attempt.actions,{resetFirst:true});
      appliedActions=clone(attempt.actions);
      runtime.interventionBudgetSpent=attempt.interventionBudgetSpent;
      runtime.interventionActionCount=appliedActions.length;
      runtime.outcomeCode=attempt.outcomeCode;
      runtime.releaseDecision=null;
      runtime.debriefUnlocked=false;
      runtime.completed=false;
      runtime.phase='INTERVENE';
      return {mission:missionState(),frame};
    }

    function readyToDecide(){
      ensurePhase(['REVIEW'],'readyToDecide');
      if(runtime.attemptCount<1)throw new Error('Mission requires at least one simulation attempt before release decision.');
      runtime.phase='DECIDE';
      return snapshot();
    }

    function submitReleaseDecision(decision){
      ensurePhase(['DECIDE'],'submitReleaseDecision');
      if(!releaseDecisions.includes(decision))throw new RangeError(`Unsupported Mission release decision: ${decision}`);
      runtime.releaseDecision=decision;
      runtime.debriefUnlocked=true;
      runtime.phase='DEBRIEF';
      return snapshot();
    }

    function complete(){
      ensurePhase(['DEBRIEF'],'complete');
      runtime.completed=true;
      runtime.phase='COMPLETE';
      return snapshot();
    }

    function reset(){
      resetInternal();
      return snapshot();
    }

    return Object.freeze({
      id:definition.id,
      version:definition.version||'0.8.0',
      scenarioId:definition.scenarioId,
      start,
      inspectEvidence,
      intervene,
      runSimulation,
      compareAttempts,
      restoreAttempt,
      readyToDecide,
      submitReleaseDecision,
      complete,
      reset,
      getSnapshot:()=>clone(snapshot()),
      getMissionState:()=>clone(missionState()),
      getLabFrame:()=>clone(lab.getFrame()),
      listAttempts:()=>clone(runtime.attemptFrames),
    });
  };

  AhaFrame.MISSION_PHASES=PHASES;
})(typeof window!=='undefined'?window:globalThis);
