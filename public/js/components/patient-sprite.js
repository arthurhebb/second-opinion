// Maps patient demographics to sprite filename
// Files in /assets/sprites/ as: Male_Young_1.png, Female_Elderly_2.png, etc.
// Each category has 2 variants — variant is deterministic per patient name.

function getAgeGroup(age) {
  if (age < 36) return 'Young';
  if (age < 56) return 'Middle';
  if (age < 76) return 'Older';
  return 'Elderly';
}

function getSex(sex) {
  const s = (sex || '').toLowerCase();
  if (s.startsWith('m')) return 'Male';
  return 'Female';
}

function getVariant(name) {
  // Simple hash of patient name to pick variant 1 or 2 consistently
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 2) + 1;
}

export function getSpriteFilename(patient) {
  const variant = getVariant(patient.name);
  return `${getSex(patient.sex)}_${getAgeGroup(patient.age)}_${variant}.png`;
}

export function renderPatientSprite(patient) {
  const container = document.createElement('div');
  container.className = 'patient-sprite';

  const img = document.createElement('img');
  img.src = `/assets/sprites/${getSpriteFilename(patient)}`;
  img.alt = `${patient.name}`;
  img.className = 'sprite-img';
  img.onerror = () => {
    // If sprite not found, hide it gracefully
    container.style.display = 'none';
  };

  container.appendChild(img);
  return container;
}
