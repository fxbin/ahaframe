(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before Evaluation Failure scenario.');

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const PRODUCTION_PRESET={datasetPreset:'production-like',passThreshold:82,safetyVeto:true,sampleSize:200,judgeMode:'mixed',costGate:true};
  const COST_PER_SUCCESS_LIMIT=0.10;
  const SAFETY_FLOOR=80;

  const SLICE_DEFINITIONS=[
    {id:'common-faq',label:'Common FAQ',v1:88,v2:95,critical:false},
    {id:'retrieval-heavy',label:'Retrieval-heavy',v1:79,v2:91,critical:false},
    {id:'tool-calling',label:'Tool calling',v1:82,v2:94,critical:false},
    {id:'long-horizon',label:'Long-horizon',v1:76,v2:64,critical:false},
    {id:'safety-critical-refund',label:'Safety-critical refund',v1:89,v2:61,critical:true},
  ];

  const DATASET_PRESETS={
    'demo-biased':{
      label:'Demo-biased',
      weights:{'common-faq':0.45,'retrieval-heavy':0.30,'tool-calling':0.15,'long-horizon':0.07,'safety-critical-refund':0.03},
    },
    'production-like':{
      label:'Production-like',
      weights:{'common-faq':0.30,'retrieval-heavy':0.25,'tool-calling':0.20,'long-horizon':0.15,'safety-critical-refund':0.10},
    },
    'safety-heavy':{
      label:'Safety-heavy',
      weights:{'common-faq':0.20,'retrieval-heavy':0.20,'tool-calling':0.20,'long-horizon':0.20,'safety-critical-refund':0.20},
    },
  };

  const JUDGE_MODES={
    deterministic:{label:'Deterministic checks',noise:0.04,coverage:0.72,costFactor:0.20},
    rubric:{label:'Semantic / rubric judge',noise:0.12,coverage:0.90,costFactor:1.00},
    mixed:{label:'Mixed evaluation',noise:0.05,coverage:0.97,costFactor:1.30},
  };

  AhaFrame.registerLabScenario({
    id:'evaluation-failure',
    version:'1.0.0',
    title:'Evaluation Failure Lab',
    initialState:{datasetPreset:'demo-biased',passThreshold:80,safetyVeto:false,sampleSize:50,judgeMode:'rubric',costGate:false},
    reduce(state,action){
      switch(action.type){
        case 'SET_DATASET_PRESET': {
          const value=action.payload?.value;
          if(!DATASET_PRESETS[value])throw new RangeError('Dataset preset must be demo-biased, production-like, or safety-heavy.');
          return {...state,datasetPreset:value};
        }
        case 'SET_PASS_THRESHOLD': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<70||value>95)throw new RangeError('Pass threshold must be between 70 and 95.');
          return {...state,passThreshold:value};
        }
        case 'SET_SAFETY_VETO':
          return {...state,safetyVeto:Boolean(action.payload?.value)};
        case 'SET_SAMPLE_SIZE': {
          const value=Number(action.payload?.value);
          if(![50,100,200,500].includes(value))throw new RangeError('Sample size must be one of 50, 100, 200, or 500.');
          return {...state,sampleSize:value};
        }
        case 'SET_JUDGE_MODE': {
          const value=action.payload?.value;
          if(!JUDGE_MODES[value])throw new RangeError('Judge mode must be deterministic, rubric, or mixed.');
          return {...state,judgeMode:value};
        }
        case 'SET_COST_GATE':
          return {...state,costGate:Boolean(action.payload?.value)};
        case 'APPLY_PRODUCTION_PRESET':
          return {...PRODUCTION_PRESET};
        default:
          throw new Error(`Unsupported evaluation-failure action: ${action.type}`);
      }
    },
    derive(state){
      const preset=DATASET_PRESETS[state.datasetPreset];
      const judge=JUDGE_MODES[state.judgeMode];
      const sliceScores=SLICE_DEFINITIONS.map((slice)=>({
        ...slice,
        weight:preset.weights[slice.id],
        delta:slice.v2-slice.v1,
      }));

      const aggregate=(version)=>sliceScores.reduce((sum,slice)=>sum+slice[version]*slice.weight,0);
      const aggregateV1=aggregate('v1');
      const aggregateV2=aggregate('v2');
      const aggregateDelta=aggregateV2-aggregateV1;
      const regressions=sliceScores.filter((slice)=>slice.delta<=-5);
      const criticalRegressions=regressions.filter((slice)=>slice.critical);
      const safetySlice=sliceScores.find((slice)=>slice.critical);

      const baseConfidenceWidth=32/Math.sqrt(state.sampleSize);
      const judgePenalty=1+judge.noise+(1-judge.coverage)*0.50;
      const confidenceWidth=baseConfidenceWidth*judgePenalty;
      const evidenceAdequate=aggregateDelta>0&&aggregateDelta>=confidenceWidth;
      const judgeNoise=clamp(judge.noise+(1-judge.coverage)*0.20,0,1);
      const estimatedEvalCost=state.sampleSize*judge.costFactor*2/100;

      const costPerSuccessV1=0.072/(aggregateV1/100);
      const costPerSuccessV2=0.091/(aggregateV2/100);
      const aggregatePass=aggregateV2>=state.passThreshold&&aggregateDelta>0;
      const safetyViolation=Boolean(state.safetyVeto&&safetySlice.v2<SAFETY_FLOOR);
      const costViolation=Boolean(state.costGate&&costPerSuccessV2>COST_PER_SUCCESS_LIMIT);

      let decision='SHIP';
      if(!aggregatePass||safetyViolation||costViolation)decision='BLOCK';
      else if(!evidenceAdequate)decision='INCONCLUSIVE';

      let failureType='healthy';
      let diagnosis='Healthy evaluation policy: representative slices, evidence strength, release gates, and economics support the decision.';
      if(safetyViolation){
        failureType='aggregate-score-trap';
        diagnosis='Aggregate score trap: v2 looks better overall, but the safety-critical refund slice is below the release floor and must block shipment.';
      }else if(costViolation){
        failureType='economic-regression';
        diagnosis='Economic regression: the candidate clears quality checks but exceeds the configured cost-per-success budget.';
      }else if(!evidenceAdequate&&aggregateDelta>0){
        failureType='underpowered-eval';
        diagnosis='Underpowered evaluation: the apparent improvement is smaller than the modeled evidence width. Collect stronger evidence before shipping.';
      }else if(state.datasetPreset==='demo-biased'&&criticalRegressions.length){
        failureType='demo-biased-dataset';
        diagnosis='Demo-biased dataset: easy and common cases dominate the aggregate while consequential production failures receive too little weight.';
      }else if(!state.safetyVeto&&criticalRegressions.length){
        failureType='missing-veto';
        diagnosis='Missing veto: a safety-critical regression is being averaged into the overall score instead of acting as a release gate.';
      }else if(state.judgeMode==='deterministic'&&regressions.length){
        failureType='judge-mismatch';
        diagnosis='Judge mismatch: deterministic checks are cheap and stable, but their modeled coverage is too narrow for semantic and process-level regressions.';
      }else if(criticalRegressions.length){
        failureType='aggregate-score-trap';
        diagnosis='Aggregate score trap: the candidate improves on average while a critical slice materially regresses.';
      }

      return {
        datasetLabel:preset.label,
        judgeLabel:judge.label,
        sliceScores,
        aggregateV1,
        aggregateV2,
        aggregateDelta,
        regressions,
        criticalRegressions,
        confidenceWidth,
        evidenceAdequate,
        judgeNoise,
        judgeCoverage:judge.coverage,
        estimatedEvalCost,
        costPerSuccessV1,
        costPerSuccessV2,
        costPerSuccessLimit:COST_PER_SUCCESS_LIMIT,
        safetyFloor:SAFETY_FLOOR,
        decision,
        failureType,
        diagnosis,
        metrics:{
          aggregateV1,
          aggregateV2,
          aggregateDelta,
          criticalSafetyScore:safetySlice.v2,
          regressionCount:regressions.length,
          criticalRegressionCount:criticalRegressions.length,
          confidenceWidth,
          judgeNoise,
          estimatedEvalCost,
          costPerSuccessV1,
          costPerSuccessV2,
        },
      };
    },
  });
})(typeof window!=='undefined'?window:globalThis);
