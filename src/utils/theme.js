import { usuarioService } from '../services/api';

// Cambia el tema globalmente y lo guarda en la base de datos
export async function setGlobalTheme(theme, usuario = null) {
  document.documentElement.classList.remove(
    'theme-normal', 'theme-sanvalentin', 'theme-navidad', 'theme-muertos', 'theme-grises'
  );
  document.documentElement.classList.add(`theme-${theme}`);
  
  // Guardar en localStorage como fallback
  localStorage.setItem('temaGlobal', theme);
  
  // Si tenemos el usuario, guardar en la base de datos
  if (usuario) {
    try {
      await usuarioService.updateTema(usuario, theme);
    } catch (error) {
      console.error('Error al guardar tema en la base de datos:', error);
      // Si falla la base de datos, al menos tenemos localStorage
    }
  }
}

export async function applySavedTheme(usuario = null) {
  let temaGuardado = 'normal';
  
  // Si tenemos usuario, intentar obtener el tema de la base de datos
  if (usuario) {
    try {
      const userData = await usuarioService.getByUsuario(usuario);
      if (userData && userData.tema) {
        temaGuardado = userData.tema;
      }
    } catch (error) {
      console.error('Error al obtener tema de la base de datos:', error);
      // Si falla, usar localStorage como fallback
      temaGuardado = localStorage.getItem('temaGlobal') || 'normal';
    }
  } else {
    // Si no hay usuario, usar localStorage
    temaGuardado = localStorage.getItem('temaGlobal') || 'normal';
  }
  
  setGlobalTheme(temaGuardado, usuario);
}
