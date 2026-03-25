/* ── CONFIG ─────────────────────────────────────── */
const API = 'http://localhost:5000';

/* ── AUTH ───────────────────────────────────────── */
function requireAuth() {
    if (!localStorage.getItem('ss_logged')) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('ss_logged');
    localStorage.removeItem('ss_user');
    window.location.href = 'login.html';
}

/* ── NAV INJECTION ──────────────────────────────── */
function injectNav(activePage) {
    const nav = document.getElementById('sidebar');
    if (!nav) return;

    const links = [
        {
            href: 'index.html', label: 'Inicio', page: 'index',
            icon: `<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>`
        },
        {
            href: 'productos.html', label: 'Catálogo', page: 'productos',
            icon: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`
        },
        {
            href: 'clientes.html', label: 'Clientes', page: 'clientes',
            icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`
        },
        {
            href: 'ventas.html', label: 'Ventas', page: 'ventas',
            icon: `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>`
        },
        {
            href: 'reporte.html', label: 'Reporte', page: 'reporte',
            icon: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`
        },
    ];

    nav.innerHTML = `
        <div class="sidebar-brand">
            <div class="brand-icon">🛒</div>
            <div>
                <span class="brand-name">SysStore</span>
                <span class="brand-sub">Punto de venta</span>
            </div>
        </div>
        <ul class="nav-list">
            ${links.map(l => `
            <li>
                <a href="${l.href}" class="nav-link ${activePage === l.page ? 'active' : ''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${l.icon}</svg>
                    <span>${l.label}</span>
                </a>
            </li>`).join('')}
        </ul>
        <div class="sidebar-bottom">
            <button class="btn-logout" onclick="logout()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
            </button>
        </div>
        <div class="sidebar-foot">SysStore &middot; UAEMEX FIC</div>
    `;
}

/* ── TOAST ──────────────────────────────────────── */
function toast(msg, type = 'ok') {
    let el = document.getElementById('toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = `toast toast-${type} show`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ── API HELPERS ────────────────────────────────── */
async function apiFetch(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (res.status === 204) return null;
    return res.json().then(d => ({ ok: res.ok, status: res.status, data: d }));
}

/* ── ESCAPE ─────────────────────────────────────── */
function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
}

function fmtMoney(n) {
    return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}