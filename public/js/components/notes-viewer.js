import { highlightTerms } from './glossary.js';
import state from '../state.js';

function glossarize(el) {
  if (state.gameMode !== 'easy') return;
  // Walk text nodes and highlight glossary terms
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    if (!node.textContent.trim()) continue;
    const frag = highlightTerms(node.textContent);
    node.parentNode.replaceChild(frag, node);
  }
}

export function renderNotesViewer(caseData) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-2';
  const mod = caseData.modifier?.id;

  // Previous doctor's notes
  const docNotes = document.createElement('div');
  docNotes.className = 'panel';

  let notesText = caseData.previous_doctor.notes;

  // MODIFIER: illegible notes — redact 2-3 sentences
  if (mod === 'illegible_notes') {
    const sentences = notesText.split('. ');
    if (sentences.length > 3) {
      const redactIndices = [];
      while (redactIndices.length < Math.min(2, sentences.length - 2)) {
        const idx = 1 + Math.floor(Math.random() * (sentences.length - 2));
        if (!redactIndices.includes(idx)) redactIndices.push(idx);
      }
      for (const idx of redactIndices) {
        sentences[idx] = '████████████████████';
      }
      notesText = sentences.join('. ');
    }
  }

  // MODIFIER: verbal handover — replace with rushed summary
  if (mod === 'verbal_handover') {
    docNotes.innerHTML = `
      <div class="panel-header">Verbal Handover — ${caseData.previous_doctor.name} (${caseData.previous_doctor.grade}) via phone</div>
      <div class="notes-viewer" style="font-style: italic;">"${notesText}"</div>
      <div class="text-dim mt-1" style="font-size: 13px;">No written notes available — verbal handover only</div>
    `;
  } else {
    docNotes.innerHTML = `
      <div class="panel-header">${caseData.previous_doctor.name} (${caseData.previous_doctor.grade}) — ${caseData.previous_doctor.time_seen}</div>
      <div class="notes-viewer">${notesText}</div>
    `;
  }
  container.appendChild(docNotes);

  // Patient history
  const history = document.createElement('div');
  history.className = 'panel';

  // MODIFIER: no history — hide patient-reported sections
  if (mod === 'no_history') {
    let historyHTML = `<div class="panel-header">Patient History</div><div class="notes-viewer">`;
    historyHTML += `<strong>Presenting Complaint:</strong> <span class="text-dim">Patient unresponsive on arrival — unable to give history</span>\n\n`;
    historyHTML += `<strong>Past Medical History:</strong>\n${caseData.history.past_medical.map(h => '  • ' + h).join('\n')}\n\n`;
    historyHTML += `<strong>Medications:</strong>\n${caseData.history.medications.map(m => '  • ' + m).join('\n')}\n\n`;
    historyHTML += `<strong>Allergies:</strong> ${caseData.history.allergies}\n\n`;
    historyHTML += `<strong>Social History:</strong> <span class="text-dim">Unknown — no collateral available</span>\n\n`;
    historyHTML += `<strong>Systems Review:</strong> <span class="text-dim">Unable to obtain</span>`;
    historyHTML += `</div>`;
    history.innerHTML = historyHTML;
  } else {
    let historyHTML = `<div class="panel-header">Patient History</div><div class="notes-viewer">`;
    historyHTML += `<strong>Presenting Complaint:</strong> ${caseData.history.presenting}\n\n`;
    historyHTML += `<strong>Past Medical History:</strong>\n${caseData.history.past_medical.map(h => '  • ' + h).join('\n')}\n\n`;
    historyHTML += `<strong>Medications:</strong>\n${caseData.history.medications.map(m => '  • ' + m).join('\n')}\n\n`;
    historyHTML += `<strong>Allergies:</strong> ${caseData.history.allergies}\n\n`;
    historyHTML += `<strong>Social History:</strong> ${caseData.history.social}\n\n`;
    historyHTML += `<strong>Systems Review (daughter):</strong> ${caseData.history.systems_review.reported_by_daughter}\n`;
    historyHTML += `<strong>Systems Review (patient):</strong> ${caseData.history.systems_review.patient_reports}`;
    historyHTML += `</div>`;
    history.innerHTML = historyHTML;
  }
  container.appendChild(history);

  // Available investigations
  const avail = document.createElement('div');
  avail.className = 'panel';
  let availHTML = `<div class="panel-header">Available Results</div><div class="notes-viewer">`;
  availHTML += `<strong>Urine Dip:</strong> ${caseData.investigations.available_immediately.urine_dip}\n\n`;
  availHTML += `<strong>ECG:</strong> ${caseData.investigations.available_immediately.ecg}\n\n`;
  availHTML += `<strong>Blood Cultures:</strong> ${caseData.investigations.blood_cultures.status}`;
  availHTML += `</div>`;
  avail.innerHTML = availHTML;

  // Show ECG image if category is specified
  const ecgCat = caseData.investigations.ecg_category || 'normal';
  {
    // ECG interpretation hint (all difficulties)
    const ecgHints = {
      normal: 'This ECG looks normal — regular rhythm, no obvious abnormalities.',
      myocardial_infarction: 'This ECG shows changes that could indicate damage to the heart muscle — look at the ST segments (the flat bits between the spikes). If they\'re raised or lowered compared to normal, that suggests a heart attack may be happening or has recently happened.',
      abnormal_heartbeat: 'This ECG shows an irregular or abnormal heart rhythm. The pattern between beats isn\'t consistent, which could mean the heart\'s electrical system isn\'t firing normally. This might be atrial fibrillation, a fast heart rate, or another rhythm problem.',
      post_mi_history: 'This ECG shows some older changes that suggest the heart was damaged at some point in the past — possibly a previous heart attack. Look for deep Q waves (downward dips at the start of each beat) or inverted T waves (upside-down bumps). These are scars, not necessarily a new problem.'
    };

    const hintEl = document.createElement('div');
    hintEl.className = 'imaging-hint mt-1';
    hintEl.textContent = ecgHints[ecgCat] || '';
    avail.appendChild(hintEl);

    const ecgViewer = document.createElement('div');
    ecgViewer.className = 'xray-viewer mt-1';
    ecgViewer.innerHTML = '<div class="text-dim" style="padding: 12px;">Loading ECG...</div>';
    avail.appendChild(ecgViewer);

    fetch(`/api/imaging/ecg/${ecgCat}`)
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          ecgViewer.innerHTML = '';
          const img = document.createElement('img');
          img.src = data.url;
          img.className = 'xray-image';
          img.alt = 'ECG';
          ecgViewer.appendChild(img);
        } else {
          ecgViewer.innerHTML = '';
        }
      })
      .catch(() => { ecgViewer.innerHTML = ''; });
  }

  container.appendChild(avail);

  // Highlight glossary terms in easy mode
  glossarize(container);

  return container;
}
