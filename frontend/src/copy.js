// UI chrome is bilingual (English / Telugu) to demonstrate the multilingual
// architecture end-to-end. Generated legal answers are translated live via
// the backend's translation pipeline (see backend/app/translate.py); if that
// service is unreachable, the UI shows a visible "translation unavailable"
// note rather than silently displaying the wrong language.
export const COPY = {
  en: {
    appName: 'SUTRADHARA',
    tagline: 'AI-Powered IP & Regulatory Intelligence for Ayurveda',
    team: 'Team Chaturya',
    heroLede:
      'The platform connects Ayurvedic products with applicable intellectual-property regimes, regulatory requirements, jurisdiction-specific rules, and authoritative evidence.',
    heroCta: 'Analyze an Ayurvedic Product',

    navAnalyze: 'Analyze',
    navAbs: 'ABS Compliance',
    navTkdl: 'TKDL Check',
    navEvidence: 'Evidence',
    navGraph: 'Knowledge Graph',
    navEval: 'Evaluation',

    inputLabel: 'Describe your Ayurvedic product or IP question',
    placeholder: 'e.g. Can I patent a classical Ayurvedic formulation already described in a traditional text?',
    analyze: 'Analyze',
    analyzing: 'Analyzing…',
    india: 'India',
    international: 'International',
    disclaimer: 'Information, not legal advice.',
    classification: 'Product Classification',
    jurisdiction: 'Jurisdiction',
    applicableAreas: 'Applicable IP & Regulatory Areas',
    assessment: 'AI Assessment',
    sources: 'Evidence & Citations',
    confidence: 'Evidence Confidence',
    escalate: 'Escalate to IP Facilitator',
    needExpert: 'Need expert assistance?',
    detectedLanguage: 'Detected input language',
    retrievalNote: 'Retrieval normalized to',
    evidenceBoundary: 'Evidence Boundary',
    evidenceBoundaryBody: 'Insufficient authoritative evidence to provide a reliable answer.',
    whyAbstained: 'Why the system abstained',
    systemError: 'Analysis service temporarily unavailable. Please try again in a moment.',

    evidencePageTitle: 'Evidence Explorer',
    evidencePageLede: 'Where did the last answer come from? Every source below was actually retrieved from the authoritative corpus for your most recent analysis — nothing here is invented.',
    evidenceEmpty: 'Run an analysis first — retrieved sources for that query will appear here.',

    graphEmpty: 'Knowledge graph data is unavailable from the backend right now.',
    evalEmpty: 'No queries logged yet in this session.',


    absTitle: 'ABS Compliance Check',
    absLede: 'Checks whether a query is likely to trigger Access-and-Benefit-Sharing obligations under the Biological Diversity Act, CBD, and the Nagoya Protocol — and what evidence supports that.',
    absPlaceholder: 'e.g. We want to commercialize a formulation using a biological resource sourced from a specific region in India',
    absButton: 'Check ABS Compliance',
    absEmpty: 'Describe the product or sourcing scenario above to see the ABS checklist here.',
    absNotTriggered: 'No clear Access-and-Benefit-Sharing signal was found for this query. This does not rule ABS out — describe the biological resource and its provenance for a more specific check.',

    tkdlTitle: 'TKDL / Prior-Art Check',
    tkdlLede: 'Points to the Traditional Knowledge Digital Library workflow relevant to a classical formulation, and surfaces the prior-art sources the system found.',
    tkdlPlaceholder: 'e.g. Is this formulation already documented as traditional knowledge in a classical text?',
    tkdlButton: 'Check TKDL / Prior Art',
    tkdlEmpty: 'Describe the formulation above to see the Traditional Knowledge pointer and related sources here.',
    tkdlNotTriggered: 'No Traditional Knowledge pointer was generated for this query — it may not be classified as classical/generic, or no TK-related source was retrieved.',
  },
  te: {
    appName: 'సూత్రధార',
    tagline: 'ఆయుర్వేదం కోసం AI-ఆధారిత మేధో సంపత్తి & నియంత్రణ మేధస్సు',
    team: 'టీమ్ చతుర్య',
    heroLede:
      'ఈ వేదిక ఆయుర్వేద ఉత్పత్తులను వర్తించే మేధో సంపత్తి పాలనలు, నియంత్రణ అవసరాలు, అధికార-పరిధి నిర్దిష్ట నియమాలు మరియు అధికారిక ఆధారాలతో అనుసంధానిస్తుంది.',
    heroCta: 'ఆయుర్వేద ఉత్పత్తిని విశ్లేషించండి',

    navAnalyze: 'విశ్లేషణ',
    navAbs: 'ABS అనుసరణ',
    navTkdl: 'TKDL పరిశీలన',
    navEvidence: 'ఆధారాలు',
    navGraph: 'జ్ఞాన గ్రాఫ్',
    navEval: 'మూల్యాంకనం',

    inputLabel: 'మీ ఆయుర్వేద ఉత్పత్తి లేదా IP ప్రశ్నను వివరించండి',
    placeholder: 'ఉదా. సాంప్రదాయ గ్రంథంలో వివరించిన శాస్త్రీయ ఆయుర్వేద సూత్రీకరణకు నేను పేటెంట్ పొందవచ్చా?',
    analyze: 'విశ్లేషించండి',
    analyzing: 'విశ్లేషిస్తోంది…',
    india: 'భారతదేశం',
    international: 'అంతర్జాతీయ',
    disclaimer: 'ఇది సమాచారం మాత్రమే, న్యాయ సలహా కాదు.',
    classification: 'ఉత్పత్తి వర్గీకరణ',
    jurisdiction: 'అధికార పరిధి',
    applicableAreas: 'వర్తించే IP & నియంత్రణ అంశాలు',
    assessment: 'AI మదింపు',
    sources: 'ఆధారాలు & ఉల్లేఖనలు',
    confidence: 'ఆధార విశ్వసనీయత',
    escalate: 'IP సదుపాయకుడికి తెలియజేయండి',
    needExpert: 'నిపుణుల సహాయం కావాలా?',
    detectedLanguage: 'గుర్తించిన ఇన్‌పుట్ భాష',
    retrievalNote: 'రిట్రీవల్ కోసం సాధారణీకరించబడింది',
    evidenceBoundary: 'ఆధార పరిమితి',
    evidenceBoundaryBody: 'నమ్మదగిన సమాధానం ఇవ్వడానికి తగినంత అధికారిక ఆధారాలు లేవు.',
    whyAbstained: 'వ్యవస్థ ఎందుకు నిరాకరించింది',
    systemError: 'విశ్లేషణ సేవ తాత్కాలికంగా అందుబాటులో లేదు. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',

    evidencePageTitle: 'ఆధార అన్వేషణ',
    evidencePageLede: 'చివరి సమాధానం ఎక్కడ నుండి వచ్చింది? మీ ఇటీవలి విశ్లేషణ కోసం క్రింద ఉన్న ప్రతి మూలం అధికారిక కార్పస్ నుండి నిజంగా పొందబడింది.',
    evidenceEmpty: 'ముందుగా ఒక విశ్లేషణ నడపండి — ఆ ప్రశ్న కోసం పొందిన మూలాలు ఇక్కడ కనిపిస్తాయి.',

    graphEmpty: 'ప్రస్తుతం బ్యాకెండ్ నుండి నాలెడ్జ్ గ్రాఫ్ డేటా అందుబాటులో లేదు.',
    evalEmpty: 'ఈ సెషన్‌లో ఇంకా ప్రశ్నలు నమోదు కాలేదు.',


    absTitle: 'ABS అనుసరణ పరిశీలన',
    absLede: 'జీవవైవిధ్య చట్టం, CBD మరియు నాగోయా ప్రోటోకాల్ కింద యాక్సెస్-అండ్-బెనిఫిట్-షేరింగ్ బాధ్యతలను ప్రశ్న ప్రేరేపించే అవకాశం ఉందో లేదో పరిశీలిస్తుంది.',
    absPlaceholder: 'ఉదా. భారతదేశంలోని ఒక నిర్దిష్ట ప్రాంతం నుండి పొందిన జీవ వనరును ఉపయోగించి సూత్రీకరణను వాణిజ్యీకరించాలనుకుంటున్నాము',
    absButton: 'ABS అనుసరణను పరిశీలించండి',
    absEmpty: 'ABS చెక్‌లిస్ట్‌ను చూడటానికి పైన ఉత్పత్తి లేదా సోర్సింగ్ దృశ్యాన్ని వివరించండి.',
    absNotTriggered: 'ఈ ప్రశ్న కోసం స్పష్టమైన యాక్సెస్-అండ్-బెనిఫిట్-షేరింగ్ సంకేతం కనుగొనబడలేదు. ఇది ABSను పూర్తిగా తోసిపుచ్చదు — మరింత నిర్దిష్టమైన పరిశీలన కోసం జీవ వనరు మరియు దాని మూలాన్ని వివరించండి.',

    tkdlTitle: 'TKDL / ముందస్తు-కళ పరిశీలన',
    tkdlLede: 'శాస్త్రీయ సూత్రీకరణకు సంబంధించిన సాంప్రదాయ జ్ఞాన డిజిటల్ లైబ్రరీ వర్క్‌ఫ్లోను సూచిస్తుంది మరియు వ్యవస్థ కనుగొన్న ముందస్తు-కళ మూలాలను చూపిస్తుంది.',
    tkdlPlaceholder: 'ఉదా. ఈ సూత్రీకరణ ఇప్పటికే ఒక శాస్త్రీయ గ్రంథంలో సాంప్రదాయ జ్ఞానంగా నమోదు చేయబడిందా?',
    tkdlButton: 'TKDL / ముందస్తు-కళను పరిశీలించండి',
    tkdlEmpty: 'సాంప్రదాయ జ్ఞాన సూచన మరియు సంబంధిత మూలాలను చూడటానికి పైన సూత్రీకరణను వివరించండి.',
    tkdlNotTriggered: 'ఈ ప్రశ్న కోసం సాంప్రదాయ జ్ఞాన సూచన రూపొందించబడలేదు — ఇది శాస్త్రీయ/సాధారణంగా వర్గీకరించబడకపోవచ్చు, లేదా TK-సంబంధిత మూలం పొందబడలేదు.',
  },
}
