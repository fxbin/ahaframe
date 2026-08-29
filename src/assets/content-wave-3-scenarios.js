(function(root){
  'use strict';
  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerDecisionExperienceScenario!=='function')throw new Error('Decision Experience scenario factory must load before Content Wave 3 scenarios.');
  const clamp=(m,k,min,max)=>{m[k]=Math.max(min,Math.min(max,m[k]));};
  const clampPercent=(m,...keys)=>keys.forEach((k)=>clamp(m,k,0,100));

  AhaFrame.registerDecisionExperienceScenario({
    id:'multi-agent-coordination-scenario',title:'Multi-Agent Coordination Incident',
    baseMetrics:{coordinationRiskPercent:42,taskCoverageScore:48,independentVerificationScore:25,coordinationOverheadIndex:80,latencyMs:1700},
    controls:{
      delegation:{actionType:'SET_MULTI_AGENT_DELEGATION',initial:'single-agent',options:{
        'single-agent':{effects:{},note:'A single generalist is the simplest baseline and should remain the comparison point before adding coordination.'},
        'manager-worker':{effects:{coordinationRiskPercent:-10,taskCoverageScore:22,independentVerificationScore:5,coordinationOverheadIndex:16,latencyMs:120},note:'Manager-worker delegation helps when task boundaries are explicit and one owner remains accountable.'},
        'peer-swarm':{effects:{coordinationRiskPercent:6,taskCoverageScore:30,independentVerificationScore:8,coordinationOverheadIndex:45,latencyMs:-250},note:'A broad peer swarm increases coverage but creates ownership, conflict and synchronization cost.'}
      }},
      state:{actionType:'SET_MULTI_AGENT_STATE',initial:'chat-transcript',options:{
        'chat-transcript':{effects:{},note:'Passing conversational transcripts between agents hides ownership and completion state.'},
        'explicit-contract':{effects:{coordinationRiskPercent:-16,taskCoverageScore:18,independentVerificationScore:5,coordinationOverheadIndex:8},note:'Explicit task contracts make inputs, outputs, owners and done criteria inspectable.'},
        'shared-blackboard':{effects:{coordinationRiskPercent:-12,taskCoverageScore:22,independentVerificationScore:8,coordinationOverheadIndex:20},note:'Shared state can help many workers coordinate, but introduces its own synchronization surface.'}
      }},
      verification:{actionType:'SET_MULTI_AGENT_VERIFICATION',initial:'self-review',options:{
        'self-review':{effects:{},note:'Delegating work and asking the same path to verify it does not create independent evidence.'},
        'independent-verifier':{effects:{coordinationRiskPercent:-12,independentVerificationScore:55,coordinationOverheadIndex:12,latencyMs:120},note:'An independent verifier separates generation from acceptance.'},
        'double-independent':{effects:{coordinationRiskPercent:-15,independentVerificationScore:65,coordinationOverheadIndex:25,latencyMs:240},note:'More verification is not free; duplicate verifiers can exceed the value of the additional evidence.'}
      }},
      parallelism:{actionType:'SET_MULTI_AGENT_PARALLELISM',initial:'sequential',options:{
        sequential:{effects:{},note:'Sequential execution is predictable but may waste independent-work parallelism.'},
        bounded:{effects:{coordinationRiskPercent:-4,taskCoverageScore:8,coordinationOverheadIndex:10,latencyMs:-800},note:'Bounded parallelism exploits independent work while keeping fan-out reviewable.'},
        maximum:{effects:{coordinationRiskPercent:12,taskCoverageScore:12,coordinationOverheadIndex:40,latencyMs:-1100},note:'Maximum fan-out can lower wall-clock latency while making conflicts and synthesis much harder.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'coordinationRiskPercent','taskCoverageScore','independentVerificationScore');m.coordinationOverheadIndex=Math.max(0,m.coordinationOverheadIndex);m.latencyMs=Math.max(0,m.latencyMs);},
    classify(m){if(m.coordinationRiskPercent>10)return 'COORDINATION_FAILURE_RISK';if(m.taskCoverageScore<85)return 'DELEGATION_COVERAGE_GAP';if(m.independentVerificationScore<80)return 'VERIFICATION_NOT_INDEPENDENT';if(m.coordinationOverheadIndex>150)return 'ORCHESTRATION_OVERHEAD';if(m.latencyMs>1300)return 'ORCHESTRATION_TOO_SLOW';return 'ORCHESTRATION_READY';},
    evidence:{brief:{task:'Research, implement, test and review a production change',failure:'Four agents produced overlapping edits, contradictory assumptions and no independent acceptance owner.'},artifacts:{agents:4,duplicateEdits:9,conflictingDecisions:3,ownerlessOutputs:5},signals:{tasksContainIndependentWork:true,sharedStateNeeded:true,moreAgentsCanIncreaseOverhead:true}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'production-release-gate-scenario',title:'Production Release Gate Build',
    baseMetrics:{releaseFailureRiskPercent:35,evaluationEvidenceScore:40,observabilityCoverageScore:45,rollbackReadinessScore:35,changeExposurePercent:100,releaseCostIndex:40},
    controls:{
      evaluation:{actionType:'SET_RELEASE_EVALUATION',initial:'demo-only',options:{
        'demo-only':{effects:{},note:'A convincing demo does not cover known production failure modes.'},
        'failure-set':{effects:{releaseFailureRiskPercent:-10,evaluationEvidenceScore:35,observabilityCoverageScore:5,releaseCostIndex:8},note:'A versioned failure set turns known incidents into repeatable release evidence.'},
        'gated-regression':{effects:{releaseFailureRiskPercent:-14,evaluationEvidenceScore:45,observabilityCoverageScore:8,releaseCostIndex:12},note:'A release gate combines regression evidence with explicit veto thresholds.'}
      }},
      rollout:{actionType:'SET_RELEASE_ROLLOUT',initial:'big-bang',options:{
        'big-bang':{effects:{},note:'A full rollout maximizes exposure before real production evidence arrives.'},
        canary:{effects:{releaseFailureRiskPercent:-8,rollbackReadinessScore:15,changeExposurePercent:-70,releaseCostIndex:10},note:'A canary bounds exposure while collecting production evidence.'},
        'shadow-canary':{effects:{releaseFailureRiskPercent:-10,rollbackReadinessScore:20,changeExposurePercent:-80,releaseCostIndex:18},note:'Shadow plus canary can reduce user exposure further, at the cost of more infrastructure.'}
      }},
      observability:{actionType:'SET_RELEASE_OBSERVABILITY',initial:'dashboard-only',options:{
        'dashboard-only':{effects:{},note:'A dashboard without causal traces and alerts can show that something moved without explaining what failed.'},
        'traces-alerts':{effects:{releaseFailureRiskPercent:-6,observabilityCoverageScore:40,rollbackReadinessScore:8,releaseCostIndex:7},note:'Trace-linked alerts make model, retrieval, tool and policy regressions distinguishable.'},
        'release-slo':{effects:{releaseFailureRiskPercent:-8,observabilityCoverageScore:50,rollbackReadinessScore:10,releaseCostIndex:10},note:'Release SLOs make operational evidence part of the ship decision.'}
      }},
      fallback:{actionType:'SET_RELEASE_FALLBACK',initial:'manual-recovery',options:{
        'manual-recovery':{effects:{},note:'A manual-only recovery plan is often slower than the incident it is supposed to contain.'},
        'versioned-rollback':{effects:{releaseFailureRiskPercent:-5,rollbackReadinessScore:45,releaseCostIndex:8},note:'Versioned rollback creates a tested path back to a known-good model, prompt, retrieval or policy configuration.'},
        'automatic-rollback':{effects:{releaseFailureRiskPercent:-8,rollbackReadinessScore:55,releaseCostIndex:15},note:'Automatic rollback can be valuable for crisp signals, but needs safeguards against noisy triggers.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'releaseFailureRiskPercent','evaluationEvidenceScore','observabilityCoverageScore','rollbackReadinessScore','changeExposurePercent');m.releaseCostIndex=Math.max(0,m.releaseCostIndex);},
    classify(m){if(m.releaseFailureRiskPercent>8)return 'RELEASE_RISK_TOO_HIGH';if(m.evaluationEvidenceScore<80)return 'EVIDENCE_GATE_WEAK';if(m.observabilityCoverageScore<80)return 'PRODUCTION_BLIND_SPOT';if(m.rollbackReadinessScore<80)return 'ROLLBACK_NOT_READY';if(m.changeExposurePercent>40)return 'EXPOSURE_TOO_LARGE';if(m.releaseCostIndex>90)return 'RELEASE_GATE_TOO_EXPENSIVE';return 'RELEASE_GATE_READY';},
    evidence:{brief:{change:'New model + retrieval reranker + tool policy',traffic:'100% planned rollout',failureHistory:'Previous release passed demos but doubled tool retries in production.'},artifacts:{knownFailureCases:27,releaseVetoesDefined:0,rollbackDrillAgeDays:94},signals:{offlineEvalsAvailable:true,productionDistributionCanDiffer:true,rollbackMustCoverMoreThanModelWeights:true}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'model-adaptation-decision-scenario',title:'Model Adaptation Decision Lab',
    baseMetrics:{residualTaskGapPercent:30,adaptationEvidenceScore:25,dataQualityScore:35,servingComplexityScore:20,unitCostIndex:55},
    controls:{
      baseline:{actionType:'SET_ADAPTATION_BASELINE',initial:'no-baseline',options:{
        'no-baseline':{effects:{},note:'Training before measuring a prompt/RAG baseline makes the adaptation decision impossible to attribute.'},
        'prompt-rag-benchmark':{effects:{residualTaskGapPercent:-8,adaptationEvidenceScore:30,dataQualityScore:5,unitCostIndex:5},note:'A measured prompt/RAG baseline identifies the behavior gap that training must actually close.'},
        'strong-prompt-rag':{effects:{residualTaskGapPercent:-12,adaptationEvidenceScore:35,dataQualityScore:8,unitCostIndex:8},note:'A stronger non-training baseline is the right comparator before paying the operational cost of adaptation.'}
      }},
      dataset:{actionType:'SET_ADAPTATION_DATASET',initial:'raw-logs',options:{
        'raw-logs':{effects:{},note:'Raw production logs mix good, bad and accidental behavior and are not a training specification.'},
        'curated-heldout':{effects:{residualTaskGapPercent:-4,adaptationEvidenceScore:20,dataQualityScore:45,unitCostIndex:8},note:'A curated dataset with held-out evaluation separates training material from proof of improvement.'},
        'synthetic-curated':{effects:{residualTaskGapPercent:-6,adaptationEvidenceScore:25,dataQualityScore:40,unitCostIndex:12},note:'Synthetic data can expand coverage only when generation, filtering and held-out evaluation are independently controlled.'}
      }},
      method:{actionType:'SET_ADAPTATION_METHOD',initial:'prompt-rag-only',options:{
        'prompt-rag-only':{effects:{},note:'Keep the simpler system when measured non-training changes close the task gap.'},
        lora:{effects:{residualTaskGapPercent:-14,adaptationEvidenceScore:10,servingComplexityScore:20,unitCostIndex:15},note:'LoRA adds a small trainable adapter while freezing the base model, reducing training and storage cost relative to full fine-tuning.'},
        qlora:{effects:{residualTaskGapPercent:-13,adaptationEvidenceScore:8,servingComplexityScore:26,unitCostIndex:8},note:'QLoRA combines quantization with LoRA-style adaptation, trading more implementation constraints for lower training memory.'},
        'full-finetune':{effects:{residualTaskGapPercent:-16,adaptationEvidenceScore:12,servingComplexityScore:60,unitCostIndex:60},note:'Full fine-tuning can change more parameters, but carries much higher training, storage and serving consequences.'}
      }},
      serving:{actionType:'SET_ADAPTATION_SERVING',initial:'dedicated-copy',options:{
        'dedicated-copy':{effects:{},note:'A dedicated model copy is simple conceptually but multiplies storage and deployment cost across variants.'},
        'adapter-serving':{effects:{adaptationEvidenceScore:5,servingComplexityScore:-5,unitCostIndex:-7},note:'Adapter-aware serving can reuse one base model while loading task-specific adapters.'},
        'multi-adapter-router':{effects:{adaptationEvidenceScore:8,servingComplexityScore:8,unitCostIndex:-12},note:'Multi-adapter routing saves duplication but adds routing, compatibility and lifecycle complexity.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'residualTaskGapPercent','adaptationEvidenceScore','dataQualityScore','servingComplexityScore');m.unitCostIndex=Math.max(0,m.unitCostIndex);},
    classify(m){if(m.residualTaskGapPercent>8)return 'TASK_GAP_NOT_CLOSED';if(m.adaptationEvidenceScore<80)return 'ADAPTATION_EVIDENCE_WEAK';if(m.dataQualityScore<75)return 'TRAINING_DATA_UNTRUSTED';if(m.servingComplexityScore>55)return 'SERVING_COMPLEXITY_TOO_HIGH';if(m.unitCostIndex>90)return 'ADAPTATION_TOO_EXPENSIVE';return 'ADAPTATION_READY';},
    evidence:{brief:{task:'Persistent domain classification + style behavior',baseline:'Prompt/RAG improves factual grounding but leaves a repeatable behavior gap.',decision:'Choose the least complex adaptation that closes a measured gap.'},artifacts:{candidateExamples:18000,heldOutExamples:0,variantsExpected:6},signals:{peftAvailable:true,quantizedPeftAvailable:true,adapterServingAvailable:true,fullFineTuneNotDefault:true}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'solo-business-operating-system-scenario',title:'Solo Business Operating System Build',
    baseMetrics:{customerEvidenceScore:35,automationFailureRiskPercent:32,supportLoadScore:62,maintenanceHoursPerWeek:18,founderLeverageScore:38},
    controls:{
      research:{actionType:'SET_SOLO_RESEARCH',initial:'intuition-only',options:{
        'intuition-only':{effects:{},note:'Automating an unvalidated customer problem scales uncertainty, not value.'},
        'evidence-loop':{effects:{customerEvidenceScore:45,founderLeverageScore:8,maintenanceHoursPerWeek:2},note:'A recurring evidence loop connects customer conversations, usage and revenue signals to product decisions.'}
      }},
      workflow:{actionType:'SET_SOLO_WORKFLOW',initial:'chat-tabs',options:{
        'chat-tabs':{effects:{},note:'A collection of chat tabs has no durable state, owner, trigger or recovery semantics.'},
        'durable-workflow':{effects:{automationFailureRiskPercent:-10,supportLoadScore:-10,maintenanceHoursPerWeek:4,founderLeverageScore:16},note:'A durable workflow records trigger, state, action, exception and completion rather than relying on memory.'}
      }},
      automation:{actionType:'SET_SOLO_AUTOMATION',initial:'manual-everything',options:{
        'manual-everything':{effects:{},note:'Manual operation preserves control but caps founder leverage and creates repetitive support load.'},
        'bounded-automation':{effects:{automationFailureRiskPercent:-12,supportLoadScore:-20,maintenanceHoursPerWeek:4,founderLeverageScore:32},note:'Bounded automation targets repeatable, reversible work while keeping exception paths explicit.'},
        'auto-everything':{effects:{automationFailureRiskPercent:22,supportLoadScore:-8,maintenanceHoursPerWeek:18,founderLeverageScore:45},note:'Automating every function increases theoretical leverage while creating a large maintenance and exception surface.'}
      }},
      review:{actionType:'SET_SOLO_REVIEW',initial:'no-gates',options:{
        'no-gates':{effects:{},note:'Without review boundaries, marketing, support and account actions inherit the same autonomy level.'},
        'risk-gates':{effects:{automationFailureRiskPercent:-12,supportLoadScore:4,maintenanceHoursPerWeek:3,founderLeverageScore:-2},note:'Risk gates reserve human review for consequential or low-confidence actions.'},
        'exception-queue':{effects:{automationFailureRiskPercent:-10,supportLoadScore:-5,maintenanceHoursPerWeek:6,founderLeverageScore:4},note:'An exception queue centralizes unresolved work, but becomes another system the founder must maintain.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'customerEvidenceScore','automationFailureRiskPercent','supportLoadScore','founderLeverageScore');m.maintenanceHoursPerWeek=Math.max(0,m.maintenanceHoursPerWeek);},
    classify(m){if(m.customerEvidenceScore<75)return 'CUSTOMER_SIGNAL_WEAK';if(m.automationFailureRiskPercent>10)return 'AUTOMATION_BOUNDARY_UNSAFE';if(m.supportLoadScore>45)return 'FOUNDER_STILL_THE_QUEUE';if(m.maintenanceHoursPerWeek>32)return 'AUTOMATION_MAINTENANCE_TRAP';if(m.founderLeverageScore<70)return 'LEVERAGE_TOO_LOW';return 'SOLO_OPERATING_SYSTEM_READY';},
    evidence:{brief:{business:'One-person AI software business',channels:['product','content','sales','support','analytics'],failure:'Dozens of AI automations exist, but exceptions and maintenance now consume more time than the manual work they replaced.'},artifacts:{automations:23,weeklyExceptions:71,unownedWorkflows:14},signals:{customerSignalFragmented:true,highRiskActionsExist:true,reversibleWorkCanBeAutomated:true}}
  });
})(typeof window!=='undefined'?window:globalThis);
