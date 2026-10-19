let usuarioActual = null;
let vistaActual = null;

let cacheServicios = [];
let cacheCuentasMaestras = [];
let cacheCuentas = [];
let cacheClientes = [];
let cacheIncidencias = [];

let monedaActual = 'USD';
const tasasCambio = {
  USD: 1,
  MXN: 17.50,
  PEN: 3.75
};

window.cambiarMoneda = function () {
  if (monedaActual === 'USD') monedaActual = 'MXN';
  else if (monedaActual === 'MXN') monedaActual = 'PEN';
  else monedaActual = 'USD';

  const btn = document.getElementById('btn-moneda-toggle');
  if (btn) btn.textContent = monedaActual;

  if (typeof vistaActual !== 'undefined' && vistaActual) {
    cargarVista(vistaActual);
  }
};

function formatearMoneda(valorUSD) {
  const v = parseFloat(valorUSD) || 0;
  const vConv = v * tasasCambio[monedaActual];
  const prefix = monedaActual === 'USD' ? '$' : (monedaActual === 'MXN' ? 'Mex$' : 'S/ ');
  return prefix + vConv.toFixed(2);
}

// ==================== TEMA Y UTILIDADES ====================

function inicializarTema() {
  const tema = localStorage.getItem('app-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', tema);
  actualizarIconoTema(tema);
}

function toggleVisibilidadPassword(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;

  if (el.dataset.hidden === 'true') {
    el.textContent = el.dataset.realPassword;
    el.dataset.hidden = 'false';
    if (btn) btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg><span>Ocultar</span>';
  } else {
    el.textContent = '••••••••';
    el.dataset.hidden = 'true';
    if (btn) btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><span>Ver</span>';
  }
}

function alternarTema() {
  const temaActual = document.documentElement.getAttribute('data-theme') || 'dark';
  const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nuevoTema);
  localStorage.setItem('app-theme', nuevoTema);
  actualizarIconoTema(nuevoTema);
  mostrarToast('info', `Modo ${nuevoTema === 'dark' ? 'Oscuro' : 'Claro'} activado`);
}

function actualizarIconoTema(tema) {
  const iconSun = document.getElementById('theme-icon-sun');
  const iconMoon = document.getElementById('theme-icon-moon');
  if (!iconSun || !iconMoon) return;
  if (tema === 'dark') {
    iconSun.classList.remove('oculto');
    iconMoon.classList.add('oculto');
  } else {
    iconSun.classList.add('oculto');
    iconMoon.classList.remove('oculto');
  }
}

// ==================== TOASTS (Notificaciones) ====================

function mostrarToast(tipo, mensaje) {
  const contenedor = document.getElementById('toast-container');
  if (!contenedor) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  let icono = '';
  if (tipo === 'success') {
    icono = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (tipo === 'error') {
    icono = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else {
    icono = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `${icono}<span>${mensaje}</span>`;
  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ==================== LOGIN ====================

function togglePasswordVisibility() {
  const input = document.getElementById('login-password');
  const eyeIcon = document.getElementById('eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  } else {
    input.type = 'password';
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorBox = document.getElementById('login-error');
  const btnSubmit = document.getElementById('btn-login-submit');

  errorBox.classList.add('oculto');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span>Ingresando...</span>';

  try {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    iniciarPanel(data.usuario);
    mostrarToast('success', `¡Bienvenido, ${data.usuario.nombre}!`);
  } catch (err) {
    errorBox.textContent = err.message || 'Credenciales incorrectas.';
    errorBox.classList.remove('oculto');
    mostrarToast('error', err.message || 'Error al iniciar sesión');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<span>Iniciar sesión</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
  }
});

document.getElementById('btn-logout').addEventListener('click', cerrarSesion);

function iniciarPanel(usuario) {
  usuarioActual = usuario;
  document.getElementById('pantalla-login').classList.add('oculto');
  document.getElementById('panel-principal').classList.remove('oculto');

  // Datos usuario
  document.getElementById('usuario-nombre').textContent = usuario.nombre;
  document.getElementById('usuario-rol').textContent = usuario.rol.replace('_', ' ');
  document.getElementById('header-user-name').textContent = usuario.nombre.split(' ')[0];

  const inicial = usuario.nombre.charAt(0).toUpperCase() || 'U';
  document.getElementById('usuario-avatar').textContent = inicial;
  document.getElementById('header-user-avatar').textContent = inicial;

  const permisos = usuario.permisos || [];

  // Hide all items first
  document.querySelectorAll('.nav-item:not(#btn-logout), .nav-item-dropdown-container, .nav-section-title').forEach(el => el.classList.add('oculto'));

  // Logic to show based on permissions
  const p_map = {
    'ver_dashboard': ['dashboard'],
    'ver_plataformas': ['plataformas', 'cat-servicios'],
    'gestionar_cuentas': ['cuentas'],
    'gestionar_clientes': ['clientes'],
    'gestionar_incidencias': ['incidencias'],
    'ver_mensajes': ['mensajes'],
    'gestionar_sistema': ['plantillas', 'roles', 'usuarios', 'cat-sistema', 'metodosPago'] // admin-access
  };

  // If the user has a permission, show the corresponding nav items
  for (const [permiso, vistas] of Object.entries(p_map)) {
    if (permisos.includes(permiso) || usuario.rol === 'super_admin' || usuario.rol === 'Super Admin') {
      vistas.forEach(v => {
        // Find element by data-vista
        document.querySelectorAll(`[data-vista="${v}"]`).forEach(el => el.classList.remove('oculto'));
      });
    }
  }

  // Handle special cases: Dropdowns and Titles
  if (permisos.includes('gestionar_sistema') || usuario.rol === 'super_admin' || usuario.rol === 'Super Admin') {
    document.querySelectorAll('.admin-access').forEach(el => el.classList.remove('oculto'));
  }

  cargarVista('metricas');
  revisarNotificaciones();
  setInterval(revisarNotificaciones, 30000);
}

// Verificación inicial de sesión y tema
(function inicializarApp() {
  inicializarTema();
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');
  if (token && usuario) {
    try {
      iniciarPanel(JSON.parse(usuario));
    } catch (e) {
      cerrarSesion();
    }
  }
})();

// ==================== NAVEGACIÓN ====================

window.toggleSubmenu = function(id) {
  const submenu = document.getElementById(id);
  const arrow = submenu.previousElementSibling.querySelector('.dropdown-arrow');
  if (submenu.classList.contains('open')) {
    submenu.classList.remove('open');
    if (arrow) arrow.classList.remove('open');
  } else {
    document.querySelectorAll('.nav-submenu').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.dropdown-arrow').forEach(el => el.classList.remove('open'));
    submenu.classList.add('open');
    if (arrow) arrow.classList.add('open');
  }
};

document.getElementById('nav-menu').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-item');
  const subBtn = e.target.closest('.nav-sub-item');
  
  if (subBtn) {
    document.querySelectorAll('.nav-item, .nav-sub-item').forEach(el => el.classList.remove('activo'));
    subBtn.classList.add('activo');
    vistaActual = subBtn.dataset.vista;
    const estado = subBtn.dataset.estado;
    cargarVista(vistaActual, estado);
    return;
  }
  
  if (!btn || btn.classList.contains('nav-item-dropdown')) return;
  
  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(el => el.classList.remove('activo'));
  btn.classList.add('activo');
  vistaActual = btn.dataset.vista;
  cargarVista(vistaActual);
});

async function cargarVista(vista, extraParam = null) {
  vistaActual = vista;
  const contenedor = document.getElementById('vista-contenido');
  contenedor.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:300px;color:var(--text-secondary);">
      <p>Cargando información...</p>
    </div>`;

  // Limpiar buscador al cambiar de vista
  const buscador = document.getElementById('filtro-global');
  if (buscador) buscador.value = '';

  try {
    switch (vista) {
      case 'metricas': return await renderMetricas();
      case 'plataformas': return await renderPlataformas(extraParam || 'catalogo');
      case 'cuentas': return await renderCuentas();
      case 'clientes': return await renderClientes();
      case 'incidencias': return await renderIncidencias();
      case 'mensajes': return await renderMensajes();
      case 'plantillas': return await renderPlantillas();
      case 'roles': return await renderRoles();
      case 'metodosPago': return await renderMetodosPago();
      case 'usuarios': return await renderUsuarios(extraParam || 'activo');
    }
  } catch (err) {
    contenedor.innerHTML = `<div class="mensaje-error">${err.message}</div>`;
  }
}

// Búsqueda en tiempo real sobre la tabla activa
function filtrarVistaActual(termino) {
  const q = termino.trim().toLowerCase();
  const filas = document.querySelectorAll('#vista-contenido tbody tr');
  filas.forEach(fila => {
    const texto = fila.textContent.toLowerCase();
    fila.style.display = texto.includes(q) ? '' : 'none';
  });
}

// ==================== MODAL GENÉRICO ====================

function abrirModal(titulo, htmlContenido) {
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-contenido').innerHTML = htmlContenido;
  document.getElementById('modal-overlay').classList.remove('oculto');
}

function cerrarModal() {
  document.getElementById('modal-overlay').classList.add('oculto');
}

function cerrarModalExterno(e) {
  if (e.target.id === 'modal-overlay') {
    cerrarModal();
  }
}

function verComprobanteModal(url) {
  abrirModal('Comprobante de Pago', `
    <div style="text-align:center;">
      <img src="${url}" alt="Comprobante" style="max-width:100%;max-height:65vh;border-radius:var(--radius-md);box-shadow:var(--shadow-md);">
      <div style="margin-top:16px;">
        <a href="${url}" target="_blank" class="btn-secundario" style="text-decoration:none;">Abrir imagen completa ↗</a>
      </div>
    </div>
  `);
}

// ==================== VISTA: MÉTRICAS / DASHBOARD ====================

async function renderMetricas() {
  const [m, cuentas, incidencias, servicios] = await Promise.all([
    api.metricas.resumen(),
    api.cuentas.listar(),
    api.incidencias.listar(),
    api.servicios.listar()
  ]);

  const contenedor = document.getElementById('vista-contenido');
  const diferencia = (parseFloat(m.montoActual) - parseFloat(m.montoAnterior)).toFixed(2);
  const esPositivo = parseFloat(diferencia) >= 0;
  const signo = esPositivo ? '+' : '';

  // Cálculos de porcentajes
  const totalCuentas = parseInt(m.cuentasActivas || 0) + parseInt(m.cuentasPorVencer || 0) + parseInt(m.cuentasVencidas || 0);
  const pActivas = totalCuentas > 0 ? Math.round((m.cuentasActivas / totalCuentas) * 100) : 0;
  const pPorVencer = totalCuentas > 0 ? Math.round((m.cuentasPorVencer / totalCuentas) * 100) : 0;
  const pVencidas = totalCuentas > 0 ? Math.round((m.cuentasVencidas / totalCuentas) * 100) : 0;

  const cuentasPorVencerList = cuentas
    .filter(c => c.estado !== 'cancelada' && new Date(c.fecha_vencimiento) <= new Date(Date.now() + 3 * 86400000))
    .slice(0, 5);

  // Mock data for Compras recientes
  const comprasRecientesList = cuentas.slice(0, 5); // Just using latest 5 for demo

  contenedor.innerHTML = `
    <!-- HEADER -->
    <div class="vista-header" style="background:var(--bg-card); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; flex-direction:row; align-items:center; gap:20px;">
      <div style="flex:1;">
        <h1 style="color:var(--color-positive); font-size:18px; display:flex; align-items:center; gap:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ¡Bienvenido! Sistema Verificado. <a href="#" style="color:var(--accent-primary); text-decoration:underline; font-size:14px; font-weight:normal; margin-left:8px;">Ver detalles</a>
        </h1>
        <div style="margin-top:16px; color:var(--text-primary); font-size:14px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Sr. ${usuarioActual ? usuarioActual.nombre : 'Admin'}
          </div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
      
      <!-- Balance del mes (Gastos) -->
      <div style="flex:2; display:flex; flex-direction:column; background:var(--bg-surface); padding:16px; border-radius:var(--radius-sm);">
        <div style="font-size:14px; font-weight:600; color:var(--text-secondary); margin-bottom:12px;">Balance del mes (Estimado) <span style="color:var(--color-negative);">↓</span></div>
        <div style="display:flex; justify-content:space-between; text-align:center;">
          <div style="flex:1; border-right:1px solid var(--border-color);">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px; color:var(--text-primary); font-weight:700; font-size:16px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Compra: ${formatearMoneda(parseFloat(m.montoActual) * 0.4)}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Total de compras mes</div>
          </div>
          <div style="flex:1; border-right:1px solid var(--border-color);">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px; color:var(--text-primary); font-weight:700; font-size:16px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
              Venta: ${formatearMoneda(m.montoActual)}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Total de ventas mes</div>
          </div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px; color:var(--color-positive); font-weight:700; font-size:16px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Balance: ${formatearMoneda(parseFloat(m.montoActual) * 0.6)}
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Balance del mes</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ROW: GRÁFICO COMPRA Y VENTA POR MES -->
    <div style="display:grid; grid-template-columns: 3fr 1fr; gap:20px; margin-top:24px;">
      <div class="dashboard-chart-box">
        <div class="dashboard-chart-header">
          <span class="dashboard-chart-title">Compra y venta por mes</span>
          <button class="btn-secundario" style="font-size:12px; padding:4px 10px;">ESTADÍSTICA</button>
        </div>
        <div id="chart-compras-ventas" style="width:100%; height:300px;"></div>
      </div>
      
      <div class="dashboard-balance-side">
        <div style="display:flex; justify-content:center; margin-bottom:10px;">
          <div style="background:var(--color-warning-light); color:var(--color-warning); padding:8px; border-radius:8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
        </div>
        <div style="font-size:12px; font-weight:700; color:var(--color-warning); text-align:center; letter-spacing:1px;">BALANCE ANUAL</div>
        
        <div class="balance-item">
          <span class="balance-item-label">Compra</span>
          <span class="balance-item-value">
            <span style="color:var(--color-warning); font-size:14px;">♦</span>
            ${formatearMoneda(4150)}
          </span>
        </div>
        
        <div class="balance-item">
          <span class="balance-item-label">Venta</span>
          <span class="balance-item-value">
            <span style="color:var(--accent-secondary); font-size:14px;">♦</span>
            ${formatearMoneda(8520)}
          </span>
        </div>
        
        <div class="balance-item">
          <span class="balance-item-label">Ganancia</span>
          <span class="balance-item-value">
            <span style="color:var(--color-positive); font-size:14px;">♦</span>
            ${formatearMoneda(4370)}
          </span>
        </div>
      </div>
    </div>

    <!-- ROW: MÁS VENDIDOS Y COMPRAS RECIENTES -->
    <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; margin-top:24px;">
      <div class="dashboard-chart-box">
        <div class="dashboard-chart-header">
          <span class="dashboard-chart-title">Más vendidos (Servicios)</span>
        </div>
        <div id="chart-mas-vendidos" style="width:100%; height:250px; display:flex; justify-content:center;"></div>
      </div>
      
      <div class="dashboard-chart-box" style="padding:0;">
        <div class="dashboard-chart-header" style="padding:22px 22px 0 22px;">
          <span class="dashboard-chart-title">Compras recientes (Clientes)</span>
        </div>
        <div style="overflow-x:auto; padding:0 22px 22px 22px;">
          <table style="width:100%; text-align:left; border-collapse:collapse; margin-top:10px;">
            <thead>
              <tr style="color:var(--text-muted); font-size:12px; border-bottom:1px solid var(--border-color);">
                <th style="padding:10px 0;">Servicio</th>
                <th>Cant</th>
                <th>Precio</th>
                <th>Fecha Compra</th>
                <th>Estado</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              ${comprasRecientesList.map(c => `
                <tr style="border-bottom:1px solid var(--border-subtle);">
                  <td style="padding:12px 0; display:flex; align-items:center; gap:8px;">
                    <div style="width:24px; height:24px; border-radius:50%; background:var(--bg-surface); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold;">
                      ${c.servicio_nombre.charAt(0)}
                    </div>
                    ${c.cliente_nombre.split(' ')[0]}
                  </td>
                  <td style="font-size:13px;">1</td>
                  <td style="color:var(--accent-secondary); font-size:13px;">${formatearMoneda(c.precio || 15.00)}</td>
                  <td style="font-size:13px;">${c.fecha_inicio ? new Date(c.fecha_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</td>
                  <td><span class="badge badge-activa" style="padding:2px 6px; font-size:10px;">Activo</span></td>
                  <td style="font-size:13px; color:var(--text-secondary);">Mensual</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ROW: CATEGORÍAS -->
    <div class="dashboard-chart-box" style="margin-top:24px;">
      <div class="dashboard-chart-header" style="margin-bottom:0;">
        <span class="dashboard-chart-title">Categorías</span>
        <button class="btn-secundario" style="font-size:12px; padding:4px 10px;" onclick="cargarVista('plataformas')">ESTADÍSTICA</button>
      </div>
      <div class="category-cards-grid">
        ${servicios.slice(0, 5).map(s => `
          <div class="category-card-item" onclick="cargarVista('plataformas', ${s.id})">
            <div class="category-card-logo" style="background:${s.icono_color}15;">
              <span class="fallback-icon" style="color:${s.icono_color};">${s.nombre.substring(0, 2).toUpperCase()}</span>
            </div>
            <div class="category-card-name">${s.nombre}</div>
            <div class="category-card-sub">${s.total_cuentas_activas} activas</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- ROW: VIEJO DASHBOARD DE ESTADOS Y VENCIMIENTOS -->
    <div class="dashboard-grid" style="margin-top:24px;">
      <div class="card-box">
        <div class="card-box-header">
          <span class="card-box-title">Estado de Suscripciones Globales</span>
        </div>
        <div class="progreso-item">
          <div class="progreso-header"><span>Activas</span><strong>${m.cuentasActivas} (${pActivas}%)</strong></div>
          <div class="progreso-bar-bg"><div class="progreso-bar-fill" style="width:${pActivas}%;background:var(--color-positive);"></div></div>
        </div>
        <div class="progreso-item">
          <div class="progreso-header"><span>Por vencer (3 días)</span><strong>${m.cuentasPorVencer} (${pPorVencer}%)</strong></div>
          <div class="progreso-bar-bg"><div class="progreso-bar-fill" style="width:${pPorVencer}%;background:var(--color-warning);"></div></div>
        </div>
        <div class="progreso-item">
          <div class="progreso-header"><span>Vencidas</span><strong>${m.cuentasVencidas} (${pVencidas}%)</strong></div>
          <div class="progreso-bar-bg"><div class="progreso-bar-fill" style="width:${pVencidas}%;background:var(--color-negative);"></div></div>
        </div>
      </div>
      <div class="card-box">
        <div class="card-box-header">
          <span class="card-box-title">Vencimientos Próximos</span>
          <button class="btn-secundario" onclick="cargarVista('cuentas')">Ver →</button>
        </div>
        <div style="font-size:13px;">
          ${cuentasPorVencerList.map(c => `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding:8px 0;">
              <span>${c.cliente_nombre.split(' ')[0]} - <strong>${c.servicio_nombre}</strong></span>
              <span style="color:var(--color-warning);">${new Date(c.fecha_vencimiento).toLocaleDateString()}</span>
            </div>
          `).join('') || '<div style="color:var(--text-muted); padding:10px 0;">Nada próximo a vencer.</div>'}
        </div>
      </div>
    </div>
  `;

  // Inicializar gráficos después de renderizar el HTML
  setTimeout(initDashboardCharts, 100);
}

function initDashboardCharts() {
  if (typeof ApexCharts === 'undefined') return;

  const tema = document.documentElement.getAttribute('data-theme') || 'dark';
  const isDark = tema === 'dark';
  const textColor = isDark ? '#A1A7B3' : '#64748B';
  const gridColor = isDark ? '#2A313C' : '#E2E8F0';

  // 1. Gráfico Compra y Venta por Mes (Área/Líneas suavizadas)
  const chartComprasVentasOptions = {
    series: [
      { name: 'Ventas', data: [0, 420, 100, 20, 220, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'Compras', data: [100, 20, 130, 0, 100, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'Ganancia', data: [-100, 400, -140, 20, 120, 0, 0, 0, 0, 0, 0, 0] }
    ],
    chart: { type: 'area', height: 300, toolbar: { show: false }, background: 'transparent' },
    colors: ['#7C5CFF', '#22C55E', '#2D8CFF'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'],
      labels: { style: { colors: textColor } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { labels: { style: { colors: textColor } } },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    legend: { position: 'bottom', labels: { colors: textColor } },
    theme: { mode: isDark ? 'dark' : 'light' }
  };

  const chartCV = new ApexCharts(document.querySelector("#chart-compras-ventas"), chartComprasVentasOptions);
  chartCV.render();

  // 2. Gráfico Más Vendidos (Dona)
  const chartMasVendidosOptions = {
    series: [40, 60, 20, 10, 5],
    labels: ['Amazon', 'Netflix', 'HBO Max', 'Spotify pro', 'Youtube'],
    chart: { type: 'donut', height: 260, background: 'transparent' },
    colors: ['#2D8CFF', '#EF4444', '#7C5CFF', '#22C55E', '#F59E0B'],
    stroke: { show: true, colors: [isDark ? '#1B212C' : '#FFFFFF'], width: 2 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: { show: false }
        }
      }
    },
    legend: { position: 'bottom', labels: { colors: textColor }, itemMargin: { horizontal: 5, vertical: 5 } },
    theme: { mode: isDark ? 'dark' : 'light' }
  };

  const chartMV = new ApexCharts(document.querySelector("#chart-mas-vendidos"), chartMasVendidosOptions);
  chartMV.render();
}

// ==================== VISTA: GESTIÓN DE PLATAFORMAS & CUENTAS MAESTRAS ====================

async function renderPlataformas() {
  const [servicios, cuentasMaestras] = await Promise.all([
    api.servicios.listar(),
    api.cuentasMaestras.listar()
  ]);

  cacheServicios = servicios;
  cacheCuentasMaestras = cuentasMaestras;

  const contenedor = document.getElementById('vista-contenido');

  contenedor.innerHTML = `
    <div class="vista-header">
      <div class="vista-titulo-box">
        <h1>Gestión de Plataformas y Cuentas</h1>
        <p>Administra tu catálogo de servicios, precios de venta y las credenciales maestras</p>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn-secundario" onclick="formPlataformaModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>+ Nueva Plataforma</span>
        </button>
      </div>
    </div>

    <div class="plataformas-grid">
      ${servicios.map(s => {
        const precioBase = parseFloat(s.precio_base || 0).toFixed(2);
        const precioCosto = parseFloat(s.precio_costo || 0).toFixed(2);
        const margen = (parseFloat(precioBase) - parseFloat(precioCosto)).toFixed(2);
        const esMargenPositivo = parseFloat(margen) >= 0;

        const penBase = (parseFloat(precioBase) * (tasasCambio['PEN'] || 3.75)).toFixed(2);
        const mxnBase = (parseFloat(precioBase) * (tasasCambio['MXN'] || 17.50)).toFixed(2);
        const penCosto = (parseFloat(precioCosto) * (tasasCambio['PEN'] || 3.75)).toFixed(2);
        const mxnCosto = (parseFloat(precioCosto) * (tasasCambio['MXN'] || 17.50)).toFixed(2);

        return `
          <div class="plataforma-card">
            <div>
              <div class="plataforma-card-header">
                <div class="plataforma-icon-box" style="background:${s.icono_color || 'var(--accent-primary)'}; background-image: ${s.logo_url ? `url('${s.logo_url}')` : 'none'}; background-size: cover; background-position: center; overflow: hidden; color: ${s.logo_url ? 'transparent' : 'inherit'};">
                  ${!s.logo_url ? s.nombre.charAt(0).toUpperCase() : ''}
                </div>
                <div class="plataforma-info">
                  <div class="plataforma-nombre" title="${s.nombre}">${s.nombre}</div>
                  <div class="plataforma-cat">${s.categoria || 'Streaming'} • Max ${s.perfiles_max || 5} perfiles</div>
                </div>
              </div>

              <div class="plataforma-precios" style="margin-top:14px;">
                <div class="precio-item" style="display:flex; flex-direction:column; gap:2px;">
                  <span class="precio-label">Precio Venta</span>
                  <span class="precio-valor">$${precioBase}</span>
                  <span style="font-size: 10.5px; color: var(--text-muted);">S/ ${penBase} | Mex$ ${mxnBase}</span>
                </div>
                <div class="precio-item" style="display:flex; flex-direction:column; gap:2px;">
                  <span class="precio-label">Costo Prov.</span>
                  <span class="precio-valor" style="color:var(--text-secondary);">$${precioCosto}</span>
                  <span style="font-size: 10.5px; color: var(--text-muted);">S/ ${penCosto} | Mex$ ${mxnCosto}</span>
                </div>
              </div>

              <div style="margin-top:8px;font-size:12px;display:flex;justify-content:space-between;">
                <span style="color:var(--text-secondary);">Margen est. / cuenta:</span>
                <strong style="color:${esMargenPositivo ? 'var(--color-positive)' : 'var(--color-negative)'};">
                  ${esMargenPositivo ? '+' : ''}$${margen}
                </strong>
              </div>

              ${s.descripcion ? `<p style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.4;">${s.descripcion}</p>` : ''}
            </div>

            <div>
              <div class="plataforma-stats-bar">
                <span>🔑 ${s.total_cuentas_maestras || 0} Cuentas prov.</span>
                <span>👥 ${s.total_cuentas_activas || 0} Clientes act.</span>
              </div>

              <div class="plataforma-acciones" style="margin-top:12px; display: flex; gap: 8px;">
                <button class="btn-tabla" style="flex: 1; background: rgba(34, 197, 94, 0.1); color: #22c55e;" onclick="renderEstadisticasPlataforma(${s.id})">📈 Stats & Cuentas</button>
                <button class="btn-tabla" style="flex: 1;" onclick="formPlataformaModal(${s.id})">✏️ Editar</button>
                <button class="btn-tabla btn-peligro" style="flex: 1;" onclick="eliminarPlataforma(${s.id})">🗑️ Borrar</button>
              </div>
            </div>
          </div>
        `;
      }).join('') || '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No hay plataformas configuradas aún.</div>'}
    </div>
  `;
}


// Función global para actualizar conversiones en vivo en el modal de plataforma
window.actualizarConversionesMoneda = function (inputElem, targetId) {
  const v = parseFloat(inputElem.value) || 0;
  const target = document.getElementById(targetId);
  if (target) {
    if (v > 0) {
      const pen = (v * (tasasCambio['PEN'] || 3.75)).toFixed(2);
      const mxn = (v * (tasasCambio['MXN'] || 17.50)).toFixed(2);
      target.textContent = `≈ S/ ${pen} | Mex$ ${mxn}`;
    } else {
      target.textContent = '';
    }
  }
};

// Modal para crear / editar plataforma
async function formPlataformaModal(id = null) {
  let plat = { nombre: '', precio_base: 8.00, precio_costo: 4.50, perfiles_max: 5, categoria: 'Streaming Video', icono_color: '#7C5CFF', descripcion: '' };
  if (id) {
    plat = cacheServicios.find(s => s.id === id) || plat;
  }

  abrirModal(id ? 'Editar Plataforma' : 'Nueva Plataforma', `
    <label>Nombre de la plataforma</label>
    <input id="pl-nombre" value="${plat.nombre}" placeholder="Ej: Netflix, Disney+, Spotify, etc.">

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label>Precio Venta / Mes ($)</label>
        <input type="number" step="0.01" id="pl-precio" value="${plat.precio_base || ''}" placeholder="8.00" oninput="actualizarConversionesMoneda(this, 'conversion-precio')">
        <div id="conversion-precio" style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;"></div>
      </div>
      <div>
        <label>Costo Proveedor / Mes ($)</label>
        <input type="number" step="0.01" id="pl-costo" value="${plat.precio_costo || ''}" placeholder="4.50" oninput="actualizarConversionesMoneda(this, 'conversion-costo')">
        <div id="conversion-costo" style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;"></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label>Perfiles / Pantallas máx.</label>
        <input type="number" id="pl-perfiles" value="${plat.perfiles_max || 5}" placeholder="5">
      </div>
      <div>
        <label>Categoría</label>
        <select id="pl-categoria">
          <option value="Streaming Video" ${plat.categoria === 'Streaming Video' ? 'selected' : ''}>Streaming Video</option>
          <option value="Música" ${plat.categoria === 'Música' ? 'selected' : ''}>Música</option>
          <option value="Anime" ${plat.categoria === 'Anime' ? 'selected' : ''}>Anime</option>
          <option value="Gaming" ${plat.categoria === 'Gaming' ? 'selected' : ''}>Gaming</option>
          <option value="Educación" ${plat.categoria === 'Educación' ? 'selected' : ''}>Educación / Trabajo</option>
          <option value="Otros" ${plat.categoria === 'Otros' ? 'selected' : ''}>Otros</option>
        </select>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label>Color del Icono / Marca</label>
        <div style="display:flex;align-items:center;gap:12px;">
          <input type="color" id="pl-color" value="${plat.icono_color || '#7C5CFF'}" style="width:50px;height:40px;padding:2px;cursor:pointer;background:transparent;border:1px solid var(--border-color);border-radius:var(--radius-sm);">
          <span style="font-size:12.5px;color:var(--text-secondary);">${plat.icono_color || '#7C5CFF'}</span>
        </div>
      </div>
      <div>
        <label>Foto / Logo (Opcional)</label>
        <div style="display:flex;align-items:center;gap:12px; margin-top: 4px;">
          ${plat.logo_url ? `<img src="${plat.logo_url}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover;">` : ''}
          <input type="file" id="pl-foto" accept="image/*" style="font-size:12px;color:var(--text-secondary);">
        </div>
      </div>
    </div>

    <label>Descripción o Términos (Opcional)</label>
    <textarea id="pl-desc" placeholder="Detalles sobre calidad 4K UHD, límites de dispositivos, etc.">${plat.descripcion || ''}</textarea>

    <button class="btn-primario btn-lg" style="margin-top:10px;" onclick="guardarPlataforma(${id || 'null'})">
      ${id ? 'Guardar Cambios' : 'Registrar Plataforma'}
    </button>
  `);

  // Inicializar las conversiones si hay valores preexistentes
  setTimeout(() => {
    const plPrecio = document.getElementById('pl-precio');
    const plCosto = document.getElementById('pl-costo');
    if (plPrecio) window.actualizarConversionesMoneda(plPrecio, 'conversion-precio');
    if (plCosto) window.actualizarConversionesMoneda(plCosto, 'conversion-costo');
  }, 50);
}

async function guardarPlataforma(id) {
  try {
    const formData = new FormData();
    formData.append('nombre', document.getElementById('pl-nombre').value.trim());
    formData.append('precio_base', parseFloat(document.getElementById('pl-precio').value) || 0);
    formData.append('precio_costo', parseFloat(document.getElementById('pl-costo').value) || 0);
    formData.append('perfiles_max', parseInt(document.getElementById('pl-perfiles').value, 10) || 5);
    formData.append('categoria', document.getElementById('pl-categoria').value);
    formData.append('icono_color', document.getElementById('pl-color').value);
    formData.append('descripcion', document.getElementById('pl-desc').value.trim());

    const fotoFile = document.getElementById('pl-foto').files[0];
    if (fotoFile) {
      formData.append('foto', fotoFile);
    }

    if (!formData.get('nombre')) throw new Error('El nombre de la plataforma es obligatorio.');

    if (id) {
      await api.servicios.actualizar(id, formData);
      mostrarToast('success', '¡Plataforma actualizada correctamente!');
    } else {
      await api.servicios.crear(formData);
      mostrarToast('success', '¡Plataforma creada exitosamente!');
    }

    cerrarModal();
    renderPlataformas('catalogo');
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

async function eliminarPlataforma(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Eliminar Plataforma', '¿Seguro que deseas eliminar esta plataforma?', 'Sí, eliminar', `eliminarPlataforma(${id}, true)`);
  }
  try {
    await api.servicios.eliminar(id);
    mostrarToast('success', 'Plataforma eliminada.');
    renderPlataformas('catalogo');
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

// Modal para crear / editar credenciales de cuentas maestras
async function formCuentaMaestraModal(id = null, preselectedServicioId = null) {
  if (!cacheServicios || cacheServicios.length === 0) {
    try { cacheServicios = await api.servicios.listar(); } catch(e) {}
  }
  const servicios = cacheServicios || [];
  let cm = { servicio_id: preselectedServicioId || (servicios[0] ? servicios[0].id : ''), correo: '', password: '', pin: '', perfiles_totales: 5, perfiles_ocupados: 0, fecha_renovacion: '', proveedor: '', costo: 0, estado: 'activa', notas: '' };

  if (id) {
    cm = cacheCuentasMaestras.find(c => c.id === id) || cm;
  }

  abrirModal(id ? 'Editar Credenciales de Cuenta Maestra' : 'Añadir Cuenta Maestra (Proveedor)', `
    <label>Plataforma / Servicio</label>
    <select id="cm-servicio">
      ${servicios.map(s => `<option value="${s.id}" ${cm.servicio_id == s.id ? 'selected' : ''}>${s.nombre}</option>`).join('')}
    </select>

    <label>Correo electrónico / Usuario de acceso</label>
    <input id="cm-correo" value="${cm.correo}" placeholder="cuenta.maestra@gmail.com">

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label>Contraseña</label>
        <input id="cm-password" value="${cm.password}" placeholder="Contraseña de la cuenta">
      </div>
      <div>
        <label>PIN de perfil / control (Opcional)</label>
        <input id="cm-pin" value="${cm.pin || ''}" placeholder="1234">
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label>Perfiles / Pantallas Totales</label>
        <input type="number" id="cm-totales" value="${cm.perfiles_totales || 5}">
      </div>
      <div>
        <label>Perfiles Ocupados</label>
        <input type="number" id="cm-ocupados" value="${cm.perfiles_ocupados || 0}">
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label>Fecha de renovación con proveedor</label>
        <input type="date" id="cm-fecha" value="${cm.fecha_renovacion ? new Date(cm.fecha_renovacion).toISOString().split('T')[0] : ''}">
      </div>
      <div>
        <label>Costo pagado al proveedor ($)</label>
        <input type="number" step="0.01" id="cm-costo" value="${cm.costo || ''}" placeholder="4.50">
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div>
        <label>Nombre del Proveedor</label>
        <input id="cm-proveedor" value="${cm.proveedor || ''}" placeholder="Ej: Proveedor Juan, Grupo Telegram, etc.">
      </div>
      <div>
        <label>Estado de la cuenta</label>
        <select id="cm-estado">
          <option value="activa" ${cm.estado === 'activa' ? 'selected' : ''}>Activa (En funcionamiento)</option>
          <option value="caida" ${cm.estado === 'caida' ? 'selected' : ''}>Caída / Contraseña cambiada</option>
          <option value="en_revision" ${cm.estado === 'en_revision' ? 'selected' : ''}>En revisión</option>
          <option value="vencida" ${cm.estado === 'vencida' ? 'selected' : ''}>Vencida</option>
        </select>
      </div>
    </div>

    <label>Notas internas</label>
    <textarea id="cm-notas" placeholder="Método de pago del proveedor, garantía hasta tal fecha...">${cm.notas || ''}</textarea>

    <button class="btn-primario btn-lg" style="margin-top:10px;" onclick="guardarCuentaMaestra(${id || 'null'})">
      ${id ? 'Guardar Cambios' : 'Registrar Credenciales'}
    </button>
  `);
}

async function guardarCuentaMaestra(id) {
  try {
    const data = {
      servicio_id: document.getElementById('cm-servicio').value,
      correo: document.getElementById('cm-correo').value.trim(),
      password: document.getElementById('cm-password').value.trim(),
      pin: document.getElementById('cm-pin').value.trim() || null,
      perfiles_totales: parseInt(document.getElementById('cm-totales').value, 10) || 5,
      perfiles_ocupados: parseInt(document.getElementById('cm-ocupados').value, 10) || 0,
      fecha_renovacion: document.getElementById('cm-fecha').value || null,
      proveedor: document.getElementById('cm-proveedor').value.trim() || null,
      costo: parseFloat(document.getElementById('cm-costo').value) || 0,
      estado: document.getElementById('cm-estado').value,
      notas: document.getElementById('cm-notas').value.trim() || null
    };

    if (!data.servicio_id || !data.correo || !data.password) {
      throw new Error('La plataforma, el correo y la contraseña son obligatorios.');
    }

    if (id) {
      await api.cuentasMaestras.actualizar(id, data);
      mostrarToast('success', 'Credenciales actualizadas correctamente.');
    } else {
      await api.cuentasMaestras.crear(data);
      mostrarToast('success', '¡Cuenta maestra registrada!');
    }

    cerrarModal();
    renderPlataformas('cuentas_maestras');
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

async function eliminarCuentaMaestra(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Eliminar Credenciales', '¿Seguro que deseas eliminar estas credenciales?', 'Sí, eliminar', `eliminarCuentaMaestra(${id}, true)`);
  }
  try {
    await api.cuentasMaestras.eliminar(id);
    mostrarToast('success', 'Cuenta maestra eliminada.');
    renderPlataformas('cuentas_maestras');
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

// ==================== VISTA: CUENTAS ====================

// ==================== FORMULARIO NUEVA CUENTA (MULTI-CUENTA & SUGERENCIAS) ====================

let multiCuentasItems = [];

function formCuentaModal() {
  const clientes = cacheClientes || [];
  const servicios = cacheServicios || [];
  const cuentasMaestras = cacheCuentasMaestras || [];

  const hoy = new Date().toISOString().split('T')[0];
  const vence = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const primerServicio = servicios[0] || { id: '', precio_base: 8.00 };

  const cmSugerida = cuentasMaestras.find(cm => cm.servicio_id == primerServicio.id && (cm.perfiles_ocupados < cm.perfiles_totales));

  multiCuentasItems = [{
    id: Date.now(),
    servicio_id: primerServicio.id,
    cuenta_maestra_id: cmSugerida ? cmSugerida.id : '',
    tipo_perfil: 'Perfil 1',
    pin: cmSugerida && cmSugerida.pin ? cmSugerida.pin : '',
    fecha_compra: hoy,
    fecha_vencimiento: vence,
    monto: parseFloat(primerServicio.precio_base || 8.00).toFixed(2)
  }];

  abrirModal('Registrar Nueva(s) Cuenta(s)', `
    <label>Cliente</label>
    <select id="cu-cliente">
      ${clientes.map(c => `<option value="${c.id}">${c.nombre} (${c.telefono})</option>`).join('')}
    </select>

    <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0 8px 0;">
      <span style="font-size:13px;font-weight:700;color:var(--text-primary);">Suscripciones / Cuentas a registrar</span>
      <button type="button" class="btn-secundario" style="font-size:12px;padding:5px 10px;" onclick="agregarItemMultiCuenta()">
        + Añadir otra plataforma
      </button>
    </div>

    <div id="multi-cuentas-container"></div>

    <div style="background:var(--bg-surface);padding:12px 16px;border-radius:var(--radius-md);border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;margin:14px 0;">
      <span style="font-size:13px;color:var(--text-secondary);">Total a cobrar:</span>
      <strong id="multi-cuentas-total" style="font-size:18px;color:var(--color-positive);">$0.00</strong>
    </div>

    <label>Comprobante de pago (Imagen/GIF - Opcional)</label>
    <div class="upload-dropzone" onclick="document.getElementById('cu-comprobante').click()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" style="margin-bottom:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
      <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Haz clic para seleccionar comprobante</div>
      <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">PNG, JPG, WEBP, GIF (Máx. 5MB)</div>
      <input type="file" id="cu-comprobante" accept="image/*" style="display:none;" onchange="mostrarPreviewArchivo(this, 'cu-preview')">
    </div>
    <div id="cu-preview"></div>

    <button class="btn-primario btn-lg" style="margin-top:14px;" onclick="guardarMultiCuentas()">Guardar todas las cuentas</button>
  `);

  renderMultiCuentasItems();
}

function renderMultiCuentasItems() {
  const container = document.getElementById('multi-cuentas-container');
  if (!container) return;

  const servicios = cacheServicios || [];
  const cuentasMaestras = cacheCuentasMaestras || [];

  let total = 0;

  container.innerHTML = multiCuentasItems.map((item, idx) => {
    total += parseFloat(item.monto || 0);
    const servicioActual = servicios.find(s => s.id == item.servicio_id) || servicios[0];

    const cmsDeServicio = cuentasMaestras.filter(cm => cm.servicio_id == item.servicio_id);
    const cmSugerida = cmsDeServicio.find(cm => cm.perfiles_ocupados < cm.perfiles_totales);

    return `
      <div class="multi-cuenta-item">
        <div class="multi-cuenta-header">
          <div class="multi-cuenta-title">
            <span>Suscripción #${idx + 1}</span>
            <span style="font-size:11.5px;color:var(--text-muted);">(${servicioActual ? servicioActual.nombre : ''})</span>
          </div>
          ${multiCuentasItems.length > 1 ? `
            <button type="button" class="btn-tabla btn-peligro" style="padding:2px 8px;font-size:11px;" onclick="eliminarItemMultiCuenta(${idx})">Eliminar ✕</button>
          ` : ''}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label>Plataforma</label>
            <select onchange="cambiarPlataformaItem(${idx}, this.value)">
              ${servicios.map(s => `<option value="${s.id}" ${item.servicio_id == s.id ? 'selected' : ''}>${s.nombre} (${formatearMoneda(s.precio_base)})</option>`).join('')}
            </select>
          </div>
          <div>
            <label>Cuenta Maestra (Sugerencia)</label>
            <select onchange="cambiarCuentaMaestraItem(${idx}, this.value)">
              <option value="">-- Sin vincular / Personalizada --</option>
              ${cmsDeServicio.map(cm => {
      const libres = cm.perfiles_totales - cm.perfiles_ocupados;
      const esSugerida = cmSugerida && cmSugerida.id === cm.id;
      return `<option value="${cm.id}" ${item.cuenta_maestra_id == cm.id ? 'selected' : ''}>
                  ${esSugerida ? '✨ [Sugerida] ' : ''}${cm.correo} (${cm.perfiles_ocupados}/${cm.perfiles_totales} - ${libres > 0 ? libres + ' libres' : 'LLENO'})
                </option>`;
    }).join('')}
            </select>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label>Tipo de perfil / Pantalla</label>
            <input value="${item.tipo_perfil}" placeholder="Ej: Perfil 1" oninput="multiCuentasItems[${idx}].tipo_perfil = this.value">
          </div>
          <div>
            <label>PIN de perfil (Opcional)</label>
            <input value="${item.pin || ''}" placeholder="Ej: 1234" oninput="multiCuentasItems[${idx}].pin = this.value">
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          <div>
            <label>Compra</label>
            <input type="date" value="${item.fecha_compra}" onchange="multiCuentasItems[${idx}].fecha_compra = this.value">
          </div>
          <div>
            <label>Vence</label>
            <input type="date" value="${item.fecha_vencimiento}" onchange="multiCuentasItems[${idx}].fecha_vencimiento = this.value">
          </div>
          <div>
            <label>Monto ($)</label>
            <input type="number" step="0.01" value="${item.monto}" oninput="actualizarMontoItem(${idx}, this.value)">
          </div>
        </div>
      </div>
    `;
  }).join('');

  const totalEl = document.getElementById('multi-cuentas-total');
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function agregarItemMultiCuenta() {
  const servicios = cacheServicios || [];
  const cuentasMaestras = cacheCuentasMaestras || [];
  const hoy = new Date().toISOString().split('T')[0];
  const vence = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const primerServicio = servicios[0] || { id: '', precio_base: 8.00 };

  const cmSugerida = cuentasMaestras.find(cm => cm.servicio_id == primerServicio.id && (cm.perfiles_ocupados < cm.perfiles_totales));

  multiCuentasItems.push({
    id: Date.now(),
    servicio_id: primerServicio.id,
    cuenta_maestra_id: cmSugerida ? cmSugerida.id : '',
    tipo_perfil: `Perfil ${multiCuentasItems.length + 1}`,
    pin: cmSugerida && cmSugerida.pin ? cmSugerida.pin : '',
    fecha_compra: hoy,
    fecha_vencimiento: vence,
    monto: parseFloat(primerServicio.precio_base || 8.00).toFixed(2)
  });

  renderMultiCuentasItems();
}

function eliminarItemMultiCuenta(index) {
  if (multiCuentasItems.length <= 1) return;
  multiCuentasItems.splice(index, 1);
  renderMultiCuentasItems();
}

function cambiarPlataformaItem(index, servicioId) {
  const servicios = cacheServicios || [];
  const cuentasMaestras = cacheCuentasMaestras || [];
  const serv = servicios.find(s => s.id == servicioId);

  const cmSugerida = cuentasMaestras.find(cm => cm.servicio_id == servicioId && (cm.perfiles_ocupados < cm.perfiles_totales));

  multiCuentasItems[index].servicio_id = servicioId;
  multiCuentasItems[index].cuenta_maestra_id = cmSugerida ? cmSugerida.id : '';
  multiCuentasItems[index].pin = cmSugerida && cmSugerida.pin ? cmSugerida.pin : '';
  if (serv && serv.precio_base) {
    multiCuentasItems[index].monto = parseFloat(serv.precio_base).toFixed(2);
  }

  renderMultiCuentasItems();
}

function cambiarCuentaMaestraItem(index, cuentaMaestraId) {
  const cuentasMaestras = cacheCuentasMaestras || [];
  const cm = cuentasMaestras.find(c => c.id == cuentaMaestraId);

  multiCuentasItems[index].cuenta_maestra_id = cuentaMaestraId || null;
  if (cm && cm.pin) {
    multiCuentasItems[index].pin = cm.pin;
  }
  renderMultiCuentasItems();
}

function actualizarMontoItem(index, valor) {
  multiCuentasItems[index].monto = valor;
  let total = 0;
  multiCuentasItems.forEach(it => total += (parseFloat(it.monto) || 0));
  const totalEl = document.getElementById('multi-cuentas-total');
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

async function guardarMultiCuentas() {
  try {
    const clienteId = document.getElementById('cu-cliente').value;
    if (!clienteId) throw new Error('Por favor selecciona un cliente.');

    let comprobanteUrl = null;
    const inputArchivo = document.getElementById('cu-comprobante');
    const archivo = inputArchivo ? inputArchivo.files[0] : null;

    if (archivo) {
      mostrarToast('info', 'Subiendo comprobante...');
      const subida = await api.upload.comprobante(archivo);
      comprobanteUrl = subida.url;
    }

    if (multiCuentasItems.length === 1) {
      const item = multiCuentasItems[0];
      await api.cuentas.crear({
        cliente_id: clienteId,
        servicio_id: item.servicio_id,
        cuenta_maestra_id: item.cuenta_maestra_id || null,
        tipo_perfil: item.tipo_perfil,
        pin: item.pin || null,
        fecha_compra: item.fecha_compra,
        fecha_vencimiento: item.fecha_vencimiento,
        monto: item.monto,
        comprobante_imagen_url: comprobanteUrl
      });
      mostrarToast('success', '¡Cuenta registrada correctamente!');
    } else {
      await api.cuentas.crear({
        cliente_id: clienteId,
        comprobante_imagen_url: comprobanteUrl,
        items: multiCuentasItems
      });
      mostrarToast('success', `¡${multiCuentasItems.length} cuentas registradas con éxito!`);
    }

    cerrarModal();
    renderCuentas();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

// ==================== FORMULARIO SUSCRIPCION (SLOTS) ====================

async function formSuscripcionModal(cuentaMaestraId, slotNumber, cuentaClienteId = null) {
  const cm = cacheCuentasMaestras.find(c => c.id == cuentaMaestraId);
  if (!cacheServicios || cacheServicios.length === 0) {
    try { cacheServicios = await api.servicios.listar(); } catch(e) {}
  }
  const servicio = (cacheServicios || []).find(s => s.id == cm.servicio_id) || {};
  const clientes = cacheClientes || [];
  
  let clienteId = '';
  let pin = cm.pin || '';
  let monto = parseFloat(servicio.precio_base || 0).toFixed(2);
  let fechaFacturacion = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  
  if (cuentaClienteId) {
    const cuentaCliente = cacheCuentas.find(c => c.id == cuentaClienteId);
    if (cuentaCliente) {
      clienteId = cuentaCliente.cliente_id;
      pin = cuentaCliente.pin || cm.pin || '';
      fechaFacturacion = new Date(cuentaCliente.fecha_vencimiento).toISOString().split('T')[0];
    }
  }

  const clientesOptions = clientes.map(c => `<option value="${c.id}" ${c.id == clienteId ? 'selected' : ''}>${c.nombre} (${c.telefono || 'Sin tlf'})</option>`).join('');

  abrirModal(cuentaClienteId ? 'Editar Subscripcion' : 'Nueva Subscripcion', `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Cliente:</label>
        <select id="sub-cliente" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
          <option value="">-</option>
          ${clientesOptions}
        </select>
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Perfil:</label>
        <input type="text" id="sub-perfil" value="Perfil ${slotNumber}" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Pin:</label>
        <input type="text" id="sub-pin" value="${pin}" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Monto:</label>
        <input type="number" step="0.01" id="sub-monto" value="${monto}" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Facturacion:</label>
        <input type="date" id="sub-facturacion" value="${fechaFacturacion}" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
      </div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
      <button class="btn-primario" style="background-color:#10b981; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="guardarSuscripcion(${cuentaMaestraId}, ${slotNumber}, ${cuentaClienteId || 'null'})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        Guardar
      </button>
      <button class="btn-secundario" style="background-color:#ef4444; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="cerrarModal()">
        × Cancelar
      </button>
    </div>
  `);
}

async function guardarSuscripcion(cuentaMaestraId, slotNumber, cuentaClienteId) {
  try {
    const clienteId = document.getElementById('sub-cliente').value;
    if (!clienteId) throw new Error('Debe seleccionar un cliente.');

    const cm = cacheCuentasMaestras.find(c => c.id === cuentaMaestraId);
    
    const data = {
      cliente_id: clienteId,
      servicio_id: cm.servicio_id,
      cuenta_maestra_id: cuentaMaestraId,
      tipo_perfil: document.getElementById('sub-perfil').value,
      numero_perfil: `${slotNumber}`,
      pin: document.getElementById('sub-pin').value,
      fecha_vencimiento: document.getElementById('sub-facturacion').value,
      monto: document.getElementById('sub-monto').value,
      fecha_compra: new Date().toISOString().split('T')[0]
    };

    if (cuentaClienteId) {
      await api.cuentas.actualizar(cuentaClienteId, data);
      mostrarToast('success', 'Suscripción actualizada.');
    } else {
      await api.cuentas.crear(data);
      mostrarToast('success', 'Suscripción registrada.');
    }

    cerrarModal();
    renderCuentas();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

function enviarWhatsappSuscripcion(cuentaId) {
  // Placeholder para la integración con Whatsapp
  alert('Botón de Whatsapp: Aquí se enviaría el recordatorio al cliente asociado a la suscripción ID ' + cuentaId);
}

// ==================== FORMULARIO EDITAR CUENTA ====================

async function formEditarCuentaModal(id) {
  let cuenta = (cacheCuentas || []).find(c => c.id == id);
  if (!cuenta) {
    try {
      const todas = await api.cuentas.listar();
      cacheCuentas = todas;
      cuenta = todas.find(c => c.id == id);
    } catch(e) {}
  }
  
  if (!cuenta) {
    return mostrarToast('error', 'No se encontró la información de esta suscripción.');
  }

  const clientes = cacheClientes || [];
  
  let diasRestantes = '';
  if (cuenta.fecha_vencimiento) {
    const diff = new Date(cuenta.fecha_vencimiento) - new Date();
    diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  abrirModal('Editar Subscripcion', `
    <div style="display:flex; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
      <div style="padding:8px 16px; border-bottom:2px solid var(--accent-primary); color:var(--accent-primary); font-weight:600; font-size:14px;">Datos</div>
      <div style="padding:8px 16px; color:var(--text-secondary); font-size:14px; cursor:pointer;" onclick="alert('Funcionalidad de extender en desarrollo')">Extender Subscripcion</div>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px;">
      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Cliente:</label>
        <select id="edit-cliente" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
          ${clientes.map(c => `<option value="${c.id}" ${cuenta.cliente_id == c.id ? 'selected' : ''}>${c.nombre} (${c.telefono})</option>`).join('')}
        </select>
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Perfil:</label>
        <input type="text" id="edit-tipo" value="${cuenta.tipo_perfil || ''}" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Pin:</label>
        <input type="text" id="edit-pin" value="${cuenta.pin || cuenta.pin_efectivo || ''}" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Facturacion:</label>
        <input type="date" id="edit-fecha-vence" value="${cuenta.fecha_vencimiento ? new Date(cuenta.fecha_vencimiento).toISOString().split('T')[0] : ''}" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
      </div>

      <div>
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px; display:block;">Dias Restantes:</label>
        <input type="text" value="${diasRestantes}" disabled style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); background:rgba(255,255,255,0.05); color:var(--text-muted);">
      </div>
      
      <input type="hidden" id="edit-servicio" value="${cuenta.servicio_id}">
      <input type="hidden" id="edit-cm" value="${cuenta.cuenta_maestra_id || ''}">
      <input type="hidden" id="edit-fecha-compra" value="${cuenta.fecha_compra ? new Date(cuenta.fecha_compra).toISOString().split('T')[0] : ''}">
      <input type="hidden" id="edit-monto" value="${cuenta.ultimo_monto || ''}">
      <input type="hidden" id="edit-estado" value="${cuenta.estado || 'activa'}">
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
      <div style="display:flex; gap:8px;">
        <button class="btn-primario" style="background-color:#10b981; border:none; padding:8px 16px; border-radius:4px; font-weight:600; display:flex; align-items:center; gap:6px; color:white; cursor:pointer;" onclick="guardarEdicionCuenta(${id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Actualizar
        </button>
        <button style="background-color:#0ea5e9; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; display:flex; align-items:center;" onclick="copiarTexto('${cuenta.tipo_perfil} - PIN: ${cuenta.pin_efectivo || cuenta.pin}', this)" title="Copiar Datos">
          📋
        </button>
        <button style="background-color:#22c55e; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; display:flex; align-items:center;" onclick="alert('Abrir WhatsApp')" title="Enviar por WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </button>
      </div>
      
      <button class="btn-secundario" style="background-color:#ef4444; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;" onclick="cerrarModal()">
        × Cancelar
      </button>
    </div>
  `);
}

function actualizarCuentasMaestrasEdicion() {
  const servId = document.getElementById('edit-servicio').value;
  const cmSelect = document.getElementById('edit-cm');
  if (!cmSelect) return;
  const cmsDeServicio = (cacheCuentasMaestras || []).filter(cm => cm.servicio_id == servId);
  cmSelect.innerHTML = '<option value="">-- Sin vincular / Personalizada --</option>' + cmsDeServicio.map(cm => `
    <option value="${cm.id}">${cm.correo} (${cm.perfiles_ocupados}/${cm.perfiles_totales} perfiles)</option>
  `).join('');
}

async function guardarEdicionCuenta(id) {
  try {
    let comprobanteUrl = undefined;
    const inputArchivo = document.getElementById('edit-comprobante');
    const archivo = inputArchivo ? inputArchivo.files[0] : null;

    if (archivo) {
      mostrarToast('info', 'Subiendo nuevo comprobante...');
      const subida = await api.upload.comprobante(archivo);
      comprobanteUrl = subida.url;
    }

    const data = {
      cliente_id: document.getElementById('edit-cliente').value,
      servicio_id: document.getElementById('edit-servicio').value,
      cuenta_maestra_id: document.getElementById('edit-cm').value || null,
      tipo_perfil: document.getElementById('edit-tipo').value.trim(),
      pin: document.getElementById('edit-pin').value.trim() || null,
      fecha_compra: document.getElementById('edit-fecha-compra').value,
      fecha_vencimiento: document.getElementById('edit-fecha-vence').value,
      estado: document.getElementById('edit-estado').value,
      monto: document.getElementById('edit-monto').value ? parseFloat(document.getElementById('edit-monto').value) : undefined
    };

    if (comprobanteUrl) {
      data.comprobante_imagen_url = comprobanteUrl;
    }

    await api.cuentas.actualizar(id, data);
    cerrarModal();
    mostrarToast('success', 'Cuenta actualizada correctamente.');
    renderCuentas();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

async function eliminarCuenta(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Eliminar Cuenta', '¿Seguro que deseas eliminar permanentemente esta cuenta?', 'Sí, eliminar', `eliminarCuenta(${id}, true)`);
  }
  try {
    await api.cuentas.eliminar(id);
    mostrarToast('success', 'Cuenta eliminada.');
    renderCuentas();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

function mostrarPreviewArchivo(input, contenedorId) {
  const cont = document.getElementById(contenedorId);
  if (!cont) return;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      cont.innerHTML = `
        <div class="upload-preview-box">
          <img src="${e.target.result}" class="upload-preview-img" alt="Preview">
          <div style="flex:1;min-width:0;">
            <strong style="display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${file.name}</strong>
            <span style="font-size:11px;color:var(--text-muted);">${(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    cont.innerHTML = '';
  }
}

function formRenovarModal(id) {
  abrirModal('Renovar Suscripción', `
    <label>Nueva fecha de vencimiento</label>
    <input type="date" id="r-fecha">

    <label>Monto pagado ($)</label>
    <input type="number" step="0.01" id="r-monto" placeholder="Ej: 15.00">

    <label>Comprobante de pago (Opcional)</label>
    <div class="upload-dropzone" onclick="document.getElementById('r-comprobante').click()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" style="margin-bottom:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
      <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Seleccionar nuevo comprobante</div>
      <input type="file" id="r-comprobante" accept="image/*" style="display:none;" onchange="mostrarPreviewArchivo(this, 'r-preview')">
    </div>
    <div id="r-preview"></div>

    <button class="btn-primario btn-lg" style="margin-top:10px;" onclick="renovarCuenta(${id})">Confirmar renovación</button>
  `);
}

async function renovarCuenta(id) {
  try {
    let comprobanteUrl = null;
    const inputArchivo = document.getElementById('r-comprobante');
    const archivo = inputArchivo ? inputArchivo.files[0] : null;

    if (archivo) {
      mostrarToast('info', 'Subiendo comprobante...');
      const subida = await api.upload.comprobante(archivo);
      comprobanteUrl = subida.url;
    }

    const nuevaFecha = document.getElementById('r-fecha').value;
    const monto = document.getElementById('r-monto').value;

    if (!nuevaFecha || !monto) {
      throw new Error('Indica la nueva fecha y el monto.');
    }

    await api.cuentas.renovar(id, {
      nueva_fecha_vencimiento: nuevaFecha,
      monto,
      comprobante_imagen_url: comprobanteUrl
    });

    cerrarModal();
    mostrarToast('success', '¡Cuenta renovada exitosamente!');
    renderCuentas();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

async function cancelarCuenta(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Cancelar Cuenta', '¿Seguro que deseas cancelar esta cuenta? Se notificará al cliente automáticamente vía WhatsApp.', 'Sí, cancelar', `cancelarCuenta(${id}, true)`);
  }
  try {
    await api.cuentas.cancelar(id);
    mostrarToast('success', 'Cuenta cancelada y cliente notificado.');
    renderCuentas();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

// ==================== VISTA: CLIENTES ====================

async function renderClientes() {
  const clientes = await api.clientes.listar();
  cacheClientes = clientes;

  const contenedor = document.getElementById('vista-contenido');
  contenedor.innerHTML = `
    <div class="vista-header">
      <div class="vista-titulo-box">
        <h1>Directorio de Clientes</h1>
        <p>Gestiona los datos de contacto y números vinculados a WhatsApp</p>
      </div>
      <button class="btn-primario" onclick="formClienteModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Nuevo cliente</span>
      </button>
    </div>

    <div class="table-wrapper">
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>WhatsApp</th>
              <th>Notas</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${clientes.map(c => `
              <tr>
                <td>
                  <div class="cell-user">
                    <div class="cell-avatar">${c.nombre.charAt(0).toUpperCase()}</div>
                    <div class="cell-info">
                      <strong>${c.nombre}</strong>
                      <span>ID #${c.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <a href="https://wa.me/${c.telefono.replace(/[^0-9]/g, '')}" target="_blank" style="color:var(--color-positive);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span>${c.telefono}</span>
                  </a>
                </td>
                <td><span style="color:var(--text-secondary);font-size:13px;">${c.notas || '-'}</span></td>
                <td>${new Date(c.fecha_registro).toLocaleDateString()}</td>
                <td class="acciones">
                  <button class="btn-tabla" onclick="formClienteModal(${c.id})">Editar</button>
                  <button class="btn-tabla btn-peligro" onclick="eliminarCliente(${c.id})">Eliminar</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--text-muted);">No hay clientes registrados</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function formClienteModal(id) {
  let cliente = { nombre: '', telefono: '', notas: '' };
  if (id) {
    const lista = await api.clientes.listar();
    cliente = lista.find(c => c.id === id) || cliente;
  }

  abrirModal(id ? 'Editar Cliente' : 'Nuevo Cliente', `
    <label>Nombre completo</label>
    <input id="c-nombre" value="${cliente.nombre}" placeholder="Ej: Juan Pérez">

    <label>Número de WhatsApp (con código de país)</label>
    <input id="c-telefono" value="${cliente.telefono}" placeholder="Ej: 51987654321">

    <label>Notas adicionales</label>
    <textarea id="c-notas" placeholder="Preferencias, medio de pago recurrente, etc.">${cliente.notas || ''}</textarea>

    <button class="btn-primario btn-lg" style="margin-top:10px;" onclick="guardarCliente(${id || 'null'})">
      ${id ? 'Guardar Cambios' : 'Registrar Cliente'}
    </button>
  `);
}

async function guardarCliente(id) {
  const data = {
    nombre: document.getElementById('c-nombre').value.trim(),
    telefono: document.getElementById('c-telefono').value.trim(),
    notas: document.getElementById('c-notas').value.trim()
  };

  if (!data.nombre || !data.telefono) {
    return mostrarToast('error', 'El nombre y teléfono son obligatorios.');
  }

  try {
    if (id) {
      await api.clientes.actualizar(id, data);
      mostrarToast('success', 'Cliente actualizado.');
    } else {
      await api.clientes.crear(data);
      mostrarToast('success', 'Cliente registrado.');
    }
    cerrarModal();
    renderClientes();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

async function eliminarCliente(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Eliminar Cliente', '¿Eliminar este cliente? Se eliminarán también todas sus cuentas asociadas.', 'Sí, eliminar', `eliminarCliente(${id}, true)`);
  }
  try {
    await api.clientes.eliminar(id);
    mostrarToast('success', 'Cliente eliminado.');
    renderClientes();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

// ==================== VISTA: INCIDENCIAS ====================

async function renderIncidencias() {
  const [incidencias, cuentas] = await Promise.all([api.incidencias.listar(), api.cuentas.listar()]);
  cacheCuentas = cuentas;

  const contenedor = document.getElementById('vista-contenido');
  contenedor.innerHTML = `
    <div class="vista-header">
      <div class="vista-titulo-box">
        <h1>Gestión de Incidencias</h1>
        <p>Reportes de caídas de servicio, reseteo de claves y soporte</p>
      </div>
      <button class="btn-primario" onclick="formIncidenciaModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Nueva incidencia</span>
      </button>
    </div>

    <div class="table-wrapper">
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${incidencias.map(i => `
              <tr>
                <td><strong>${i.cliente_nombre}</strong></td>
                <td><span class="badge badge-activa">${i.servicio_nombre}</span></td>
                <td><span style="font-size:13px;color:var(--text-secondary);">${i.descripcion}</span></td>
                <td>${new Date(i.fecha_creacion || Date.now()).toLocaleDateString()}</td>
                <td><span class="badge badge-${i.estado}">${i.estado.replace('_', ' ')}</span></td>
                <td class="acciones">
                  ${i.estado !== 'resuelta' ? `
                    <button class="btn-tabla" onclick="cambiarEstadoIncidencia(${i.id}, 'en_proceso')">En proceso</button>
                    <button class="btn-tabla" style="color:var(--color-positive);" onclick="cambiarEstadoIncidencia(${i.id}, 'resuelta')">Resolver ✓</button>
                  ` : ''}
                  <button class="btn-tabla btn-peligro" onclick="eliminarIncidencia(${i.id})">🗑️</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted);">No hay incidencias</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function cambiarEstadoIncidencia(id, estado) {
  try {
    await api.incidencias.actualizar(id, { estado });
    renderIncidencias();
  } catch (err) {
    alert(err.message);
  }
}

// ==================== MENSAJES ====================

async function renderMensajes() {
  const mensajes = await api.mensajes.listar();
  const contenedor = document.getElementById('vista-contenido');

  contenedor.innerHTML = `
    <div class="vista-header"><h1>Historial de mensajes de WhatsApp</h1></div>
    <table>
      <thead><tr><th>Cliente</th><th>Evento</th><th>Fecha envío</th><th>Estado</th><th>Respuesta</th><th></th></tr></thead>
      <tbody>
        ${mensajes.map(m => `
          <tr>
            <td>${m.cliente_nombre}</td>
            <td>${m.tipo_evento.replace('_', ' ')}</td>
            <td>${new Date(m.fecha_envio).toLocaleString()}</td>
            <td>${m.estado_envio}</td>
            <td>${m.respuesta_cliente || '-'}</td>
            <td class="acciones">
              ${m.estado_envio === 'fallido' ? `<button onclick="reenviarMensaje(${m.id})">Reenviar</button>` : ''}
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

async function reenviarMensaje(id) {
  try {
    await api.mensajes.reenviar(id);
    renderMensajes();
  } catch (err) {
    alert(err.message);
  }
}

// ---- Notificaciones internas (cuando el cliente responde) ----

async function revisarNotificaciones() {
  try {
    const pendientes = await api.mensajes.notificacionesPendientes();
    const badge = document.getElementById('notificaciones-badge');
    if (pendientes.length > 0) {
      document.getElementById('notif-count').textContent = pendientes.length;
      badge.classList.remove('oculto');
      window._notificacionesPendientes = pendientes;
    } else {
      badge.classList.add('oculto');
    }
  } catch (err) {
    // silencioso: si el token expiro, ya se maneja en apiFetch
  }
}

function mostrarNotificaciones() {
  const pendientes = window._notificacionesPendientes || [];
  abrirModal('Respuestas de clientes pendientes de atender', `
    ${pendientes.map(n => `
      <div style="border-bottom:1px solid #eee;padding:10px 0;">
        <strong>${n.cliente_nombre}</strong> (${n.telefono})<br>
        <span style="font-size:13px;color:#666;">Mensaje enviado: ${n.contenido_enviado}</span><br>
        <span style="font-size:13px;">Respondió: <strong>${n.respuesta_cliente}</strong></span><br>
        <button onclick="marcarNotifLeida(${n.id})" style="margin-top:6px;">Marcar como atendida</button>
      </div>`).join('') || '<p>No hay notificaciones pendientes.</p>'}
  `);
}

async function marcarNotifLeida(id) {
  try {
    await api.mensajes.marcarLeida(id);
    cerrarModal();
    revisarNotificaciones();
  } catch (err) {
    alert(err.message);
  }
}

// ==================== PLANTILLAS ====================

async function renderPlantillas() {
  const plantillas = await api.plantillas.listar();
  const contenedor = document.getElementById('vista-contenido');

  contenedor.innerHTML = `
    <div class="vista-header"><h1>Plantillas de mensajes de WhatsApp</h1></div>
    ${plantillas.map(p => `
      <div style="background:#fff;padding:16px;border-radius:8px;margin-bottom:12px;">
        <strong>${p.tipo_evento.replace('_', ' ')}</strong>
        <textarea id="plant-${p.id}" style="width:100%;min-height:70px;margin-top:8px;padding:8px;">${p.contenido}</textarea>
        <button onclick="guardarPlantilla(${p.id})" style="margin-top:8px;">Guardar cambios</button>
      </div>`).join('')}
    <p style="font-size:12px;color:#888;">Variables disponibles: {{nombre}}, {{servicio}}, {{fecha_vencimiento}}, {{periodo}}, {{monto_actual}}, {{monto_anterior}}, {{activas}}, {{vencidas}}, {{incidencias}}</p>`;
}

async function guardarPlantilla(id) {
  try {
    await api.plantillas.actualizar(id, { contenido: document.getElementById(`plant-${id}`).value });
    alert('Plantilla actualizada.');
  } catch (err) {
    alert(err.message);
  }
}

// ==================== USUARIOS ====================

async function renderUsuarios(estado = 'activo') {
  let usuarios = await api.usuarios.listar();
  const esActivo = estado === 'activo';
  usuarios = usuarios.filter(u => u.activo === esActivo);
  
  const contenedor = document.getElementById('vista-contenido');

  contenedor.innerHTML = `
    <div class="vista-header" style="margin-bottom: 24px; padding: 20px; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between;">
      <h1 style="font-size: 18px; margin: 0; color: var(--text-primary); font-weight: 600;">Lista de usuarios ${estado === 'activo' ? 'Activos' : 'Inactivos'}</h1>
      <button class="btn-primario" style="width:auto; margin:0; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px;" onclick="formUsuarioModal()">AGREGAR <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>
    </div>
    
    <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 0; box-shadow: var(--shadow-sm); overflow-x: auto;">
      <table class="users-table-modern" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead style="background: transparent; color: var(--text-muted); font-size: 13px;">
          <tr>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">#</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Nombres</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Email</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">rol</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Action</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No hay usuarios ${estado}s</td></tr>` : ''}
          ${usuarios.map((u, i) => {
            
            // Check permissions
            const myRole = usuarioActual.rol;
            const isTargetSuper = u.rol === 'super_admin';
            let canEdit = true;
            if (myRole === 'administrador' && isTargetSuper) {
              canEdit = false;
            }

            return `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 16px 24px; color: var(--text-muted); font-size: 13px;">${i + 1}</td>
              <td style="padding: 16px 24px; color: var(--text-primary); font-size: 14px; font-weight: 500;">
                <div style="display: flex; align-items: center;">
                  <div class="avatar-circle" style="background: ${u.rol === 'super_admin' ? 'var(--accent-primary)' : 'var(--text-muted)'};">${u.nombre.charAt(0).toUpperCase()}</div>
                  ${u.nombre}
                </div>
              </td>
              <td style="padding: 16px 24px; color: var(--text-secondary); font-size: 14px;">${u.email}</td>
              <td style="padding: 16px 24px; color: var(--text-secondary); font-size: 14px;">${u.rol.replace('_', ' ').replace(/\n  const servicio = cacheServicios.find(s => s.id == cm.servicio_id) || {};n  const servicios = cacheServicios || [];n  const clientes = cacheClientes || [];b\n  const servicio = cacheServicios.find(s => s.id == cm.servicio_id) || {};n  const servicios = cacheServicios || [];n  const clientes = cacheClientes || [];w/g, l => l.toUpperCase())}</td>
              <td style="padding: 16px 24px; white-space: nowrap;">
                <button class="user-action-btn edit ${canEdit ? '' : 'disabled'}" ${canEdit ? `onclick="abrirConfirmacionEdicion(${u.id}, '${estado}')"` : 'disabled'} title="${canEdit ? 'Editar usuario' : 'Sin permisos'}">Editar</button>
                <button class="user-action-btn delete ${canEdit ? '' : 'disabled'}" ${canEdit ? `onclick="toggleActivoUsuario(${u.id}, ${!u.activo}, '${estado}')"` : 'disabled'} title="${canEdit ? (u.activo ? 'Desactivar' : 'Activar') : 'Sin permisos'}">${u.activo ? 'Eliminar' : 'Restaurar'}</button>
              </td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function abrirConfirmacionEdicion(id, estadoBase) {
  confirmarAccion(
    'Confirmar Edición',
    '¿Deseas editar este usuario?',
    'Sí, editar',
    `formUsuarioModal(${id}, '${estadoBase}')`,
    '#2D8CFF'
  );
}

function confirmarAccion(titulo, mensaje, textoBotonConfirmar, accionJavascript, colorBoton = '#EF4444') {
  abrirModal('', `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px 10px;">
      <div class="modal-alert-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 style="margin:0 0 8px 0; font-size:20px; font-weight:600; color:var(--text-primary); text-align:center;">${titulo}</h2>
      <p style="margin:0 0 24px 0; font-size:14px; color:var(--text-secondary); text-align:center;">${mensaje}</p>
      
      <div style="display:flex; gap:12px; width:100%;">
        <button class="btn-primario" style="flex:1; background:${colorBoton}; border-color:${colorBoton};" onclick="cerrarModal(); ${accionJavascript}">${textoBotonConfirmar}</button>
        <button class="btn-secundario" style="flex:1; background:transparent;" onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);
}

async function formUsuarioModal(id = null, estadoBase = 'activo') {
  let u = null;
  const roles = await api.roles.listar(); // Nuevo: listar los roles dinámicos de la BDD

  if (id) {
    const usuarios = await api.usuarios.listar();
    u = usuarios.find(x => x.id === id);
    if (!u) return;
  }

  const isSuperAdminDisabled = u && u.rol === 'super_admin' && usuarioActual.rol !== 'super_admin' ? 'disabled' : '';

  abrirModal(id ? 'Editar Usuario' : 'Nuevo Usuario', `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="grid-column: 1 / -1;">
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Nombres</label>
        <input id="u-nombre" value="${u ? u.nombre : ''}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);">
      </div>
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Email</label>
        <input type="email" id="u-email" value="${u ? u.email : ''}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);">
      </div>
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Contraseña ${id ? '(dejar blanco para no cambiar)' : ''}</label>
        <input type="password" id="u-password" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);">
      </div>
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Teléfono</label>
        <input id="u-telefono" value="${u ? (u.telefono || '') : ''}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);">
      </div>
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Rol</label>
        <select id="u-rol" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);" ${isSuperAdminDisabled}>
          ${roles.map(r => `
            <option value="${r.id}" ${u && u.rol_id === r.id ? 'selected' : ''} ${r.nombre === 'super_admin' && usuarioActual.rol !== 'super_admin' ? 'disabled' : ''}>
              ${r.nombre.replace('_', ' ').replace(/\n  const servicio = cacheServicios.find(s => s.id == cm.servicio_id) || {};n  const servicios = cacheServicios || [];n  const clientes = cacheClientes || [];b\n  const servicio = cacheServicios.find(s => s.id == cm.servicio_id) || {};n  const servicios = cacheServicios || [];n  const clientes = cacheClientes || [];w/g, l => l.toUpperCase())}
            </option>
          `).join('')}
        </select>
      </div>
      ${id ? `
      <div style="grid-column: 1 / -1;">
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Estado</label>
        <select id="u-activo" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);">
          <option value="1" ${u.activo ? 'selected' : ''}>Activo</option>
          <option value="0" ${!u.activo ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>
      ` : ''}
    </div>
    <div style="margin-top: 24px; text-align: right;">
      <button class="btn-primario" onclick="guardarUsuario(${id ? id : 'null'}, '${estadoBase}')">Guardar Usuario</button>
    </div>
  `);
}

async function guardarUsuario(id = null, estadoBase = 'activo') {
  try {
    const data = {
      nombre: document.getElementById('u-nombre').value,
      email: document.getElementById('u-email').value,
      telefono: document.getElementById('u-telefono').value,
    };
    
    const pass = document.getElementById('u-password').value;
    if (pass) data.password = pass;
    
    const rolEl = document.getElementById('u-rol');
    if (rolEl) data.rol = rolEl.value;

    if (id) {
      const activoEl = document.getElementById('u-activo');
      if (activoEl) data.activo = activoEl.value === '1';
      await api.usuarios.actualizar(id, data);
    } else {
      data.activo = true; // Por defecto
      if(!data.password || !data.nombre || !data.email) {
        alert("Completa todos los campos obligatorios para un nuevo usuario");
        return;
      }
      await api.usuarios.crear(data);
    }
    
    cerrarModal();
    renderUsuarios(estadoBase);
  } catch (err) {
    alert(err.message);
  }
}

async function toggleActivoUsuario(id, activo, estadoBase = 'activo') {
  try {
    await api.usuarios.actualizar(id, { activo });
    renderUsuarios(estadoBase);
  } catch (err) {
    alert(err.message);
  }
}

// ==================== ROLES Y PERMISOS ====================

async function renderRoles() {
  const roles = await api.roles.listar();
  const permisos = await api.roles.listarPermisos();
  const contenedor = document.getElementById('vista-contenido');

  contenedor.innerHTML = `
    <div class="vista-header" style="margin-bottom: 24px; padding: 20px; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between;">
      <h1 style="font-size: 18px; margin: 0; color: var(--text-primary); font-weight: 600;">Roles y Permisos</h1>
      <button class="btn-primario" style="width:auto; margin:0; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px;" onclick="formRolModal()">AGREGAR ROL <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>
    </div>
    
    <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 0; box-shadow: var(--shadow-sm); overflow-x: auto;">
      <table class="users-table-modern" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead style="background: transparent; color: var(--text-muted); font-size: 13px;">
          <tr>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Nombre del Rol</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Permisos</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Action</th>
          </tr>
        </thead>
        <tbody>
          ${roles.map(r => {
            let canEdit = !r.es_fijo || usuarioActual.rol === 'super_admin';
            return `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 16px 24px; color: var(--text-primary); font-size: 14px; font-weight: 500;">
                ${r.nombre} ${r.es_fijo ? '<span style="font-size:10px; background:var(--color-warning); color:white; padding:2px 6px; border-radius:4px; margin-left:8px;">Fijo</span>' : ''}
              </td>
              <td style="padding: 16px 24px; color: var(--text-secondary); font-size: 12px; line-height: 1.5; max-width: 300px; white-space: normal;">
                ${r.permisos.length > 0 ? r.permisos.map(p => `<span style="background:rgba(124, 92, 255, 0.1); color:var(--accent-primary); padding:2px 6px; border-radius:4px; margin-right:4px; margin-bottom:4px; display:inline-block;">${p}</span>`).join('') : 'Ninguno'}
              </td>
              <td style="padding: 16px 24px; white-space: nowrap;">
                <button class="user-action-btn edit ${canEdit ? '' : 'disabled'}" ${canEdit ? `onclick="formRolModal(${r.id})"` : 'disabled'} title="${canEdit ? 'Editar rol' : 'No modificable'}">Editar</button>
                ${!r.es_fijo ? `<button class="user-action-btn delete" onclick="eliminarRol(${r.id})">Eliminar</button>` : ''}
              </td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

async function formRolModal(id = null) {
  const permisosDisponibles = await api.roles.listarPermisos();
  let r = null;
  
  if (id) {
    const roles = await api.roles.listar();
    r = roles.find(x => x.id === id);
    if (!r) return;
  }

  abrirModal(id ? 'Editar Rol' : 'Nuevo Rol', `
    <div style="display:grid; gap: 16px;">
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Nombre del Rol</label>
        <input id="r-nombre" value="${r ? r.nombre : ''}" ${r && r.es_fijo ? 'disabled' : ''} style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);">
      </div>
      
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:8px; display:block;">Permisos de Acceso</label>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px; max-height:300px; overflow-y:auto; padding-right:8px;">
          ${permisosDisponibles.map(p => {
            const checked = r && r.permisos && r.permisos.includes(p.codigo) ? 'checked' : '';
            return `
            <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer; background:var(--bg-main); padding:10px; border-radius:6px; border:1px solid var(--border-color);">
              <input type="checkbox" name="rol-permiso" value="${p.codigo}" ${checked} style="margin-top:2px;">
              <div>
                <div style="font-size:13px; font-weight:500; color:var(--text-primary);">${p.codigo}</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${p.descripcion}</div>
              </div>
            </label>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    <div style="margin-top: 24px; text-align: right;">
      <button class="btn-primario" onclick="guardarRol(${id ? id : 'null'})">Guardar Rol</button>
    </div>
  `);
}

async function guardarRol(id = null) {
  try {
    const nombre = document.getElementById('r-nombre').value;
    const checkboxes = document.querySelectorAll('input[name="rol-permiso"]:checked');
    const permisos = Array.from(checkboxes).map(cb => cb.value);
    
    if (id) {
      await api.roles.actualizar(id, { nombre, permisos });
    } else {
      if(!nombre) return alert("Ingresa un nombre para el rol");
      await api.roles.crear({ nombre, permisos });
    }
    
    cerrarModal();
    renderRoles();
  } catch (err) {
    alert(err.message);
  }
}

async function eliminarRol(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Eliminar Rol', '¿Estás seguro de eliminar este rol? Fallará si hay usuarios asignados a él.', 'Sí, eliminar', `eliminarRol(${id}, true)`);
  }
  try {
    await api.roles.eliminar(id);
    renderRoles();
  } catch (err) {
    alert(err.message);
  }
}
// ==================== METODOS DE PAGO ====================

async function renderMetodosPago() {
  const metodos = await api.metodosPago.listar();
  const contenedor = document.getElementById('vista-contenido');

  contenedor.innerHTML = `
    <div class="vista-header" style="margin-bottom: 24px; padding: 20px; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between;">
      <h1 style="font-size: 18px; margin: 0; color: var(--text-primary); font-weight: 600;">Lista de métodos de pagos</h1>
      <button class="btn-primario" style="width:auto; margin:0; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px;" onclick="formMetodoPagoModal()">AGREGAR</button>
    </div>
    
    <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 0; box-shadow: var(--shadow-sm); overflow-x: auto;">
      <table class="users-table-modern" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead style="background: transparent; color: var(--text-muted); font-size: 13px;">
          <tr>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color); width: 80px;">#</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Metodo de pago</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Estado</th>
            <th style="padding: 16px 24px; font-weight: 600; border-bottom: 1px solid var(--border-color);">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${metodos.map((m, index) => `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 16px 24px; color: var(--text-secondary); font-size: 14px;">${index + 1}</td>
              <td style="padding: 16px 24px; color: var(--text-primary); font-size: 14px; font-weight: 500;">${m.nombre}</td>
              <td style="padding: 16px 24px; font-size: 14px;">
                <span style="background:${m.activo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color:${m.activo ? '#22c55e' : '#ef4444'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  ${m.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style="padding: 16px 24px; white-space: nowrap;">
                <button class="user-action-btn edit" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; margin-right: 8px;" onclick="formMetodoPagoModal(${m.id})">Editar</button>
                <button class="user-action-btn delete" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;" onclick="eliminarMetodoPago(${m.id})">Eliminar</button>
              </td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
    </div>`;
}

async function formMetodoPagoModal(id = null) {
  let m = null;
  if (id) {
    const metodos = await api.metodosPago.listar();
    m = metodos.find(x => x.id === id);
    if (!m) return;
  }

  abrirModal(id ? 'Editar Método de Pago' : 'Nuevo Método de Pago', `
    <div style="display:grid; gap: 16px;">
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Nombre del método</label>
        <input id="m-nombre" value="${m ? m.nombre : ''}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);" placeholder="Ej. PayPal, Binance, Efectivo">
      </div>
      ${id ? `
      <div>
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:4px; display:block;">Estado</label>
        <select id="m-activo" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-primary);">
          <option value="1" ${m.activo ? 'selected' : ''}>Activo</option>
          <option value="0" ${!m.activo ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>` : ''}
    </div>
    <div style="margin-top: 24px; text-align: right;">
      <button class="btn-primario" onclick="guardarMetodoPago(${id ? id : 'null'})">Guardar</button>
    </div>
  `);
}

async function guardarMetodoPago(id = null) {
  try {
    const nombre = document.getElementById('m-nombre').value;
    const data = { nombre };
    
    if (id) {
      const activo = document.getElementById('m-activo').value === '1';
      data.activo = activo;
      await api.metodosPago.actualizar(id, data);
    } else {
      if (!nombre) return alert('Ingresa un nombre para el método de pago');
      await api.metodosPago.crear(data);
    }
    
    cerrarModal();
    renderMetodosPago();
  } catch (err) {
    alert(err.message);
  }
}

async function eliminarMetodoPago(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Eliminar Método de Pago', '¿Estás seguro de eliminar este método de pago?', 'Sí, eliminar', `eliminarMetodoPago(${id}, true)`);
  }
  try {
    await api.metodosPago.eliminar(id);
    renderMetodosPago();
  } catch (err) {
    alert(err.message);
  }
}

async function eliminarIncidencia(id, confirmado = false) {
  if (!confirmado) {
    return confirmarAccion('Eliminar Incidencia', '¿Estás seguro de eliminar esta incidencia?', 'Sí, eliminar', `eliminarIncidencia(${id}, true)`);
  }
  try {
    await api.incidencias.eliminar(id);
    mostrarToast('success', 'Incidencia eliminada.');
    renderIncidencias();
  } catch (err) {
    mostrarToast('error', err.message);
  }
}

// ==================== ESTADÍSTICAS POR PLATAFORMA ====================

async function renderEstadisticasPlataforma(id) {
  try {
    const data = await api.servicios.estadisticas(id);
    const plat = cacheServicios.find(s => s.id === id) || { nombre: 'Desconocido' };
    const contenedor = document.getElementById('vista-contenido');

    const comprasTotales = parseFloat(data.totales.compras || 0);
    const ventasTotales = parseFloat(data.totales.ventas || 0);
    const balance = ventasTotales - comprasTotales;

    contenedor.innerHTML = `
      <div class="vista-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase; font-weight:600; letter-spacing:1px;">Reporte por Categoria</span>
          <h1 style="font-size: 22px; margin: 4px 0 0 0; color: var(--text-primary); font-weight: 700;">Estadísticas: ${plat.nombre}</h1>
        </div>
        <div style="display:flex; gap:12px; align-items:center;">
          
          <button class="btn-secundario" onclick="renderPlataformas()">← Volver al catálogo</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
        <div style="background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="margin:0 0 10px 0; font-size:14px; color:var(--text-secondary); font-weight:500;">Compra (Gastos)</h3>
          <div style="font-size:24px; font-weight:700; color:var(--text-primary);">${formatearMoneda(comprasTotales)}</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">Total invertido en cuentas maestras</div>
        </div>
        <div style="background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="margin:0 0 10px 0; font-size:14px; color:var(--text-secondary); font-weight:500;">Venta (Ingresos)</h3>
          <div style="font-size:24px; font-weight:700; color:var(--color-positive);">${formatearMoneda(ventasTotales)}</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">Total recibido de clientes</div>
        </div>
        <div style="background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="margin:0 0 10px 0; font-size:14px; color:var(--text-secondary); font-weight:500;">Balance</h3>
          <div style="font-size:24px; font-weight:700; color:${balance >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'};">
            ${balance >= 0 ? '+' : ''}${formatearMoneda(balance)}
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">Ganancia neta (Ventas - Compras)</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 20px;">
        <div style="background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3 style="margin:0; font-size:15px; color:var(--text-primary); font-weight:600;">Compra y venta por mes</h3>
            <span style="font-size:12px; background:rgba(45, 140, 255, 0.1); color:var(--accent-primary); padding:4px 12px; border-radius:4px; font-weight:600;">ESTADÍSTICA DEL AÑO</span>
          </div>
          <div style="position: relative; height: 350px;">
            <canvas id="chartReportePlataforma"></canvas>
          </div>
        </div>
        
        <div style="background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <div style="width: 60px; height: 60px; background: ${plat.icono_color || 'var(--accent-primary)'}; background-image: ${plat.logo_url ? `url('${plat.logo_url}')` : 'none'}; background-size: cover; background-position: center; border-radius: 12px; display:flex; align-items:center; justify-content:center; color:${plat.logo_url ? 'transparent' : 'white'}; font-size:24px; font-weight:bold; margin-bottom: 24px;">
            ${plat.nombre.charAt(0).toUpperCase()}
          </div>
          <h3 style="margin:0 0 24px 0; font-size:13px; color:var(--text-warning); font-weight:700; text-transform:uppercase; letter-spacing:1px;">Balance Anual</h3>
          
          <div style="width:100%; margin-bottom: 16px;">
            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Compra</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              <span style="color:var(--text-warning);">📉</span> ${formatearMoneda(comprasTotales)}
            </div>
          </div>
          
          <div style="width:100%; margin-bottom: 16px;">
            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Venta</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              <span style="color:var(--color-positive);">📈</span> ${formatearMoneda(ventasTotales)}
            </div>
          </div>
          
          <div style="width:100%; padding-top: 16px; border-top: 1px solid var(--border-color);">
            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Ganancia</div>
            <div style="font-size:18px; font-weight:700; color:var(--color-positive); display:flex; align-items:center; gap:8px;">
              <span style="color:var(--accent-primary);">💰</span> ${formatearMoneda(balance)}
            </div>
          </div>
        </div>
      </div>
      
      <!-- TABLA DE CUENTAS MAESTRAS DE ESTA PLATAFORMA -->
      <div style="margin-top: 32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <h3 style="margin:0; font-size:16px; color:var(--text-primary);">Credenciales Proveedor (Cuentas Maestras)</h3>
          <button class="btn-primario" onclick="formCuentaMaestraModal(null, ${id})">+ Añadir Credencial</button>
        </div>
        <div class="table-wrapper">
          <div style="overflow-x:auto;">
            <table>
              <thead>
                <tr>
                  <th>Correo / Acceso</th>
                  <th>Contraseña / PIN</th>
                  <th>Slots / Perfiles</th>
                  <th>Renovación Proveedor</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="tbody-cuentas-maestras-stats">
                <tr><td colspan="6" style="text-align:center;padding:20px;">Cargando cuentas maestras...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>


      <!-- TABLA 3: GESTIÓN DE SLOTS -->
      <div style="margin-top: 32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <h3 style="margin:0; font-size:16px; color:var(--text-primary);">Gestión de Slots (Asignación Visual)</h3>
        </div>
        <div class="table-wrapper">
          <div style="overflow-x:auto;">
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Email / Cuenta Maestra</th>
                  <th>Perfiles / Slots (Clic para asignar)</th>
                  <th>Progreso</th>
                </tr>
              </thead>
              <tbody id="tbody-cuentas-slots-stats">
                <tr><td colspan="4" style="text-align:center;padding:20px;">Cargando slots...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- TABLA DE CUENTAS VENDIDAS A CLIENTES -->
      <div style="margin-top: 32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <h3 style="margin:0; font-size:16px; color:var(--text-primary);">Perfiles Vendidos a Clientes</h3>
        </div>
        <div class="table-wrapper">
          <div style="overflow-x:auto;">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo / Servicio</th>
                  <th>Cuenta Maestra / PIN</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Comprobante</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="tbody-cuentas-clientes-stats">
                <tr><td colspan="7" style="text-align:center;padding:20px;">Cargando clientes...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Cargar ambas tablas
    cargarTablasStats(id, plat);

    // Procesar datos para Chart.js
    const mesesMap = {};
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const añoActual = new Date().getFullYear();
    for (let i = 1; i <= 12; i++) {
      const mesStr = `${añoActual}-${i.toString().padStart(2, '0')}`;
      mesesMap[mesStr] = { compra: 0, venta: 0, label: nombresMeses[i-1] };
    }

    data.compras_por_mes.forEach(c => { if(mesesMap[c.mes]) mesesMap[c.mes].compra = parseFloat(c.total_compra); });
    data.ventas_por_mes.forEach(v => { if(mesesMap[v.mes]) mesesMap[v.mes].venta = parseFloat(v.total_venta); });

    const labels = Object.values(mesesMap).map(m => m.label);
    const comprasData = Object.values(mesesMap).map(m => m.compra);
    const ventasData = Object.values(mesesMap).map(m => m.venta);
    const gananciaData = Object.values(mesesMap).map(m => m.venta - m.compra);

    const ctx = document.getElementById('chartReportePlataforma').getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ventas',
            data: ventasData,
            borderColor: '#7C5CFF', // Morado
            backgroundColor: 'rgba(124, 92, 255, 0.1)',
            borderWidth: 2,
            tension: 0.4, // Curva suave
            fill: true
          },
          {
            label: 'Compras',
            data: comprasData,
            borderColor: '#22C55E', // Verde
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Ganancia',
            data: gananciaData,
            borderColor: '#3B82F6', // Azul
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#A1A7B3' } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#2A313C', drawBorder: false }, ticks: { color: '#A1A7B3' } },
          x: { grid: { display: false }, ticks: { color: '#A1A7B3' } }
        }
      }
    });

  } catch (err) {
    mostrarToast('error', err.message);
  }
}

async function cargarTablasStats(servicioId, plat) {
  try {
    const [maestras, todasCuentas, clientes] = await Promise.all([
      api.cuentasMaestras.listar(servicioId),
      api.cuentas.listar(),
      api.clientes.listar()
    ]);
    cacheCuentasMaestras = maestras;
    cacheCuentas = todasCuentas;
    cacheClientes = clientes;

    const tbodyMaestras = document.getElementById('tbody-cuentas-maestras-stats');
    if (tbodyMaestras) {
      tbodyMaestras.innerHTML = maestras.map((cm) => {
        const passId = `pwd-cm-st-${cm.id}`;
        return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:6px;">
                <strong style="font-family:monospace;font-size:13px;color:var(--text-primary);">${cm.correo}</strong>
                <button class="btn-copiar" onclick="copiarTexto('${cm.correo}', this)">📋</button>
              </div>
              ${cm.proveedor ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Prov: ${cm.proveedor} (${formatearMoneda(cm.costo)})</div>` : ''}
            </td>
            <td>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span id="${passId}" data-hidden="true" data-real-password="${cm.password}" style="font-family:monospace;font-size:13px;color:var(--accent-primary);font-weight:600;">••••••••</span>
                  <button class="btn-copiar" onclick="toggleVisibilidadPassword('${passId}', this)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span>Ver</span>
                  </button>
                  <button class="btn-copiar" onclick="copiarTexto('${cm.password}', this)">📋</button>
                </div>
              </div>
            </td>
            <td>
              <span class="slots-pill">
                ${cm.perfiles_ocupados || 0} / ${cm.perfiles_totales || 5} perfiles
              </span>
            </td>
            <td>
              ${cm.fecha_renovacion ? `
                <strong>${new Date(cm.fecha_renovacion).toLocaleDateString()}</strong>
              ` : '<span style="color:var(--text-muted);font-size:12px;">No registrada</span>'}
            </td>
            <td>
              <span class="badge badge-${cm.estado === 'activa' ? 'activa' : (cm.estado === 'caida' ? 'vencida' : 'por_vencer')}">
                ${cm.estado}
              </span>
            </td>
            <td class="acciones">
              <button class="btn-tabla" onclick="formCuentaMaestraModal(${cm.id})">Editar</button>
              <button class="btn-tabla btn-peligro" onclick="eliminarCuentaMaestra(${cm.id})">Eliminar</button>
            </td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">No hay cuentas maestras registradas en esta plataforma.</td></tr>';
    }


    const tbodySlots = document.getElementById('tbody-cuentas-slots-stats');
    if (tbodySlots) {
      const cuentasPorMaestra = {};
      todasCuentas.forEach(c => {
        if (c.cuenta_maestra_id) {
          if (!cuentasPorMaestra[c.cuenta_maestra_id]) cuentasPorMaestra[c.cuenta_maestra_id] = [];
          cuentasPorMaestra[c.cuenta_maestra_id].push(c);
        }
      });
      
      tbodySlots.innerHTML = maestras.map(cm => {
        const clientesAsignados = cuentasPorMaestra[cm.id] || [];
        
        let perfilesHtml = '';
        for(let i=0; i<cm.perfiles_totales; i++) {
          const cuentaCliente = clientesAsignados[i];
          if (cuentaCliente) {
            perfilesHtml += `
              <div onclick="formEditarCuentaModal(${cuentaCliente.id})" 
                   title="Ocupado por ${cuentaCliente.cliente_nombre || 'Cliente'}" 
                   style="display:inline-flex; align-items:center; justify-content:center; width: 32px; height: 32px; background: ${plat.icono_color || 'var(--accent-primary)'}; border-radius: 6px; color: white; cursor: pointer; margin-right: 6px; margin-bottom: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            `;
          } else {
            perfilesHtml += `
              <div onclick="formSuscripcionModal(${cm.id}, ${i + 1}, null)" 
                   title="Slot Disponible (Clic para vender)" 
                   style="display:inline-flex; align-items:center; justify-content:center; width: 32px; height: 32px; background: var(--bg-hover); border: 1px dashed var(--border-color); border-radius: 6px; color: var(--text-muted); cursor: pointer; margin-right: 6px; margin-bottom: 6px; transition: all 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            `;
          }
        }
        
        return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width: 32px; height: 32px; border-radius: 6px; background: ${plat.icono_color || 'var(--accent-primary)'}; background-image: ${plat.logo_url ? `url('${plat.logo_url}')` : 'none'}; background-size: cover; background-position: center; display:flex; align-items:center; justify-content:center; color: ${plat.logo_url ? 'transparent' : 'white'}; font-weight:bold;">
                  ${!plat.logo_url ? (plat.nombre ? plat.nombre.charAt(0).toUpperCase() : '?') : ''}
                </div>
                <strong>${plat.nombre}</strong>
              </div>
            </td>
            <td>
              <strong style="font-family:monospace;font-size:12.5px;color:var(--text-primary);">${cm.correo}</strong>
            </td>
            <td>
              <div style="display:flex; flex-wrap:wrap; max-width: 200px;">
                ${perfilesHtml}
              </div>
            </td>
            <td>
              <span style="font-size:13px;font-weight:600;color:var(--text-muted);">${clientesAsignados.length} / ${cm.perfiles_totales} Ocupados</span>
            </td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="4" style="text-align:center;padding:28px;color:var(--text-muted);">No hay slots disponibles</td></tr>';
    }
    const clientesCuentas = todasCuentas.filter(c => c.servicio_id === servicioId);
    const tbodyClientes = document.getElementById('tbody-cuentas-clientes-stats');
    if (tbodyClientes) {
      tbodyClientes.innerHTML = clientesCuentas.map(c => `
        <tr>
          <td>
            <div class="cell-user">
              <div class="cell-avatar">${c.cliente_nombre.charAt(0).toUpperCase()}</div>
              <div class="cell-info">
                <strong>${c.cliente_nombre}</strong>
                <span>${c.cliente_telefono}</span>
              </div>
            </div>
          </td>
          <td>
            <strong>${c.servicio_nombre}</strong>
            <span style="display:block;font-size:12px;color:var(--text-secondary);">${c.tipo_perfil ? c.tipo_perfil : 'Perfil individual'}</span>
          </td>
          <td>
            ${c.cuenta_maestra_correo ? `
              <div style="display:flex;flex-direction:column;gap:3px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <strong style="font-family:monospace;font-size:12.5px;color:var(--text-primary);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${c.cuenta_maestra_correo}">
                    ${c.cuenta_maestra_correo}
                  </strong>
                  <button class="btn-copiar" style="padding:2px 5px;font-size:11px;" onclick="copiarTexto('${c.cuenta_maestra_correo}', this)" title="Copiar correo">📋</button>
                </div>
                ${c.pin_efectivo ? `
                  <div style="display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--text-muted);">
                    <span>PIN: <strong style="color:var(--text-primary);font-family:monospace;">${c.pin_efectivo}</strong></span>
                    <button class="btn-copiar" style="padding:1px 4px;font-size:10px;" onclick="copiarTexto('${c.pin_efectivo}', this)" title="Copiar PIN">📋</button>
                  </div>
                ` : ''}
              </div>
            ` : '<span style="color:var(--text-muted);font-size:12px;">Sin vincular</span>'}
          </td>
          <td>
            <strong>${new Date(c.fecha_vencimiento).toLocaleDateString()}</strong>
          </td>
          <td>
            <span class="badge badge-${c.estado}">${c.estado.replace('_', ' ')}</span>
          </td>
          <td>
            ${c.comprobante_imagen_url ? `
              <button class="btn-comprobante" onclick="verComprobanteModal('${c.comprobante_imagen_url}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Ver imagen</span>
              </button>
            ` : '<span style="color:var(--text-muted);font-size:12px;">Sin archivo</span>'}
          </td>
          <td class="acciones">
            <button class="btn-tabla" onclick="formEditarCuentaModal(${c.id})" title="Editar datos">Editar</button>
            <button class="btn-tabla" onclick="formRenovarModal(${c.id})" title="Renovar">Renovar</button>
            ${c.estado !== 'cancelada' ? `<button class="btn-tabla" style="color:var(--color-warning);" onclick="cancelarCuenta(${c.id})">Cancelar</button>` : ''}
            <button class="btn-tabla btn-peligro" onclick="eliminarCuenta(${c.id})" title="Eliminar">🗑️</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No se encontraron clientes para esta plataforma.</td></tr>';
    }
  } catch (err) {
    console.error('Error cargando tablas de stats', err);
  }
}
