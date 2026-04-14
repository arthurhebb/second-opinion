export function renderNotesViewer(caseData) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-2';

  // Previous doctor's notes
  const docNotes = document.createElement('div');
  docNotes.className = 'panel';
  docNotes.innerHTML = `
    <div class="panel-header">${caseData.previous_doctor.name} (${caseData.previous_doctor.grade}) — ${caseData.previous_doctor.time_seen}</div>
    <div class="notes-viewer">${caseData.previous_doctor.notes}</div>
  `;
  container.appendChild(docNotes);

  // Patient history
  const history = document.createElement('div');
  history.className = 'panel';

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
  container.appendChild(avail);

  return container;
}
