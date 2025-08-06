import { configuracionService } from '../services/api';

// Cambia el tema globalmente y lo guarda en la configuración global
export async function setGlobalTheme(theme) {
  document.documentElement.classList.remove(
    'theme-normal', 'theme-sanvalentin', 'theme-navidad', 'theme-muertos', 'theme-grises'
  );
  document.documentElement.classList.add(`theme-${theme}`);
  
  // Guardar en localStorage como fallback
  localStorage.setItem('temaGlobal', theme);
  
  // Guardar en la configuración global de la aplicación
  try {
    await configuracionService.save('temaGlobal', theme, 'Tema global de la aplicación');
  } catch (error) {
    console.error('Error al guardar tema en la configuración global:', error);
    // Si falla la configuración global, al menos tenemos localStorage
  }
}

export async function applySavedTheme() {
  let temaGuardado = 'normal';
  
  // Intentar obtener el tema de la configuración global
  try {
    const configTema = await configuracionService.getByNombre('temaGlobal');
    if (configTema && configTema.valor) {
      temaGuardado = configTema.valor;
    } else {
      // Si no hay configuración global, usar localStorage como fallback
      temaGuardado = localStorage.getItem('temaGlobal') || 'normal';
    }
  } catch (error) {
    console.error('Error al obtener tema de la configuración global:', error);
    // Si falla, usar localStorage como fallback
    temaGuardado = localStorage.getItem('temaGlobal') || 'normal';
  }
  
  // Aplicar el tema sin guardar (para evitar recursión)
  document.documentElement.classList.remove(
    'theme-normal', 'theme-sanvalentin', 'theme-navidad', 'theme-muertos', 'theme-grises'
  );
  document.documentElement.classList.add(`theme-${temaGuardado}`);
  localStorage.setItem('temaGlobal', temaGuardado);
}

// Función para verificar si el tema ha cambiado en la configuración global
export async function checkForThemeUpdates() {
  try {
    const configTema = await configuracionService.getByNombre('temaGlobal');
    if (configTema && configTema.valor) {
      const temaActual = localStorage.getItem('temaGlobal') || 'normal';
      if (configTema.valor !== temaActual) {
        // El tema ha cambiado, aplicarlo
        document.documentElement.classList.remove(
          'theme-normal', 'theme-sanvalentin', 'theme-navidad', 'theme-muertos', 'theme-grises'
        );
        document.documentElement.classList.add(`theme-${configTema.valor}`);
        localStorage.setItem('temaGlobal', configTema.valor);
        return configTema.valor;
      }
    }
    return null;
  } catch (error) {
    console.error('Error al verificar actualizaciones de tema:', error);
    return null;
  }
}
