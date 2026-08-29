(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerDecisionExperienceScenario!=='function')throw new Error('Decision Experience scenario factory must load before Content Wave 1 scenarios.');

  const clamp=(metrics,key,min,max)=>{metrics[key]=Math.max(min,Math.min(max,metrics[key]));};

  AhaFrame.registerDecisionExperienceScenario({
    id:'ai-code-review-scenario',
    title:'AI Code Review Mission',
    baseMetrics:{regressionRiskPercent:34,testEvidenceScore:44,architectureDriftPercent:28,reviewMinutes:5,mergeConfidenceScore:46},
    controls:{
      'review-depth':{actionType:'SET_REVIEW_DEPTH',initial:'accept-output',options:{
        'accept-output':{effects:{},note:'Treating a passing diff as sufficient evidence leaves hidden behavior and architecture risk unchecked.'},
        'diff-review':{effects:{regressionRiskPercent:-10,testEvidenceScore:8,architectureDriftPercent:-6,reviewMinutes:6,mergeConfidenceScore:10},note:'Line-by-line diff review catches local mistakes but can miss repository-level regressions.'},
        'architecture-review':{effects:{regressionRiskPercent:-18,testEvidenceScore:12,architectureDriftPercent:-18,reviewMinutes:12,mergeConfidenceScore:17},note:'Reviewing contracts and architecture exposes changes that compile but violate system boundaries.'}
      }},
      'test-strategy':{actionType:'SET_TEST_STRATEGY',initial:'existing-only',options:{
        'existing-only':{effects:{},note:'Existing tests encode yesterday’s assumptions and may not cover the generated change.'},
        'targeted':{effects:{regressionRiskPercent:-9,testEvidenceScore:22,reviewMinutes:7,mergeConfidenceScore:14},note:'Targeted tests convert the requested behavior and nearby failure modes into evidence.'},
        'adversarial':{effects:{regressionRiskPercent:-13,testEvidenceScore:30,reviewMinutes:13,mergeConfidenceScore:18},note:'Adversarial cases improve confidence but cost more review time.'}
      }},
      'scope-policy':{actionType:'SET_SCOPE_POLICY',initial:'unbounded',options:{
        'unbounded':{effects:{},note:'An agent changing unrelated files increases review surface and architecture drift.'},
        'bounded':{effects:{regressionRiskPercent:-6,architectureDriftPercent:-9,reviewMinutes:2,mergeConfidenceScore:7},note:'Bounding touched areas makes intent easier to verify.'},
        'spec-locked':{effects:{regressionRiskPercent:-9,architectureDriftPercent:-13,reviewMinutes:4,mergeConfidenceScore:10},note:'A written change contract gives reviewers a stable target for judging the diff.'}
      }},
      'dependency-check':{actionType:'SET_DEPENDENCY_CHECK',initial:'off',options:{
        'off':{effects:{},note:'Generated dependency changes may introduce unsupported or hallucinated packages.'},
        'lockfile':{effects:{regressionRiskPercent:-4,testEvidenceScore:5,reviewMinutes:2,mergeConfidenceScore:5},note:'Lockfile review catches silent dependency additions and version movement.'},
        'provenance':{effects:{regressionRiskPercent:-7,testEvidenceScore:8,reviewMinutes:5,mergeConfidenceScore:8},note:'Checking package provenance and repository fit raises confidence in generated dependency choices.'}
      }}
    },
    normalizeMetrics(metrics){
      clamp(metrics,'regressionRiskPercent',0,100);clamp(metrics,'testEvidenceScore',0,100);clamp(metrics,'architectureDriftPercent',0,100);clamp(metrics,'mergeConfidenceScore',0,100);
    },
    classify(metrics){
      if(metrics.architectureDriftPercent>10)return 'ARCHITECTURE_REGRESSION';
      if(metrics.regressionRiskPercent>12)return 'REGRESSION_RISK';
      if(metrics.testEvidenceScore<78)return 'INSUFFICIENT_TEST_EVIDENCE';
      if(metrics.reviewMinutes>28)return 'SAFE_BUT_TOO_SLOW';
      return 'MERGE_READY';
    },
    evidence:{
      brief:{changedFiles:17,testsInitiallyPassing:true,hiddenRisk:'Generated cache invalidation bypasses the repository transaction boundary.'},
      artifacts:{diffSummary:['API handler changed','cache helper changed','new package added','migration untouched'],reviewQuestion:'Would you merge because tests pass?'},
      signals:{existingTests:'green',architectureContract:'cache writes must occur after durable commit',dependencyPolicy:'new runtime packages require provenance review'}
    }
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'research-evidence-scenario',
    title:'Research Evidence Mission',
    baseMetrics:{unsupportedClaimRiskPercent:42,sourceDiversityScore:36,verifiabilityScore:38,staleEvidenceRiskPercent:28,researchMinutes:18},
    controls:{
      'source-mix':{actionType:'SET_SOURCE_MIX',initial:'search-snippets',options:{
        'search-snippets':{effects:{},note:'Snippets are discovery aids, not durable evidence for substantive claims.'},
        'primary-plus-secondary':{effects:{unsupportedClaimRiskPercent:-11,sourceDiversityScore:28,verifiabilityScore:18,researchMinutes:8},note:'Combining primary material with independent reporting gives both authority and context.'},
        'primary-first':{effects:{unsupportedClaimRiskPercent:-15,sourceDiversityScore:18,verifiabilityScore:24,researchMinutes:10},note:'Primary-first sourcing improves traceability but still benefits from independent challenge.'}
      }},
      'triangulation':{actionType:'SET_TRIANGULATION',initial:'single-source',options:{
        'single-source':{effects:{},note:'One source can be internally coherent and still wrong, promotional, or outdated.'},
        'two-source':{effects:{unsupportedClaimRiskPercent:-10,sourceDiversityScore:16,verifiabilityScore:10,researchMinutes:6},note:'A second independent source exposes many contradictions.'},
        'claim-specific':{effects:{unsupportedClaimRiskPercent:-16,sourceDiversityScore:22,verifiabilityScore:18,researchMinutes:11},note:'Triangulating the high-impact claims rather than every sentence keeps effort focused.'}
      }},
      'claim-matrix':{actionType:'SET_CLAIM_MATRIX',initial:'notes-only',options:{
        'notes-only':{effects:{},note:'Free-form notes make it hard to see which claims lack support.'},
        'claim-evidence':{effects:{unsupportedClaimRiskPercent:-12,verifiabilityScore:25,researchMinutes:8},note:'A claim-evidence matrix makes unsupported statements visible before synthesis.'},
        'claim-evidence-counter':{effects:{unsupportedClaimRiskPercent:-16,sourceDiversityScore:8,verifiabilityScore:30,researchMinutes:12},note:'Recording counter-evidence reduces confirmation bias in synthesis.'}
      }},
      'freshness-check':{actionType:'SET_FRESHNESS_CHECK',initial:'off',options:{
        'off':{effects:{},note:'Recent-looking pages can repeat stale facts.'},
        'date-filter':{effects:{staleEvidenceRiskPercent:-15,verifiabilityScore:7,researchMinutes:3},note:'Date checks reduce stale evidence but do not establish authority.'},
        'event-date':{effects:{staleEvidenceRiskPercent:-22,verifiabilityScore:11,researchMinutes:6},note:'Separating publication date from event date prevents timeline errors.'}
      }}
    },
    normalizeMetrics(metrics){
      clamp(metrics,'unsupportedClaimRiskPercent',0,100);clamp(metrics,'sourceDiversityScore',0,100);clamp(metrics,'verifiabilityScore',0,100);clamp(metrics,'staleEvidenceRiskPercent',0,100);
    },
    classify(metrics){
      if(metrics.unsupportedClaimRiskPercent>12)return 'UNSUPPORTED_CLAIMS';
      if(metrics.staleEvidenceRiskPercent>10)return 'STALE_EVIDENCE';
      if(metrics.sourceDiversityScore<65)return 'SOURCE_CONCENTRATION';
      if(metrics.verifiabilityScore<78)return 'LOW_VERIFIABILITY';
      if(metrics.researchMinutes>50)return 'VERIFIABLE_BUT_TOO_SLOW';
      return 'EVIDENCE_READY';
    },
    evidence:{
      brief:{task:'Prepare a decision memo on a fast-moving AI product claim.',failure:'The first draft confidently repeats a vendor claim that changed two weeks later.'},
      artifacts:{draftClaims:['The feature is generally available.','The benchmark reflects production behavior.','The pricing applies to all regions.'],warning:'Two claims currently rely on a single vendor snippet.'},
      signals:{primarySource:'vendor documentation',secondarySource:'independent reporting',timeSensitivity:'high'}
    }
  });

  AhaFrame.registerDecisionExperienceScenario({
    id:'data-analysis-verification-scenario',
    title:'Data Analysis Verification Lab',
    baseMetrics:{analysisErrorRiskPercent:36,verifiedRowsPercent:28,coveragePercent:64,confidenceVariancePercent:34,reviewMinutes:12},
    controls:{
      'extraction-mode':{actionType:'SET_EXTRACTION_MODE',initial:'model-only',options:{
        'model-only':{effects:{},note:'Model-only extraction can silently normalize malformed values.'},
        'schema-validated':{effects:{analysisErrorRiskPercent:-11,verifiedRowsPercent:20,coveragePercent:8,reviewMinutes:5},note:'Schema validation makes missing and malformed fields observable.'},
        'dual-pass':{effects:{analysisErrorRiskPercent:-15,verifiedRowsPercent:28,coveragePercent:10,confidenceVariancePercent:-6,reviewMinutes:9},note:'Independent extraction passes expose disagreements before aggregation.'}
      }},
      'numeric-check':{actionType:'SET_NUMERIC_CHECK',initial:'none',options:{
        'none':{effects:{},note:'Generated arithmetic should not be trusted because the prose sounds confident.'},
        'recompute':{effects:{analysisErrorRiskPercent:-12,verifiedRowsPercent:26,confidenceVariancePercent:-5,reviewMinutes:6},note:'Recomputing derived values separates model interpretation from arithmetic truth.'},
        'recompute-sample':{effects:{analysisErrorRiskPercent:-8,verifiedRowsPercent:17,confidenceVariancePercent:-3,reviewMinutes:3},note:'Sampling is faster but can miss localized calculation failures.'}
      }},
      'outlier-policy':{actionType:'SET_OUTLIER_POLICY',initial:'ignore',options:{
        'ignore':{effects:{},note:'Ignoring outliers can hide extraction errors or the most important business signal.'},
        'flag':{effects:{analysisErrorRiskPercent:-6,coveragePercent:7,confidenceVariancePercent:-7,reviewMinutes:3},note:'Flagging preserves the row while making it reviewable.'},
        'investigate':{effects:{analysisErrorRiskPercent:-10,verifiedRowsPercent:10,coveragePercent:10,confidenceVariancePercent:-12,reviewMinutes:8},note:'Investigating outliers distinguishes genuine extremes from parsing errors.'}
      }},
      'confidence-policy':{actionType:'SET_CONFIDENCE_POLICY',initial:'single-score',options:{
        'single-score':{effects:{},note:'A single confidence score can conceal where uncertainty comes from.'},
        'by-step':{effects:{analysisErrorRiskPercent:-5,confidenceVariancePercent:-12,reviewMinutes:4},note:'Step-level confidence localizes extraction, calculation, and interpretation uncertainty.'},
        'evidence-linked':{effects:{analysisErrorRiskPercent:-8,verifiedRowsPercent:8,confidenceVariancePercent:-18,reviewMinutes:7},note:'Linking uncertainty to evidence makes review actionable.'}
      }}
    },
    normalizeMetrics(metrics){
      clamp(metrics,'analysisErrorRiskPercent',0,100);clamp(metrics,'verifiedRowsPercent',0,100);clamp(metrics,'coveragePercent',0,100);clamp(metrics,'confidenceVariancePercent',0,100);
    },
    classify(metrics){
      if(metrics.analysisErrorRiskPercent>10)return 'ANALYSIS_NOT_VERIFIED';
      if(metrics.verifiedRowsPercent<75)return 'INSUFFICIENT_ROW_VERIFICATION';
      if(metrics.coveragePercent<82)return 'COVERAGE_GAP';
      if(metrics.confidenceVariancePercent>15)return 'UNRESOLVED_UNCERTAINTY';
      if(metrics.reviewMinutes>40)return 'VERIFIED_BUT_TOO_SLOW';
      return 'ANALYSIS_VERIFIED';
    },
    evidence:{
      brief:{dataset:'Quarterly operating report with tables, footnotes and one malformed percentage.',question:'Which segment actually improved operating efficiency?'},
      artifacts:{modelSummary:'Segment B improved the most.',hiddenIssue:'One denominator was extracted from the wrong table row.'},
      signals:{groundTruthRows:25,knownOutlierRows:2,derivedMetric:'operating expense / revenue'}
    }
  });
})(typeof window!=='undefined'?window:globalThis);
