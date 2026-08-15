'use strict';

module.exports=function registerMissionEngineFixture(AhaFrame){
  if(!AhaFrame.getLabScenario('mission-engine-demo')){
    AhaFrame.registerLabScenario({
      id:'mission-engine-demo',
      version:'0.8.0',
      title:'Mission Engine deterministic fixture',
      initialState:{retryLimit:4,idempotency:false,humanApproval:false},
      reduce(state,action){
        switch(action.type){
          case 'SET_RETRY_LIMIT': {
            const value=Number(action.payload?.value);
            if(!Number.isInteger(value)||value<0||value>5)throw new RangeError('retryLimit must be 0..5');
            return {...state,retryLimit:value};
          }
          case 'SET_IDEMPOTENCY':
            return {...state,idempotency:Boolean(action.payload?.value)};
          case 'SET_HUMAN_APPROVAL':
            return {...state,humanApproval:Boolean(action.payload?.value)};
          default:
            throw new Error(`Unsupported mission fixture action: ${action.type}`);
        }
      },
      derive(state){
        const successPercent=Math.max(0,Math.min(99,82+state.retryLimit*4-(state.humanApproval?4:0)));
        const duplicatePercent=Math.max(0.1,state.retryLimit*2.2-(state.idempotency?8:0)-(state.humanApproval?4:0));
        const latencySeconds=4+state.retryLimit*1.4+(state.humanApproval?8:0);
        const costIndex=20+state.retryLimit*5+(state.idempotency?4:0)+(state.humanApproval?8:0);
        return {
          evidence:{
            toolTimeline:[
              {step:'attempt-1',clientResult:'timeout',providerResult:'eventual-success'},
              {step:'retry',idempotency:state.idempotency?'dedupe-enabled':'missing'},
            ],
            policy:{retryLimit:state.retryLimit,idempotency:state.idempotency,humanApproval:state.humanApproval},
          },
          metrics:{successPercent,duplicatePercent,latencySeconds,costIndex},
        };
      },
    });
  }

  if(!AhaFrame.getMission('mission-engine-demo')){
    AhaFrame.registerMission({
      id:'mission-engine-demo',
      version:'0.8.0',
      scenarioId:'mission-engine-demo',
      chapterId:'fixture',
      interventionBudget:5,
      evidence:[
        {id:'tool-timeline',source:'derived',path:'evidence.toolTimeline'},
        {id:'policy',source:'derived',path:'evidence.policy'},
      ],
      interventions:[
        {id:'retry-limit',actionType:'SET_RETRY_LIMIT',cost:1},
        {id:'idempotency',actionType:'SET_IDEMPOTENCY',cost:2},
        {id:'human-approval',actionType:'SET_HUMAN_APPROVAL',cost:3},
      ],
      constraints:[
        {id:'duplicates',metric:'duplicatePercent',op:'<=',value:1,severity:'veto'},
        {id:'success',metric:'successPercent',op:'>=',value:90,severity:'target'},
        {id:'latency',metric:'latencySeconds',op:'<=',value:12,severity:'target'},
        {id:'cost',metric:'costIndex',op:'<=',value:50,severity:'budget'},
      ],
      releaseDecisions:['SHIP','BLOCK','INCONCLUSIVE'],
      classifyOutcome(frame,missionState,constraints){
        if(constraints.some((item)=>item.severity==='veto'&&!item.pass))return 'SAFETY_VETO';
        if(frame.derived.metrics.successPercent<90)return 'SAFE_BUT_LOW_RECOVERY';
        if(frame.derived.metrics.latencySeconds>12)return 'SAFE_BUT_TOO_SLOW';
        if(frame.derived.metrics.costIndex>50)return 'SAFE_BUT_TOO_EXPENSIVE';
        return 'PRODUCTION_VIABLE';
      },
    });
  }
};
