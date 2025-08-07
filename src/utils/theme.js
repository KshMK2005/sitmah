import { configuracionService } from '../services/api';

// Cambia el tema globalmente y lo guarda en la configuración global
export async function setGlobalTheme(theme) {
  // Aplicar el tema inmediatamente en el DOM
  document.documentElement.classList.remove(
    'theme-normal', 'theme-sanvalentin', 'theme-navidad', 'theme-muertos', 'theme-grises'
  );
  document.documentElement.classList.add(`theme-${theme}`);
  
  // Guardar en localStorage como fallback
  localStorage.setItem('temaGlobal', theme);
  
  // Guardar en la configuración global de la aplicación
  try {
    await configuracionService.save('temaGlobal', theme, 'Tema global de la aplicación');
    console.log(`🎨 Tema cambiado globalmente a: ${theme}`);
  } catch (error) {
    console.error('Error al guardar tema en la configuración global:', error);
    // Si falla la configuración global, al menos tenemos localStorage
  }
}

// Aplicar el tema guardado desde la configuración global
export async function applySavedTheme() {
  let temaGuardado = 'normal';
  
  // Intentar obtener el tema de la configuración global
  try {
    const configTema = await configuracionService.getByNombre('temaGlobal');
    if (configTema && configTema.valor) {
      temaGuardado = configTema.valor;
      console.log(`🎨 Aplicando tema desde configuración global: ${temaGuardado}`);
    } else {
      // Si no hay configuración global, usar localStorage como fallback
      temaGuardado = localStorage.getItem('temaGlobal') || 'normal';
      console.log(`🎨 Aplicando tema desde localStorage: ${temaGuardado}`);
      
      // Intentar crear la configuración automáticamente
      try {
        await configuracionService.save('temaGlobal', temaGuardado, 'Tema global de la aplicación');
        console.log('✅ Configuración temaGlobal creada automáticamente');
      } catch (saveError) {
        console.warn('⚠️ No se pudo crear configuración automáticamente:', saveError.message);
      }
    }
  } catch (error) {
    console.warn('⚠️ Error al obtener tema de la configuración global, usando localStorage:', error.message);
    // Si falla, usar localStorage como fallback
    temaGuardado = localStorage.getItem('temaGlobal') || 'normal';
    console.log(`🎨 Aplicando tema desde localStorage (fallback): ${temaGuardado}`);
  }
  
  // Aplicar el tema sin guardar (para evitar recursión)
  document.documentElement.classList.remove(
    'theme-normal', 'theme-sanvalentin', 'theme-navidad', 'theme-muertos', 'theme-grises'
  );
  document.documentElement.classList.add(`theme-${temaGuardado}`);
  localStorage.setItem('temaGlobal', temaGuardado);
}

// Verificar si el tema ha cambiado en la configuración global
export async function checkForThemeUpdates() {
  try {
    const configTema = await configuracionService.getByNombre('temaGlobal');
    if (configTema && configTema.valor) {
      const temaActual = localStorage.getItem('temaGlobal') || 'normal';
      if (configTema.valor !== temaActual) {
        // El tema ha cambiado, aplicarlo
        console.log(`🔄 Tema cambiado detectado: ${temaActual} → ${configTema.valor}`);
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

// Obtener el tema actual
export async function getCurrentTheme() {
  try {
    const configTema = await configuracionService.getByNombre('temaGlobal');
    if (configTema && configTema.valor) {
      return configTema.valor;
    }
    return localStorage.getItem('temaGlobal') || 'normal';
  } catch (error) {
    console.error('Error al obtener tema actual:', error);
    return localStorage.getItem('temaGlobal') || 'normal';
  }
}
