import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const conditions = [
  {
    id: 'sepsis',
    name: 'Sepsis',
    guideline: 'NICE NG253',
    file: 'sepsis-ng253.md',
    key_concepts: ['NEWS2', 'Sepsis Six', 'lactate', 'IV antibiotics within 1 hour', 'fluid resuscitation'],
    good_biases: ['anchoring', 'premature_closure', 'availability'],
    description: 'Sepsis missed due to anchoring on a simpler infection diagnosis'
  },
  {
    id: 'chest-pain',
    name: 'Acute Coronary Syndrome',
    guideline: 'NICE CG95',
    file: 'chest-pain-cg95.md',
    key_concepts: ['troponin', 'ECG', 'STEMI', 'NSTEMI', 'aspirin loading', 'ACS red flags'],
    good_biases: ['anchoring', 'premature_closure', 'representativeness'],
    description: 'ACS missed due to atypical presentation or anchoring on non-cardiac cause'
  },
  {
    id: 'pe',
    name: 'Pulmonary Embolism',
    guideline: 'NICE NG158',
    file: 'vte-ng158.md',
    key_concepts: ['Wells score', 'D-dimer', 'CTPA', 'anticoagulation', 'haemodynamic instability'],
    good_biases: ['anchoring', 'availability', 'premature_closure'],
    description: 'PE missed due to atypical presentation or failure to calculate Wells score'
  },
  {
    id: 'meningitis',
    name: 'Meningitis / Meningococcal Disease',
    guideline: 'NICE NG240',
    file: 'meningitis-ng240.md',
    key_concepts: ['classic triad', 'non-blanching rash', 'LP', 'ceftriaxone', 'antibiotics within 1 hour'],
    good_biases: ['anchoring', 'premature_closure', 'base_rate_neglect'],
    description: 'Meningitis missed due to incomplete classic triad or atypical presentation'
  },
  {
    id: 'stroke',
    name: 'Stroke / TIA',
    guideline: 'NICE NG128',
    file: 'stroke-ng128.md',
    key_concepts: ['FAST', 'ROSIER', 'thrombolysis window', 'CT head', 'aspirin 300mg', 'thrombectomy'],
    good_biases: ['anchoring', 'premature_closure', 'representativeness'],
    description: 'Stroke missed due to atypical presentation or attributed to migraine/vertigo/intoxication'
  },
  {
    id: 'ectopic-pregnancy',
    name: 'Ectopic Pregnancy',
    guideline: 'NICE NG126',
    file: 'ectopic-pregnancy-ng126.md',
    key_concepts: ['pregnancy test', 'shoulder tip pain', 'transvaginal ultrasound', 'hCG trends', 'haemodynamic instability'],
    good_biases: ['anchoring', 'premature_closure', 'representativeness'],
    description: 'Ectopic missed due to GI/urinary symptoms masking the presentation or failure to test for pregnancy'
  },
  {
    id: 'anaphylaxis',
    name: 'Anaphylaxis',
    guideline: 'NICE CG134',
    file: 'anaphylaxis-cg134.md',
    key_concepts: ['IM adrenaline', 'airway compromise', 'biphasic reaction', 'mast cell tryptase', 'observation period'],
    good_biases: ['anchoring', 'normalcy_bias', 'premature_closure'],
    description: 'Anaphylaxis under-treated due to attribution to simple allergic reaction or anxiety'
  },
  {
    id: 'heart-failure',
    name: 'Acute Heart Failure',
    guideline: 'NICE NG106',
    file: 'heart-failure-ng106.md',
    key_concepts: ['NT-proBNP', 'echocardiography', 'ejection fraction', 'diuretics', 'SGLT2i'],
    good_biases: ['anchoring', 'availability', 'premature_closure'],
    description: 'Heart failure missed due to attribution to respiratory infection or COPD exacerbation'
  },
  {
    id: 'pneumonia',
    name: 'Community-Acquired Pneumonia',
    guideline: 'NICE NG250',
    file: 'pneumonia-ng250.md',
    key_concepts: ['CURB-65', 'chest X-ray', 'antibiotics', 'severity assessment', 'atypical organisms'],
    good_biases: ['anchoring', 'premature_closure', 'availability'],
    description: 'Pneumonia severity underestimated or atypical organism missed'
  },
  {
    id: 'aki',
    name: 'Acute Kidney Injury',
    guideline: 'NICE NG148',
    file: 'aki-ng148.md',
    key_concepts: ['creatinine rise', 'urine output', 'nephrotoxics', 'fluid status', 'renal replacement therapy'],
    good_biases: ['anchoring', 'premature_closure', 'inattentional_blindness'],
    description: 'AKI missed on bloods or attributed to dehydration without stopping nephrotoxic medications'
  },
  {
    id: 'dka',
    name: 'Diabetic Ketoacidosis',
    guideline: 'NICE NG17',
    file: 'dka-ng17.md',
    key_concepts: ['hyperglycaemia', 'ketonaemia', 'acidosis', 'fixed-rate insulin', 'potassium replacement'],
    good_biases: ['anchoring', 'premature_closure', 'representativeness'],
    description: 'DKA missed in new-onset diabetes or attributed to gastroenteritis/sepsis'
  },
  {
    id: 'sah',
    name: 'Subarachnoid Haemorrhage',
    guideline: 'NICE NG228',
    file: 'sah-ng228.md',
    key_concepts: ['thunderclap headache', 'CT head within 6 hours', 'lumbar puncture', 'xanthochromia', 'rebleeding risk'],
    good_biases: ['anchoring', 'premature_closure', 'availability'],
    description: 'SAH missed due to headache attributed to migraine or tension headache'
  },
  {
    id: 'cauda-equina',
    name: 'Cauda Equina Syndrome',
    guideline: 'Clinical consensus',
    file: 'cauda-equina.md',
    key_concepts: ['saddle anaesthesia', 'bladder dysfunction', 'bilateral leg symptoms', 'emergency MRI', 'surgical decompression'],
    good_biases: ['anchoring', 'premature_closure', 'normalcy_bias'],
    description: 'Cauda equina missed due to back pain attributed to mechanical/musculoskeletal cause'
  },
  {
    id: 'aortic-dissection',
    name: 'Aortic Dissection',
    guideline: 'Clinical consensus',
    file: 'aortic-dissection.md',
    key_concepts: ['tearing chest pain', 'BP differential', 'CT aortogram', 'Type A vs B', 'aortic regurgitation'],
    good_biases: ['anchoring', 'representativeness', 'premature_closure'],
    description: 'Aortic dissection missed due to presentation mimicking ACS, stroke, or musculoskeletal pain'
  },
  {
    id: 'testicular-torsion',
    name: 'Testicular Torsion',
    guideline: 'Clinical consensus',
    file: 'testicular-torsion.md',
    key_concepts: ['6-hour window', 'absent cremasteric reflex', 'high-riding testis', 'surgical exploration', 'do not delay for imaging'],
    good_biases: ['anchoring', 'premature_closure', 'representativeness'],
    description: 'Testicular torsion misdiagnosed as epididymitis leading to delayed surgical intervention'
  },
  {
    id: 'carbon-monoxide',
    name: 'Carbon Monoxide Poisoning',
    guideline: 'Clinical consensus',
    file: 'carbon-monoxide.md',
    key_concepts: ['falsely normal pulse oximetry', 'co-oximetry', 'COHb levels', 'household contacts', 'high-flow oxygen'],
    good_biases: ['anchoring', 'availability', 'premature_closure'],
    description: 'CO poisoning missed due to non-specific symptoms attributed to viral illness or migraine'
  },
  {
    id: 'addisonian-crisis',
    name: 'Addisonian Crisis',
    guideline: 'Clinical consensus',
    file: 'addisonian-crisis.md',
    key_concepts: ['IV hydrocortisone', 'hyponatraemia', 'hyperkalaemia', 'hypoglycaemia', 'do not wait for results'],
    good_biases: ['anchoring', 'base_rate_neglect', 'premature_closure'],
    description: 'Adrenal crisis missed due to non-specific presentation attributed to sepsis or dehydration'
  },
  {
    id: 'necrotising-fasciitis',
    name: 'Necrotising Fasciitis',
    guideline: 'Clinical consensus',
    file: 'necrotising-fasciitis.md',
    key_concepts: ['pain out of proportion', 'rapid progression', 'surgical debridement', 'LRINEC score', 'systemic toxicity'],
    good_biases: ['anchoring', 'normalcy_bias', 'premature_closure'],
    description: 'Necrotising fasciitis missed due to early cellulitis-like appearance with disproportionate pain'
  },
  {
    id: 'ruptured-aaa',
    name: 'Ruptured Abdominal Aortic Aneurysm',
    guideline: 'Clinical consensus',
    file: 'ruptured-aaa.md',
    key_concepts: ['classic triad', 'pulsatile mass', 'CT angiogram', 'permissive hypotension', 'emergency surgery'],
    good_biases: ['anchoring', 'representativeness', 'premature_closure'],
    description: 'Ruptured AAA misdiagnosed as renal colic, back pain, or GI emergency'
  },
  {
    id: 'wernicke',
    name: "Wernicke's Encephalopathy",
    guideline: 'Clinical consensus',
    file: 'wernicke-encephalopathy.md',
    key_concepts: ['thiamine before glucose', 'IV Pabrinex', 'confusion', 'ataxia', 'ophthalmoplegia', 'Korsakoff prevention'],
    good_biases: ['anchoring', 'availability', 'premature_closure'],
    description: "Wernicke's missed due to incomplete triad and confusion attributed to intoxication or sepsis"
  },
  {
    id: 'copd-exacerbation',
    name: 'COPD Exacerbation',
    guideline: 'NICE NG115',
    file: 'copd-ng115.md',
    key_concepts: ['oxygen targets', 'NIV', 'prednisolone', 'ABG', 'hypercapnia'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'COPD exacerbation severity underestimated or inappropriate oxygen therapy given'
  },
  {
    id: 'atrial-fibrillation',
    name: 'Atrial Fibrillation',
    guideline: 'NICE NG196',
    file: 'atrial-fibrillation-ng196.md',
    key_concepts: ['CHA2DS2-VASc', 'anticoagulation', 'rate control', 'ECG', 'cardioversion'],
    good_biases: ['anchoring', 'premature_closure', 'normalcy_bias'],
    description: 'AF missed or anticoagulation not initiated due to bleeding concerns overriding stroke risk'
  },
  {
    id: 'upper-gi-bleed',
    name: 'Upper GI Bleeding',
    guideline: 'NICE CG141',
    file: 'upper-gi-bleed-cg141.md',
    key_concepts: ['Blatchford score', 'endoscopy timing', 'resuscitation', 'variceal bleeding', 'PPI timing'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'GI bleed severity underestimated or variceal bleeding managed as non-variceal'
  },
  {
    id: 'pancreatitis',
    name: 'Acute Pancreatitis',
    guideline: 'NICE NG104',
    file: 'pancreatitis-ng104.md',
    key_concepts: ['lipase', 'amylase', 'nil by mouth myth', 'enteral nutrition', 'severity scoring'],
    good_biases: ['anchoring', 'premature_closure', 'availability'],
    description: 'Pancreatitis assumed alcohol-related without investigating other causes, or severity underestimated'
  },
  {
    id: 'pre-eclampsia',
    name: 'Pre-eclampsia',
    guideline: 'NICE NG133',
    file: 'pre-eclampsia-ng133.md',
    key_concepts: ['blood pressure', 'proteinuria', 'magnesium sulfate', 'delivery timing', 'HELLP'],
    good_biases: ['anchoring', 'premature_closure', 'normalcy_bias'],
    description: 'Pre-eclampsia missed due to symptoms attributed to normal pregnancy complaints'
  },
  {
    id: 'cellulitis',
    name: 'Cellulitis / Erysipelas',
    guideline: 'NICE NG141',
    file: 'cellulitis-ng141.md',
    key_concepts: ['flucloxacillin', 'marking boundaries', 'pain out of proportion', 'necrotising fasciitis'],
    good_biases: ['anchoring', 'normalcy_bias'],
    description: 'Cellulitis diagnosed when necrotising fasciitis should have been suspected due to disproportionate pain'
  },
  {
    id: 'head-injury',
    name: 'Head Injury',
    guideline: 'NICE NG232',
    file: 'head-injury-ng232.md',
    key_concepts: ['GCS', 'CT criteria', 'skull fracture signs', 'anticoagulants', 'observation protocol'],
    good_biases: ['anchoring', 'premature_closure', 'normalcy_bias'],
    description: 'Significant head injury missed in anticoagulated patient or intoxicated patient with attributed confusion'
  },
  {
    id: 'delirium',
    name: 'Delirium',
    guideline: 'NICE CG103',
    file: 'delirium-cg103.md',
    key_concepts: ['4AT', 'hypoactive delirium', 'underlying causes', 'dementia distinction', 'haloperidol'],
    good_biases: ['anchoring', 'availability', 'premature_closure'],
    description: 'Hypoactive delirium missed and attributed to dementia, depression, or tiredness'
  },
  {
    id: 'transient-loc',
    name: 'Transient Loss of Consciousness',
    guideline: 'NICE CG109',
    file: 'transient-loc-cg109.md',
    key_concepts: ['cardiac syncope', 'epilepsy', 'vasovagal', 'ECG', 'Stokes-Adams'],
    good_biases: ['anchoring', 'premature_closure', 'availability'],
    description: 'Cardiac syncope misdiagnosed as vasovagal or epilepsy, missing life-threatening arrhythmia'
  },
  {
    id: 'self-harm',
    name: 'Self-Harm Assessment',
    guideline: 'NICE NG225',
    file: 'self-harm-ng225.md',
    key_concepts: ['psychosocial assessment', 'safety planning', 'overdose management', 'do not risk stratify'],
    good_biases: ['anchoring', 'premature_closure', 'normalcy_bias'],
    description: 'Self-harm risk underestimated due to inappropriate use of risk stratification tools'
  },
  {
    id: 'cancer-red-flags',
    name: 'Suspected Cancer — Red Flags',
    guideline: 'NICE NG12',
    file: 'cancer-red-flags-ng12.md',
    key_concepts: ['2-week wait', 'FIT testing', 'CA125', 'unexplained weight loss', 'haemoptysis'],
    good_biases: ['anchoring', 'availability', 'premature_closure'],
    description: 'Cancer diagnosis delayed due to symptoms attributed to benign causes'
  },
  {
    id: 'gallstones',
    name: 'Gallstone Disease',
    guideline: 'NICE CG188',
    file: 'gallstones-cg188.md',
    key_concepts: ['ultrasound', 'LFTs', 'cholecystitis', 'cholangitis', 'MRCP', 'cholecystectomy'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'Ascending cholangitis missed and treated as simple biliary colic'
  },
  {
    id: 'hypertension-emergency',
    name: 'Hypertensive Emergency',
    guideline: 'NICE NG136',
    file: 'hypertension-ng136.md',
    key_concepts: ['BP ≥180/120', 'retinal haemorrhage', 'papilloedema', 'target organ damage', 'phaeochromocytoma'],
    good_biases: ['normalcy_bias', 'premature_closure'],
    description: 'Hypertensive emergency missed due to focus on blood pressure number alone without assessing for target organ damage'
  },
  {
    id: 'uti-pyelonephritis',
    name: 'UTI / Pyelonephritis',
    guideline: 'NICE NG109',
    file: 'uti-ng109.md',
    key_concepts: ['nitrofurantoin', 'trimethoprim', 'midstream urine', 'pyelonephritis red flags', 'urosepsis'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'Pyelonephritis or urosepsis missed due to treating as simple lower UTI'
  },
  {
    id: 'hip-fracture',
    name: 'Hip Fracture',
    guideline: 'NICE CG124',
    file: 'hip-fracture-cg124.md',
    key_concepts: ['occult fracture', 'MRI if X-ray negative', 'surgical timing', 'avoid NSAIDs', 'nerve blocks'],
    good_biases: ['anchoring', 'premature_closure', 'availability'],
    description: 'Occult hip fracture missed on normal X-ray in elderly patient after fall'
  },
  {
    id: 'acute-heart-failure',
    name: 'Acute Decompensated Heart Failure',
    guideline: 'NICE CG187',
    file: 'acute-heart-failure-cg187.md',
    key_concepts: ['BNP', 'NT-proBNP', 'echocardiography', 'IV diuretics', 'cardiogenic shock'],
    good_biases: ['anchoring', 'premature_closure', 'availability'],
    description: 'Acute heart failure misdiagnosed as pneumonia or COPD exacerbation'
  },
  {
    id: 'ckd',
    name: 'Chronic Kidney Disease',
    guideline: 'NICE NG203',
    file: 'ckd-ng203.md',
    key_concepts: ['eGFR staging', 'ACR', 'referral criteria', 'ACEi/ARB', 'anaemia'],
    good_biases: ['anchoring', 'inattentional_blindness'],
    description: 'CKD progression missed due to failure to monitor eGFR trend or address rising ACR'
  },
  {
    id: 'crohns',
    name: "Crohn's Disease",
    guideline: 'NICE NG129',
    file: 'crohns-ng129.md',
    key_concepts: ['glucocorticosteroids', 'thiopurines', 'biologics', 'TPMT', 'smoking cessation'],
    good_biases: ['anchoring', 'premature_closure'],
    description: "Crohn's flare mismanaged with inappropriate maintenance steroids or delayed escalation"
  },
  {
    id: 'pyelonephritis',
    name: 'Acute Pyelonephritis',
    guideline: 'NICE NG111',
    file: 'pyelonephritis.md',
    key_concepts: ['loin pain', 'fever', 'urine culture', 'IV antibiotics', 'admission criteria'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'Pyelonephritis missed due to atypical presentation without classic loin pain'
  },
  {
    id: 'pneumothorax',
    name: 'Pneumothorax',
    guideline: 'BTS Guidelines',
    file: 'pneumothorax.md',
    key_concepts: ['tension pneumothorax', 'needle decompression', 'aspiration', 'chest drain', 'CXR'],
    good_biases: ['anchoring', 'premature_closure', 'normalcy_bias'],
    description: 'Tension pneumothorax missed due to attributing symptoms to asthma or anxiety'
  },
  {
    id: 'bowel-obstruction',
    name: 'Bowel Obstruction',
    guideline: 'Clinical consensus',
    file: 'bowel-obstruction.md',
    key_concepts: ['dilated loops', 'air-fluid levels', 'strangulation signs', 'NGT', 'CT abdomen'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'Strangulated bowel obstruction missed due to treating as constipation or gastroenteritis'
  },
  {
    id: 'hyperkalaemia',
    name: 'Hyperkalaemia',
    guideline: 'Clinical consensus',
    file: 'hyperkalaemia.md',
    key_concepts: ['ECG changes', 'calcium gluconate', 'insulin-dextrose', 'stop causative drugs'],
    good_biases: ['inattentional_blindness', 'premature_closure'],
    description: 'Life-threatening hyperkalaemia missed on bloods or ECG changes not recognised'
  },
  {
    id: 'thyroid-storm',
    name: 'Thyroid Storm',
    guideline: 'Clinical consensus',
    file: 'thyrotoxic-crisis.md',
    key_concepts: ['Burch-Wartofsky score', 'PTU', 'beta-blocker', 'hydrocortisone', 'Lugols iodine'],
    good_biases: ['anchoring', 'base_rate_neglect'],
    description: 'Thyroid storm missed due to features attributed to sepsis or psychiatric presentation'
  },
  {
    id: 'status-epilepticus',
    name: 'Status Epilepticus',
    guideline: 'Clinical consensus',
    file: 'status-epilepticus.md',
    key_concepts: ['lorazepam', 'phenytoin', 'refractory', 'ABCDE', 'underlying cause'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'Status epilepticus undertreated due to delayed escalation through treatment stages'
  },
  {
    id: 'hhs',
    name: 'Hyperosmolar Hyperglycaemic State',
    guideline: 'Clinical consensus',
    file: 'diabetic-emergencies-hhs.md',
    key_concepts: ['osmolality', 'low-rate insulin', 'fluid replacement', 'VTE prophylaxis', 'cerebral oedema'],
    good_biases: ['anchoring', 'representativeness'],
    description: 'HHS treated with DKA protocol (high-dose insulin) leading to dangerous osmolality shifts'
  },
  {
    id: 'cord-compression',
    name: 'Metastatic Spinal Cord Compression',
    guideline: 'NICE CG75',
    file: 'cord-compression.md',
    key_concepts: ['emergency MRI', 'dexamethasone', 'back pain in cancer', 'neurological deficit', 'functional outcome'],
    good_biases: ['anchoring', 'premature_closure', 'normalcy_bias'],
    description: 'Cord compression missed in cancer patient with back pain attributed to metastatic bone pain alone'
  },
  {
    id: 'alcohol-withdrawal',
    name: 'Alcohol Withdrawal / Delirium Tremens',
    guideline: 'NICE CG100',
    file: 'alcohol-withdrawal.md',
    key_concepts: ['CIWA-Ar', 'benzodiazepines', 'Pabrinex', 'seizures', 'delirium tremens'],
    good_biases: ['anchoring', 'availability'],
    description: 'Delirium tremens mistaken for sepsis or missed in patient whose alcohol history was not elicited'
  },
  {
    id: 'asthma-acute',
    name: 'Acute Severe Asthma',
    guideline: 'BTS/SIGN',
    file: 'asthma-acute.md',
    key_concepts: ['PEF', 'life-threatening signs', 'nebulised salbutamol', 'IV magnesium', 'silent chest'],
    good_biases: ['normalcy_bias', 'premature_closure'],
    description: 'Life-threatening asthma undertreated due to patient appearing calm (exhaustion misread as improvement)'
  },
  {
    id: 'paracetamol-overdose',
    name: 'Paracetamol Overdose',
    guideline: 'MHRA/BNF',
    file: 'overdose-paracetamol.md',
    key_concepts: ['treatment nomogram', 'NAC protocol', 'staggered overdose', 'liver unit referral', 'Kings College criteria'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'Staggered paracetamol overdose missed due to non-disclosure or subtherapeutic single levels'
  },
  {
    id: 'placental-abruption',
    name: 'Placental Abruption',
    guideline: 'Clinical consensus',
    file: 'placental-abruption.md',
    key_concepts: ['concealed haemorrhage', 'woody hard uterus', 'DIC', 'CTG', 'emergency delivery'],
    good_biases: ['anchoring', 'premature_closure'],
    description: 'Concealed abruption missed due to minimal visible bleeding masking maternal shock'
  }
];

// Load guideline text for a condition
export function getGuidelineText(conditionId) {
  const condition = conditions.find(c => c.id === conditionId);
  if (!condition) return '';
  try {
    return readFileSync(join(__dirname, 'guidelines', condition.file), 'utf-8');
  } catch {
    return '';
  }
}

export function getCondition(conditionId) {
  return conditions.find(c => c.id === conditionId);
}

export function getAllConditions() {
  return conditions.map(({ id, name, guideline, description }) => ({ id, name, guideline, description }));
}

export default conditions;
