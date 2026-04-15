const demoCases = [
  {
    id: 'demo-sepsis-001',
    meta: {
      title: 'The Overnight Handover',
      entry_type: 'inheriting_case',
      difficulty: {
        presentation_clarity: 'moderate',
        red_herrings: 1,
        information_availability: 'mostly_complete',
        cognitive_bias_traps: 1
      },
      guideline_reference: 'NICE NG51 — Sepsis: recognition, diagnosis and early management'
    },
    patient: {
      name: 'Margaret Ellis',
      age: 72,
      sex: 'Female',
      dob: '03/04/1954',
      nhs_number: '432 156 7890',
      presenting_complaint: 'Confusion and low-grade fever',
      admission_time: '18:30',
      current_time: '02:15'
    },
    history: {
      presenting: 'Brought in by daughter at 18:30. Found confused at home, not her usual self. Daughter reports she has been complaining of burning when passing urine for 2 days. Low-grade fever noticed this afternoon. Ate very little today.',
      past_medical: ['Type 2 Diabetes Mellitus', 'Hypertension', 'Osteoarthritis', 'Recurrent UTIs (3 in past year)'],
      medications: ['Metformin 500mg BD', 'Ramipril 5mg OD', 'Paracetamol PRN'],
      allergies: 'NKDA',
      social: 'Lives alone. Independent with ADLs. Daughter visits twice weekly. Non-smoker. No alcohol.',
      systems_review: {
        reported_by_daughter: 'Not eating, more confused than usual, complained of tummy pain earlier',
        patient_reports: 'Burning on urination, feels cold and shivery, bit of belly ache'
      }
    },
    previous_doctor: {
      name: 'Dr. James Richardson',
      grade: 'FY2',
      notes: '72yo female, PMH: T2DM, HTN, recurrent UTIs. Brought in by daughter with confusion and dysuria. O/E: Looks comfortable, mild suprapubic tenderness. Urine dip: nitrites +, leuco ++, blood +. Impression: UTI — likely cause of acute confusion in elderly patient. Given her recurrent UTIs this is a familiar pattern. Started IV co-amoxiclav as per local guidelines (unable to tolerate oral intake). Plan: Continue IV abx, encourage oral fluids, monitor confusion — likely to improve with abx. Bloods sent. Review in AM. Discussed with registrar who agreed with plan.',
      time_seen: '19:45',
      tone: 'Confident, thorough-sounding, well-structured notes'
    },
    observations: {
      sets: [
        { time: '19:30', hr: 98, bp: '102/64', temp: 38.1, rr: 20, spo2: 96, news2: 5, avpu: 'Confusion (new)' },
        { time: '22:00', hr: 105, bp: '91/58', temp: 38.4, rr: 22, spo2: 94, news2: 7, avpu: 'Confusion (new)' },
        { time: '01:30', hr: 112, bp: '88/52', temp: 38.7, rr: 24, spo2: 93, news2: 9, avpu: 'Verbal' }
      ]
    },
    investigations: {
      available_immediately: {
        urine_dip: 'Nitrites +, Leukocytes ++, Blood +, Protein +',
        ecg: 'Sinus tachycardia, rate 105. No acute ST changes.'
      },
      bloods_initial: {
        time_taken: '19:50',
        time_resulted: '21:30',
        results: {
          WBC:         { value: 18.2, unit: 'x10^9/L', range: '4.0-11.0', flag: 'HIGH', meaning: 'White blood cells — these fight infection. Very high here, meaning the body is fighting a serious infection.' },
          Neutrophils: { value: 15.8, unit: 'x10^9/L', range: '2.0-7.5', flag: 'HIGH', meaning: 'A type of white blood cell that fights bacteria. Very high — confirms a bacterial infection.' },
          CRP:         { value: 245, unit: 'mg/L', range: '<5', flag: 'HIGH', meaning: 'Inflammation marker. Extremely high — the body is under major stress from infection.' },
          Lactate:     { value: 3.8, unit: 'mmol/L', range: '0.5-2.0', flag: 'HIGH', meaning: 'Shows how well oxygen is reaching the tissues. High levels mean the organs aren\'t getting enough blood — a danger sign.' },
          Creatinine:  { value: 156, unit: 'umol/L', range: '45-84', flag: 'HIGH', meaning: 'A measure of kidney function. High here — the kidneys are struggling, possibly from the infection spreading.' },
          Urea:        { value: 12.4, unit: 'mmol/L', range: '2.5-7.8', flag: 'HIGH', meaning: 'Another kidney marker. High — supports that the kidneys are under strain.' },
          eGFR:        { value: 28, unit: 'mL/min', range: '>60', flag: 'LOW', meaning: 'Estimated kidney function. Very low — the kidneys are working at less than half capacity.' },
          Hb:          { value: 118, unit: 'g/L', range: '120-160', flag: 'LOW', meaning: 'Haemoglobin — carries oxygen in the blood. Slightly low, meaning mild anaemia.' },
          Platelets:   { value: 142, unit: 'x10^9/L', range: '150-400', flag: 'LOW', meaning: 'Cells that help blood clot. Slightly low — can drop in serious infections.' },
          Na:          { value: 134, unit: 'mmol/L', range: '135-145', flag: 'LOW', meaning: 'Sodium — an important body salt. Slightly low, common in infection and dehydration.' },
          K:           { value: 5.2, unit: 'mmol/L', range: '3.5-5.3', flag: 'NORMAL', meaning: 'Potassium — important for the heart. Normal here, but watch it with kidney problems.' },
          Glucose:     { value: 14.2, unit: 'mmol/L', range: '4.0-7.0', flag: 'HIGH', meaning: 'Blood sugar. Very high — likely stress response from the infection, plus she has diabetes.' },
          Bilirubin:   { value: 8, unit: 'umol/L', range: '0-21', flag: 'NORMAL', meaning: 'Liver marker. Normal — the liver is coping fine.' },
          ALT:         { value: 32, unit: 'U/L', range: '0-41', flag: 'NORMAL', meaning: 'Liver enzyme. Normal — no liver damage.' }
        }
      },
      blood_cultures: { status: 'Sent — results pending (48hr)' },
      imaging_category: 'normal',
      ecg_category: 'normal',
      orderable: {
        chest_xray: {
          label: 'Chest X-ray',
          result: 'Clear lung fields. No consolidation or effusion. Heart size normal.',
          delay_ms: 2000
        },
        blood_gas: {
          label: 'Arterial Blood Gas',
          result: {
            pH:         { value: 7.31, range: '7.35-7.45', flag: 'LOW' },
            pO2:        { value: 9.8, range: '10-13.3', flag: 'LOW' },
            pCO2:       { value: 3.2, range: '4.7-6.0', flag: 'LOW' },
            HCO3:       { value: 18, range: '22-26', flag: 'LOW' },
            Lactate:    { value: 4.1, range: '0.5-2.0', flag: 'HIGH' },
            Base_Excess: { value: -7.2, range: '-2 to +2', flag: 'LOW' }
          },
          delay_ms: 1500
        },
        repeat_obs: {
          label: 'Repeat Observations',
          result: 'See latest obs set (01:30)',
          delay_ms: 500
        }
      }
    },
    hidden: {
      actual_diagnosis: 'Sepsis secondary to urinary tract infection',
      previous_doctor_error: 'Dr. Richardson correctly identified the UTI but failed to recognise that the patient was meeting criteria for sepsis. He documented the observations but did not calculate or act on the NEWS2 score. He framed the confusion as simply \'UTI causing confusion in an elderly patient\' rather than recognising it as a red flag for severe sepsis. He did not request a lactate, did not initiate the sepsis pathway, and did not escalate despite rising NEWS2.',
      cognitive_bias_planted: 'anchoring',
      bias_explanation: 'Dr. Richardson anchored on the diagnosis of UTI based on the positive urine dip and the patient\'s history of recurrent UTIs. Once this anchor was set, he interpreted all subsequent findings (confusion, fever, abnormal obs) as consistent with a \'simple UTI\' rather than recognising the pattern of sepsis.',
      red_herrings: [
        'The history of recurrent UTIs makes it tempting to see this as \'just another UTI\'',
        'Dr. Richardson\'s notes sound confident and well-structured, creating an authority bias'
      ],
      fork_in_the_road: 'The critical decision point was when the 22:00 observations showed NEWS2 of 7 with rising heart rate, falling BP, and falling SpO2. A NEWS2 score of 5 or above should trigger an urgent clinical review, and the clinical picture of infection plus organ dysfunction meets criteria for sepsis.',
      ideal_management: '1. Recognise sepsis using NEWS2 and clinical picture. 2. Initiate Sepsis Six within 1 hour: blood cultures, lactate measurement, IV antibiotics, IV fluid resuscitation, urine output monitoring, oxygen if SpO2 below 94%. 3. Escalate to registrar/consultant for urgent review. 4. Consider ITU referral given organ dysfunction.',
      teaching_points: [
        'NEWS2 score of 5 or above mandates urgent clinical review',
        'NEWS2 score of 7 or above should trigger emergency response',
        'Sepsis is a clinical diagnosis: infection plus organ dysfunction, not just infection',
        'Elderly patients with infection can deteriorate rapidly',
        'Well-written notes do not equal correct assessment — always verify against the numbers',
        'Lactate above 2 mmol/L in context of infection suggests tissue hypoperfusion'
      ],
      doctor_was_correct: false,
      multiple_choice: {
        question: 'What do you think the previous doctor got wrong?',
        options: [
          { id: 'A', text: 'The doctor was right — this is just a urinary infection causing confusion', correct: false },
          { id: 'B', text: 'Sepsis (a life-threatening infection spreading through the body) — the infection is far more serious than a simple UTI', correct: true },
          { id: 'C', text: 'Meningitis (an infection of the brain lining) — the confusion suggests the brain is affected', correct: false },
          { id: 'D', text: 'Acute kidney failure from dehydration — the kidneys are shutting down because she hasn\'t been drinking', correct: false }
        ]
      }
    },
    patient_agent_context: {
      instructions: 'You are Margaret Ellis, 72 years old. You feel very unwell. You are confused and finding it hard to concentrate. You feel cold and shivery despite being warm to touch. Your tummy hurts a bit, low down. It burns when you wee. You have not been eating. You feel dizzy when you try to sit up. You do not know what your blood results are. You do not know what diagnosis the doctor has given you. You just know you feel much worse than when you came in.',
      personality: 'Stoic but frightened. Tries to downplay symptoms but clearly unwell. Slightly confused — may repeat herself or lose track of the question. Becomes more responsive if the player is kind and patient.',
      knowledge_boundary: 'Knows her own symptoms and feelings. Knows her medications (though may get names slightly wrong). Does NOT know any lab results, does NOT know what sepsis is, does NOT know the previous doctor\'s notes.',
      withheld_info: [
        {
          fact: 'She has been feeling progressively worse over the last few hours — much worse than when the first doctor saw her. She feels like she might faint if she stands up.',
          reason: 'Nobody has come to check on her since the first doctor left, and she assumed feeling worse was normal',
          category: 'symptoms',
          trigger_topics: ['worse', 'changed', 'since', 'better', 'deteriorat', 'faint', 'dizzy']
        }
      ]
    }
  }
];

export default demoCases;
