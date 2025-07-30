// Cambia el tema globalmente y lo guarda en localStorage
export function setGlobalTheme(theme) {
  document.documentElement.classList.remove(
    'theme-normal', 'theme-sanvalentin', 'theme-navidad', 'theme-muertos', 'theme-grises'
  );
  document.documentElement.classList.add(`theme-${theme}`);
  localStorage.setItem('temaGlobal', theme);
}

export function applySavedTheme() {
  const temaGuardado = localStorage.getItem('temaGlobal') || 'normal';
  setGlobalTheme(temaGuardado);
}
