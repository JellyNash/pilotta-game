// This runs before React hydration to ensure CSS variables are available immediately
export function initializeCSS() {
  const root = document.documentElement;
  
  // Card variables
  const southScale = localStorage.getItem('southCardScale') || '1';
  const southSpacing = localStorage.getItem('southCardSpacing') || '0.5';
  const otherScale = localStorage.getItem('otherCardScale') || '0.75';
  const otherSpacing = localStorage.getItem('otherCardSpacing') || '0.5';
  
  // UI variables
  const uiTextScale = localStorage.getItem('uiTextScale') || '1';
  const modalWidthScale = localStorage.getItem('modalWidthScale') || '0.9';
  const tableDensity = localStorage.getItem('tableDensity') || '0.85';
  
  // Apply all at once
  root.style.setProperty('--south-card-scale', southScale);
  root.style.setProperty('--south-card-spacing', southSpacing);
  root.style.setProperty('--other-card-scale', otherScale);
  root.style.setProperty('--other-card-spacing', otherSpacing);
  root.style.setProperty('--ui-text-scale', uiTextScale);
  root.style.setProperty('--modal-width-scale', modalWidthScale);
  root.style.setProperty('--table-density', tableDensity);
}

// Also export individual setters for use in Settings component
export function setSouthCardScale(value: number) {
  localStorage.setItem('southCardScale', value.toString());
  document.documentElement.style.setProperty('--south-card-scale', value.toString());
}

export function setSouthCardSpacing(value: number) {
  localStorage.setItem('southCardSpacing', value.toString());
  document.documentElement.style.setProperty('--south-card-spacing', value.toString());
}

export function setOtherCardScale(value: number) {
  localStorage.setItem('otherCardScale', value.toString());
  document.documentElement.style.setProperty('--other-card-scale', value.toString());
}

export function setOtherCardSpacing(value: number) {
  localStorage.setItem('otherCardSpacing', value.toString());
  document.documentElement.style.setProperty('--other-card-spacing', value.toString());
}

export function setUITextScale(value: number) {
  localStorage.setItem('uiTextScale', value.toString());
  document.documentElement.style.setProperty('--ui-text-scale', value.toString());
}

export function setModalWidthScale(value: number) {
  localStorage.setItem('modalWidthScale', value.toString());
  document.documentElement.style.setProperty('--modal-width-scale', value.toString());
}

export function setTableDensity(value: number) {
  localStorage.setItem('tableDensity', value.toString());
  document.documentElement.style.setProperty('--table-density', value.toString());
}