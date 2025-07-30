export const usuarios = [
  { usuario: "admin", password: "12345", rol: "administrador" },
  { usuario: "programador1", password: "prog123", rol: "programador" },
  { usuario: "apertura1", password: "apert123", rol: "apertura" },
  { usuario: "verificador1", password: "verif123", rol: "verificador" },
  { usuario: "dashboard1", password: "dash123", rol: "dashboard" }
];

// Función para buscar usuario
export function buscarUsuario(nombre, password) {
  return usuarios.find(u => u.usuario === nombre && u.password === password);
}

// Función para actualizar usuario (solo en memoria)
export function actualizarUsuario(nombre, nuevoNombre, nuevaPassword) {
  const user = usuarios.find(u => u.usuario === nombre);
  if (user) {
    user.usuario = nuevoNombre;
    user.password = nuevaPassword;
    return true;
  }
  return false;
}
