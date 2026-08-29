(function(root){
  'use strict';
  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerDecisionExperienceScenario!=='function')throw new Error('Decision Experience scenario factory must load before Content Wave 2 scenarios.');
  const clamp=(m,k,min,max)=>{m[k]=Math.max(min,Math.min(max,m[k]));};
  const clampPercent=(m,...keys)=>keys.forEach((k)=>clamp(m,k,0,100));

  AhaFrame.registerDecisionExperienceScenario({
    id:'structured-output-contract-scenario',title:'Structured Output Contract Lab',
    baseMetrics:{malformedOutputRiskPercent:38,semanticContractRiskPercent:32,contractCoverageScore:36,retryAmplification:1.8,latencyMs:850},
    controls:{
      contract:{actionType:'SET_CONTRACT',initial:'prompt-only',options:{
        'prompt-only':{effects:{},note:'Natural-language formatting requests are not machine-verifiable contracts.'},
        'json-schema':{effects:{malformedOutputRiskPercent:-22,semanticContractRiskPercent:-8,contractCoverageScore:28,latencyMs:20},note:'A JSON Schema makes shape constraints explicit and testable.'},
        'versioned-schema':{effects:{malformedOutputRiskPercent:-25,semanticContractRiskPercent:-12,contractCoverageScore:36,latencyMs:30},note:'Versioning the schema lets producers and consumers evolve without guessing contract drift.'}
      }},
      validation:{actionType:'SET_VALIDATION',initial:'parse-only',options:{
        'parse-only':{effects:{},note:'Valid JSON can still violate business semantics.'},
        'schema':{effects:{malformedOutputRiskPercent:-10,semanticContractRiskPercent:-6,contractCoverageScore:16,latencyMs:25},note:'Schema validation rejects malformed structure before downstream code sees it.'},
        'schema-semantic':{effects:{malformedOutputRiskPercent:-10,semanticContractRiskPercent:-18,contractCoverageScore:24,latencyMs:55},note:'Semantic checks validate domain rules that shape validation cannot express.'}
      }},
      repair:{actionType:'SET_REPAIR',initial:'blind-retry',options:{
        'blind-retry':{effects:{malformedOutputRiskPercent:-6,retryAmplification:1,latencyMs:500},note:'Blind retries can repeat the same failure while amplifying latency and cost.'},
        'validation-guided':{effects:{malformedOutputRiskPercent:-8,semanticContractRiskPercent:-5,contractCoverageScore:5,retryAmplification:-0.2,latencyMs:180},note:'Feeding validation failures back to the model makes repair targeted.'},
        'bounded-repair':{effects:{malformedOutputRiskPercent:-10,semanticContractRiskPercent:-7,contractCoverageScore:8,retryAmplification:-0.5,latencyMs:100},note:'A bounded repair loop prevents malformed output from becoming an unbounded retry policy.'}
      }},
      streaming:{actionType:'SET_STREAMING_CONTRACT',initial:'raw',options:{
        raw:{effects:{},note:'Streaming raw partial JSON exposes consumers to incomplete state.'},
        buffered:{effects:{malformedOutputRiskPercent:-5,contractCoverageScore:6,latencyMs:100},note:'Buffer-then-validate trades some latency for a clean contract boundary.'},
        incremental:{effects:{malformedOutputRiskPercent:-7,contractCoverageScore:8,latencyMs:50},note:'Incremental structured delivery requires explicit partial-state semantics.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'malformedOutputRiskPercent','semanticContractRiskPercent','contractCoverageScore');m.retryAmplification=Math.max(1,m.retryAmplification);},
    classify(m){if(m.malformedOutputRiskPercent>8)return 'MALFORMED_OUTPUT';if(m.semanticContractRiskPercent>10)return 'SEMANTIC_CONTRACT_GAP';if(m.contractCoverageScore<80)return 'UNDER_SPECIFIED_CONTRACT';if(m.retryAmplification>2)return 'RETRY_AMPLIFICATION';if(m.latencyMs>1300)return 'CONTRACT_TOO_EXPENSIVE';return 'CONTRACT_READY';},
    evidence:{brief:{producer:'LLM extraction endpoint',consumer:'order workflow',failure:'Valid-looking JSON omitted a required business invariant and triggered a downstream exception.'},artifacts:{sample:'{"orderId":"A-17","items":[]}',consumerAssumption:'items must contain at least one validated line item'},signals:{parseSuccess:true,schemaVersion:'none',repairAttempts:3}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'mcp-capability-boundary-scenario',title:'MCP Capability Boundary Mission',
    baseMetrics:{unauthorizedCapabilityRiskPercent:44,blastRadiusScore:62,auditCoverageScore:30,capabilityDriftPercent:40,operatorFrictionScore:8},
    controls:{
      discovery:{actionType:'SET_MCP_DISCOVERY',initial:'implicit',options:{
        implicit:{effects:{},note:'Assuming a fixed capability surface hides server drift and weakens policy review.'},
        'server-discover':{effects:{unauthorizedCapabilityRiskPercent:-12,auditCoverageScore:18,capabilityDriftPercent:-25,operatorFrictionScore:4},note:'Current MCP capability discovery should be explicit and policy-filtered.'},
        'gateway-allowlist':{effects:{unauthorizedCapabilityRiskPercent:-16,auditCoverageScore:22,capabilityDriftPercent:-28,operatorFrictionScore:7},note:'A gateway-owned allowlist makes capability exposure an application policy rather than a server default.'}
      }},
      authorization:{actionType:'SET_MCP_AUTH',initial:'shared-token',options:{
        'shared-token':{effects:{},note:'A broad shared identity makes every capability inherit the same blast radius.'},
        'scoped-identity':{effects:{unauthorizedCapabilityRiskPercent:-16,blastRadiusScore:-16,auditCoverageScore:12,operatorFrictionScore:5},note:'Scoped identity separates caller authority by workload.'},
        'least-privilege':{effects:{unauthorizedCapabilityRiskPercent:-22,blastRadiusScore:-25,auditCoverageScore:18,operatorFrictionScore:9},note:'Least privilege binds identity, resource scope and allowed operation.'}
      }},
      sideEffects:{actionType:'SET_MCP_SIDE_EFFECTS',initial:'direct',options:{
        direct:{effects:{},note:'Direct side effects let a model turn a planning error into an external action.'},
        confirm:{effects:{unauthorizedCapabilityRiskPercent:-8,blastRadiusScore:-17,auditCoverageScore:15,operatorFrictionScore:7},note:'Confirmation is appropriate for consequential actions, not every read.'},
        'dry-run-approval':{effects:{unauthorizedCapabilityRiskPercent:-12,blastRadiusScore:-25,auditCoverageScore:20,operatorFrictionScore:12},note:'Dry-run plus approval exposes intent and effect before execution.'}
      }},
      longWork:{actionType:'SET_MCP_LONG_WORK',initial:'blocking-core',options:{
        'blocking-core':{effects:{},note:'Treating long-running work as a blocking core request couples protocol transport to job lifecycle.'},
        'tasks-extension':{effects:{blastRadiusScore:-5,auditCoverageScore:8,capabilityDriftPercent:-5,operatorFrictionScore:3},note:'Long-running work belongs behind the Tasks extension boundary rather than an implicit session.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'unauthorizedCapabilityRiskPercent','blastRadiusScore','auditCoverageScore','capabilityDriftPercent','operatorFrictionScore');},
    classify(m){if(m.unauthorizedCapabilityRiskPercent>8)return 'CAPABILITY_OVEREXPOSURE';if(m.blastRadiusScore>18)return 'SIDE_EFFECT_BLAST_RADIUS';if(m.auditCoverageScore<80)return 'INSUFFICIENT_AUDITABILITY';if(m.capabilityDriftPercent>12)return 'CAPABILITY_DRIFT';if(m.operatorFrictionScore>38)return 'CONTROL_OVERLOAD';return 'CAPABILITY_BOUNDARY_READY';},
    evidence:{brief:{currentSpecVersion:'2026-07-28',protocolMode:'stateless request/response',deprecatedMentalModel:'initialize/session-bound capability state'},artifacts:{requestedAction:'issue customer refund and update CRM',availableCapabilities:['read_order','refund_order','update_crm','export_customers'],risk:'one broad identity can invoke every side effect'},signals:{authorizationRequired:true,capabilityDiscovery:'explicit',longRunningWork:'Tasks extension'}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'long-running-agent-recovery-scenario',title:'Long-running Agent Recovery Mission',
    baseMetrics:{stateLossRiskPercent:48,duplicateWorkRiskPercent:38,recoveryScore:22,cancelLatencySeconds:240,costIndex:100},
    controls:{
      persistence:{actionType:'SET_PERSISTENCE',initial:'memory-only',options:{
        'memory-only':{effects:{},note:'Process memory is not durable workflow state.'},
        checkpoint:{effects:{stateLossRiskPercent:-24,recoveryScore:32,costIndex:8},note:'Checkpointing creates a restart boundary but must define what is safe to replay.'},
        'durable-events':{effects:{stateLossRiskPercent:-35,recoveryScore:45,costIndex:15},note:'Durable step/event state provides a reconstructable execution history.'}
      }},
      idempotency:{actionType:'SET_LONG_IDEMPOTENCY',initial:'none',options:{
        none:{effects:{},note:'A resumed workflow can duplicate tool side effects.'},
        operation:{effects:{duplicateWorkRiskPercent:-24,recoveryScore:8,costIndex:4},note:'Operation-level idempotency protects coarse retries.'},
        step:{effects:{duplicateWorkRiskPercent:-30,recoveryScore:12,costIndex:6},note:'Step-level idempotency lets recovery replay only what is safe.'}
      }},
      resume:{actionType:'SET_RESUME',initial:'restart',options:{
        restart:{effects:{},note:'Restart-from-zero wastes completed work and repeats side effects.'},
        checkpoint:{effects:{stateLossRiskPercent:-10,recoveryScore:24,costIndex:-20},note:'Checkpoint resume avoids replaying the whole job.'},
        'verified-step':{effects:{stateLossRiskPercent:-12,duplicateWorkRiskPercent:-6,recoveryScore:32,costIndex:-24},note:'Verified-step resume checks durable completion before continuing.'}
      }},
      cancellation:{actionType:'SET_CANCELLATION',initial:'ignore',options:{
        ignore:{effects:{},note:'Ignoring cancellation lets obsolete jobs keep spending and acting.'},
        cooperative:{effects:{recoveryScore:5,cancelLatencySeconds:-180},note:'Cooperative cancellation gives steps a chance to stop safely.'},
        bounded:{effects:{recoveryScore:8,cancelLatencySeconds:-215,costIndex:3},note:'Bounded cancellation defines a maximum time before the system stops or isolates work.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'stateLossRiskPercent','duplicateWorkRiskPercent','recoveryScore');m.cancelLatencySeconds=Math.max(0,m.cancelLatencySeconds);m.costIndex=Math.max(0,m.costIndex);},
    classify(m){if(m.stateLossRiskPercent>10)return 'STATE_NOT_DURABLE';if(m.duplicateWorkRiskPercent>10)return 'REPLAY_SIDE_EFFECT_RISK';if(m.recoveryScore<85)return 'RECOVERY_INCOMPLETE';if(m.cancelLatencySeconds>60)return 'CANCELLATION_UNBOUNDED';if(m.costIndex>120)return 'RECOVERY_TOO_EXPENSIVE';return 'RECOVERY_READY';},
    evidence:{brief:{job:'Process 2,000 documents, enrich records and write approved updates',failureAt:'step 613',completedSideEffects:147},artifacts:{processRestarted:true,checkpointPresent:false,duplicateWritesObserved:11},signals:{workerCanDisappear:true,userCanCancel:true,externalToolsAreNotTransactional:true}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'write-book-with-ai-scenario',title:'Write a Book with AI Build',
    baseMetrics:{unsupportedClaimRiskPercent:35,consistencyDriftPercent:42,sourceTraceabilityScore:30,editorialConsistencyScore:45,revisionHours:28},
    controls:{
      research:{actionType:'SET_BOOK_RESEARCH',initial:'chat-only',options:{
        'chat-only':{effects:{},note:'A model conversation is not a source base.'},
        'source-library':{effects:{unsupportedClaimRiskPercent:-11,sourceTraceabilityScore:18,revisionHours:4},note:'A source library makes research reusable across chapters.'},
        'authority-library':{effects:{unsupportedClaimRiskPercent:-15,sourceTraceabilityScore:25,revisionHours:6},note:'Authority-tagged sources distinguish primary evidence, secondary context and personal synthesis.'}
      }},
      outline:{actionType:'SET_BOOK_OUTLINE',initial:'chapter-list',options:{
        'chapter-list':{effects:{},note:'A list of chapter names does not encode argument dependencies.'},
        'argument-map':{effects:{consistencyDriftPercent:-18,editorialConsistencyScore:12,revisionHours:-5},note:'An argument map gives each chapter a job and dependency.'}
      }},
      context:{actionType:'SET_BOOK_CONTEXT',initial:'full-manuscript',options:{
        'full-manuscript':{effects:{},note:'Stuffing the full manuscript into context does not guarantee the right facts or voice stay salient.'},
        'chapter-briefs':{effects:{consistencyDriftPercent:-16,sourceTraceabilityScore:8,editorialConsistencyScore:16,revisionHours:-4},note:'Chapter briefs carry only the relevant thesis, sources, terminology and unresolved questions.'}
      }},
      verification:{actionType:'SET_BOOK_VERIFICATION',initial:'polish-only',options:{
        'polish-only':{effects:{},note:'Prose polishing cannot verify claims or cross-chapter consistency.'},
        'claim-check':{effects:{unsupportedClaimRiskPercent:-14,sourceTraceabilityScore:24,editorialConsistencyScore:5,revisionHours:6},note:'Claim checking separates factual verification from editorial revision.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'unsupportedClaimRiskPercent','consistencyDriftPercent','sourceTraceabilityScore','editorialConsistencyScore');m.revisionHours=Math.max(0,m.revisionHours);},
    classify(m){if(m.unsupportedClaimRiskPercent>8)return 'BOOK_CLAIMS_UNVERIFIED';if(m.consistencyDriftPercent>10)return 'LONG_FORM_DRIFT';if(m.sourceTraceabilityScore<80)return 'SOURCE_TRACE_GAP';if(m.editorialConsistencyScore<75)return 'VOICE_AND_ARGUMENT_DRIFT';if(m.revisionHours>35)return 'REVISION_TOO_EXPENSIVE';return 'MANUSCRIPT_SYSTEM_READY';},
    evidence:{brief:{goal:'Produce a 10-chapter evidence-based book with a consistent thesis and voice.',failure:'Chapter drafts are individually fluent but contradict terminology and repeat unsupported claims.'},artifacts:{chapters:10,sourcesCollected:64,sourceLinksInDraft:9},signals:{longContextAvailable:true,longContextSufficient:false,publicationRequiresFactChecking:true}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'knowledge-base-build-scenario',title:'Build an AI Knowledge Base',
    baseMetrics:{staleAnswerRiskPercent:32,retrievalQualityScore:48,authorityAlignmentScore:40,updateLatencyHours:72,evaluationCoverageScore:20},
    controls:{
      ingestion:{actionType:'SET_KB_INGESTION',initial:'dump-all',options:{
        'dump-all':{effects:{},note:'A document dump treats every source as equally authoritative and current.'},
        'authority-aware':{effects:{staleAnswerRiskPercent:-8,authorityAlignmentScore:28,updateLatencyHours:8},note:'Authority and ownership metadata let retrieval resolve source conflicts deliberately.'}
      }},
      retrieval:{actionType:'SET_KB_RETRIEVAL',initial:'vector-only',options:{
        'vector-only':{effects:{},note:'Semantic similarity alone can miss exact identifiers and rank weak sources highly.'},
        hybrid:{effects:{retrievalQualityScore:20,authorityAlignmentScore:6,updateLatencyHours:4},note:'Hybrid retrieval combines semantic and lexical evidence.'},
        'hybrid-rerank':{effects:{retrievalQualityScore:28,authorityAlignmentScore:10,updateLatencyHours:8},note:'Reranking lets the system evaluate relevance after broad candidate recall.'}
      }},
      freshness:{actionType:'SET_KB_FRESHNESS',initial:'batch-weekly',options:{
        'batch-weekly':{effects:{},note:'A weekly refresh can be too stale for operational knowledge.'},
        'incremental-sync':{effects:{staleAnswerRiskPercent:-18,updateLatencyHours:-40},note:'Incremental sync shrinks the window where retrieved knowledge lags the source of truth.'}
      }},
      evaluation:{actionType:'SET_KB_EVALUATION',initial:'spot-check',options:{
        'spot-check':{effects:{},note:'A few demo questions cannot characterize retrieval failure modes.'},
        'failure-set':{effects:{retrievalQualityScore:8,authorityAlignmentScore:8,evaluationCoverageScore:55,updateLatencyHours:6},note:'A versioned failure set makes retrieval changes measurable.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'staleAnswerRiskPercent','retrievalQualityScore','authorityAlignmentScore','evaluationCoverageScore');m.updateLatencyHours=Math.max(0,m.updateLatencyHours);},
    classify(m){if(m.staleAnswerRiskPercent>10)return 'KNOWLEDGE_TOO_STALE';if(m.retrievalQualityScore<80)return 'RETRIEVAL_WEAK';if(m.authorityAlignmentScore<75)return 'SOURCE_AUTHORITY_CONFLICT';if(m.updateLatencyHours>60)return 'UPDATE_PIPELINE_SLOW';if(m.evaluationCoverageScore<70)return 'RETRIEVAL_UNEVALUATED';return 'KNOWLEDGE_SYSTEM_READY';},
    evidence:{brief:{corpus:'4,800 product, policy and support documents',conflict:'three documents define different refund windows'},artifacts:{vectorRecall:'high',wrongAuthorityAnswers:17,stalePolicyAnswers:9},signals:{sourceOfTruthExists:true,documentFreshnessVaries:true,exactIdentifiersMatter:true}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'customer-support-build-scenario',title:'AI Customer Support Build',
    baseMetrics:{incorrectActionRiskPercent:38,resolutionScore:48,escalationLoadScore:18,auditCoverageScore:35,costIndex:42},
    controls:{
      grounding:{actionType:'SET_SUPPORT_GROUNDING',initial:'chat-memory',options:{
        'chat-memory':{effects:{},note:'Conversation memory cannot replace the support source of truth.'},
        'authority-rag':{effects:{incorrectActionRiskPercent:-12,resolutionScore:10,auditCoverageScore:10,costIndex:4},note:'Authority-aware retrieval grounds policy answers in current support knowledge.'}
      }},
      tools:{actionType:'SET_SUPPORT_TOOLS',initial:'broad-tools',options:{
        'broad-tools':{effects:{},note:'Giving the agent broad mutation tools turns an answer error into an account action error.'},
        'scoped-tools':{effects:{incorrectActionRiskPercent:-14,resolutionScore:12,auditCoverageScore:18,costIndex:6},note:'Scoped tools expose only the minimum action surface for the current support intent.'}
      }},
      autonomy:{actionType:'SET_SUPPORT_AUTONOMY',initial:'auto-all',options:{
        'auto-all':{effects:{},note:'Not every support action belongs inside autonomous execution.'},
        'approval-by-risk':{effects:{incorrectActionRiskPercent:-10,resolutionScore:6,escalationLoadScore:10,auditCoverageScore:15,costIndex:5},note:'Risk-based approval keeps routine work fast while protecting consequential actions.'}
      }},
      escalation:{actionType:'SET_SUPPORT_ESCALATION',initial:'model-decides',options:{
        'model-decides':{effects:{},note:'A model should not be the only judge of when its uncertainty requires a human.'},
        'confidence-policy':{effects:{incorrectActionRiskPercent:-8,resolutionScore:8,escalationLoadScore:12,auditCoverageScore:12,costIndex:4},note:'Explicit escalation rules combine confidence, intent class and policy exceptions.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'incorrectActionRiskPercent','resolutionScore','escalationLoadScore','auditCoverageScore','costIndex');},
    classify(m){if(m.incorrectActionRiskPercent>8)return 'SUPPORT_ACTION_UNSAFE';if(m.resolutionScore<75)return 'RESOLUTION_TOO_LOW';if(m.escalationLoadScore>45)return 'HUMAN_QUEUE_OVERLOADED';if(m.auditCoverageScore<80)return 'SUPPORT_NOT_AUDITABLE';if(m.costIndex>70)return 'SUPPORT_TOO_EXPENSIVE';return 'SUPPORT_SYSTEM_READY';},
    evidence:{brief:{volumePerDay:1800,intents:['policy question','refund','address change','account recovery'],failure:'Agent issued a refund after retrieving an outdated exception policy.'},artifacts:{policySources:12,mutatingTools:6,humanQueueCapacity:420},signals:{actionsHaveDifferentRisk:true,policyChangesOften:true,auditTrailRequired:true}}
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'course-knowledge-product-scenario',title:'Course / Knowledge Product Build',
    baseMetrics:{objectiveCoverageScore:38,curriculumCoherenceScore:44,editorialDriftPercent:34,mediaDefectPercent:26,provenanceCoverageScore:30,productionHours:24},
    controls:{
      objectives:{actionType:'SET_COURSE_OBJECTIVES',initial:'topic-list',options:{
        'topic-list':{effects:{},note:'A topic list says what appears, not what the learner should be able to do.'},
        measurable:{effects:{objectiveCoverageScore:30,curriculumCoherenceScore:8,productionHours:2},note:'Measurable outcomes create a testable target for generated content.'}
      }},
      curriculum:{actionType:'SET_CURRICULUM_MODEL',initial:'linear-prompts',options:{
        'linear-prompts':{effects:{},note:'Generating lessons one at a time produces repetition and prerequisite drift.'},
        'concept-graph':{effects:{curriculumCoherenceScore:24,objectiveCoverageScore:12,productionHours:4},note:'A concept graph lets lessons reuse knowledge identity while paths remain goal-oriented.'}
      }},
      editorial:{actionType:'SET_EDITORIAL_REVIEW',initial:'model-polish',options:{
        'model-polish':{effects:{},note:'A second generation pass can preserve the same factual and voice errors.'},
        rubric:{effects:{editorialDriftPercent:-22,mediaDefectPercent:-5,productionHours:4},note:'An editorial rubric makes voice, examples, accuracy and pedagogy reviewable.'}
      }},
      provenance:{actionType:'SET_CONTENT_PROVENANCE',initial:'untracked',options:{
        untracked:{effects:{},note:'Untracked source material creates copyright and factual review debt.'},
        'qa-provenance':{effects:{mediaDefectPercent:-17,provenanceCoverageScore:55,editorialDriftPercent:-6,productionHours:7},note:'Source provenance plus media QA separates generation speed from publication quality.'}
      }}
    },
    normalizeMetrics(m){clampPercent(m,'objectiveCoverageScore','curriculumCoherenceScore','editorialDriftPercent','mediaDefectPercent','provenanceCoverageScore');m.productionHours=Math.max(0,m.productionHours);},
    classify(m){if(m.objectiveCoverageScore<75)return 'LEARNING_OBJECTIVES_WEAK';if(m.curriculumCoherenceScore<75)return 'CURRICULUM_FRAGMENTED';if(m.editorialDriftPercent>10)return 'EDITORIAL_DRIFT';if(m.mediaDefectPercent>10)return 'MEDIA_QA_GAP';if(m.provenanceCoverageScore<80)return 'PROVENANCE_GAP';if(m.productionHours>45)return 'PRODUCTION_TOO_EXPENSIVE';return 'KNOWLEDGE_PRODUCT_READY';},
    evidence:{brief:{product:'Bilingual AI engineering course',target:'Learners should transfer concepts into changed production cases',failure:'Fast-generated lessons repeat facts but do not form a coherent learning path.'},artifacts:{lessonsPlanned:42,generatedDrafts:18,reusedConceptIds:4},signals:{bilingualParityRequired:true,mediaAssetsIncluded:true,sourceProvenanceRequired:true}}
  });
})(typeof window!=='undefined'?window:globalThis);
