const API_BASE = '/api';

function obtenerToken() {
  return localStorage.getItem('token');
}

async function apiFetch(ruta, opciones = {}) {
  const token = obtenerToken();
  const headers = { 'Content-Type': 'application/json', ...(opciones.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const respuesta = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });

  if (respuesta.status === 401 || respuesta.status === 403) {
    cerrarSesion();
    throw new Error('Sesion expirada, inicia sesion de nuevo.');
  }

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(data.error || 'Ocurrio un error inesperado.');
  }
  return data;
}

async function apiFetchForm(ruta, opciones = {}) {
  const token = obtenerToken();
  const headers = { ...(opciones.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const respuesta = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });

  if (respuesta.status === 401 || respuesta.status === 403) {
    cerrarSesion();
    throw new Error('Sesion expirada, inicia sesion de nuevo.');
  }

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(data.error || 'Ocurrio un error inesperado.');
  }
  return data;
}

const api = {
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  clientes: {
    listar: () => apiFetch('/clientes'),
    crear: (data) => apiFetch('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiFetch(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => apiFetch(`/clientes/${id}`, { method: 'DELETE' })
  },

  cuentas: {
    listar: () => apiFetch('/cuentas'),
    porVencer: () => apiFetch('/cuentas/por-vencer'),
    crear: (data) => apiFetch('/cuentas', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiFetch(`/cuentas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => apiFetch(`/cuentas/${id}`, { method: 'DELETE' }),
    renovar: (id, data) => apiFetch(`/cuentas/${id}/renovar`, { method: 'POST', body: JSON.stringify(data) }),
    cancelar: (id) => apiFetch(`/cuentas/${id}/cancelar`, { method: 'POST' })
  },

  incidencias: {
    listar: () => apiFetch('/incidencias'),
    crear: (data) => apiFetch('/incidencias', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiFetch(`/incidencias/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  servicios: {
    listar: () => apiFetch('/servicios'),
    obtener: (id) => apiFetch(`/servicios/${id}`),
    estadisticas: (id) => apiFetch(`/servicios/${id}/estadisticas`),
    crear: (formData) => apiFetchForm('/servicios', { method: 'POST', body: formData }),
    actualizar: (id, formData) => apiFetchForm(`/servicios/${id}`, { method: 'PUT', body: formData }),
    eliminar: (id) => apiFetch(`/servicios/${id}`, { method: 'DELETE' })
  },

  cuentasMaestras: {
    listar: (servicio_id) => apiFetch(`/servicios/cuentas-maestras/todas${servicio_id ? `?servicio_id=${servicio_id}` : ''}`),
    crear: (data) => apiFetch('/servicios/cuentas-maestras', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiFetch(`/servicios/cuentas-maestras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => apiFetch(`/servicios/cuentas-maestras/${id}`, { method: 'DELETE' })
  },

  mensajes: {
    listar: () => apiFetch('/mensajes'),
    reenviar: (id) => apiFetch(`/mensajes/${id}/reenviar`, { method: 'POST' }),
    notificacionesPendientes: () => apiFetch('/mensajes/notificaciones/pendientes'),
    marcarLeida: (id) => apiFetch(`/mensajes/notificaciones/${id}/leida`, { method: 'PUT' })
  },

  metricas: {
    resumen: () => apiFetch('/metricas/resumen')
  },

  usuarios: {
    listar: () => apiFetch('/usuarios'),
    crear: (data) => apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  roles: {
    listarPermisos: () => apiFetch('/roles/permisos'),
    listar: () => apiFetch('/roles'),
    crear: (data) => apiFetch('/roles', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiFetch(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => apiFetch(`/roles/${id}`, { method: 'DELETE' })
  },

  metodosPago: {
    listar: () => apiFetch('/metodos-pago'),
    crear: (data) => apiFetch('/metodos-pago', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiFetch(`/metodos-pago/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => apiFetch(`/metodos-pago/${id}`, { method: 'DELETE' })
  },

  plantillas: {
    listar: () => apiFetch('/plantillas'),
    actualizar: (id, data) => apiFetch(`/plantillas/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  upload: {
    comprobante: async (archivo) => {
      const formData = new FormData();
      formData.append('imagen', archivo);
      const token = obtenerToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const respuesta = await fetch(`${API_BASE}/upload/comprobante`, {
        method: 'POST',
        headers,
        body: formData
      });

      let data = {};
      try {
        data = await respuesta.json();
      } catch (e) {
        data = { error: 'Error inesperado al procesar la respuesta del servidor.' };
      }

      if (!respuesta.ok) throw new Error(data.error || 'Error al subir la imagen.');
      return data;
    }
  }
};

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  location.reload();
}
