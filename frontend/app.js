const API = 'http://localhost:5000';

// ─────────────────────────────────────────────
//  TABS
// ─────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'ventas')  { loadClients(); loadArticles(); loadSales(); }
    if (btn.dataset.tab === 'reporte') { loadReport(); }
    if (btn.dataset.tab === 'clientes') loadClients();
    if (btn.dataset.tab === 'articulos') loadArticles();
  });
});

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
function toast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ─────────────────────────────────────────────
//  ARTÍCULOS
// ─────────────────────────────────────────────
const artForm       = document.getElementById('articleForm');
const artIdInput    = document.getElementById('articleId');
const artName       = document.getElementById('artName');
const artPrice      = document.getElementById('artPrice');
const artDesc       = document.getElementById('artDescription');
const artStock      = document.getElementById('artStock');
const artSubmitBtn  = document.getElementById('artSubmitBtn');
const artCancelBtn  = document.getElementById('artCancelBtn');
const artFormTitle  = document.getElementById('articleFormTitle');

async function loadArticles() {
  const res  = await fetch(`${API}/articles`);
  const data = await res.json();
  const tbody = document.querySelector('#articlesTable tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin artículos registrados</td></tr>';
    return;
  }

  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.name}</td>
      <td class="money">$${a.price.toFixed(2)}</td>
      <td>${a.description || '—'}</td>
      <td><span class="badge ${a.stock > 0 ? 'badge-ok' : 'badge-warn'}">${a.stock}</span></td>
      <td>${new Date(a.created_at).toLocaleDateString('es-MX')}</td>
      <td class="actions">
        <button class="btn btn-edit" onclick="editArticle('${a.id}','${escStr(a.name)}',${a.price},'${escStr(a.description)}',${a.stock})">✏️ Editar</button>
        <button class="btn btn-delete" onclick="deleteArticle('${a.id}')">🗑 Eliminar</button>
      </td>`;
    tbody.appendChild(tr);
  });

  // También actualizar el select de ventas
  const sel = document.getElementById('saleArticle');
  const cur = sel.value;
  sel.innerHTML = '<option value="">-- Selecciona artículo --</option>';
  data.filter(a => a.stock > 0).forEach(a => {
    const op = new Option(`${a.name} — $${a.price.toFixed(2)} (stock: ${a.stock})`, a.id);
    op.dataset.price = a.price;
    sel.appendChild(op);
  });
  if (cur) sel.value = cur;
}

artForm.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    name: artName.value,
    price: parseFloat(artPrice.value),
    description: artDesc.value,
    stock: parseInt(artStock.value)
  };
  const id = artIdInput.value;
  const res = id
    ? await fetch(`${API}/articles/${id}`, { method: 'PUT',  headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    : await fetch(`${API}/articles`,       { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });

  if (res.ok) {
    toast(id ? '✅ Artículo actualizado' : '✅ Artículo guardado');
    resetArtForm();
    loadArticles();
  } else {
    toast('❌ Error al guardar artículo', 'err');
  }
});

window.editArticle = (id, name, price, desc, stock) => {
  artIdInput.value  = id;
  artName.value     = name;
  artPrice.value    = price;
  artDesc.value     = desc;
  artStock.value    = stock;
  artSubmitBtn.textContent = '💾 Actualizar';
  artCancelBtn.style.display = 'inline-flex';
  artFormTitle.textContent = '✏️ Editar Artículo';
  artForm.scrollIntoView({ behavior: 'smooth' });
};

window.deleteArticle = async id => {
  if (!confirm('¿Eliminar este artículo?')) return;
  const res = await fetch(`${API}/articles/${id}`, { method: 'DELETE' });
  if (res.ok) { toast('🗑 Artículo eliminado'); loadArticles(); }
  else toast('❌ Error al eliminar', 'err');
};

artCancelBtn.addEventListener('click', resetArtForm);

function resetArtForm() {
  artForm.reset();
  artIdInput.value = '';
  artSubmitBtn.textContent = '💾 Guardar';
  artCancelBtn.style.display = 'none';
  artFormTitle.textContent = '➕ Nuevo Artículo';
}

// ─────────────────────────────────────────────
//  CLIENTES
// ─────────────────────────────────────────────
const cliForm      = document.getElementById('clientForm');
const cliIdInput   = document.getElementById('clientId');
const cliName      = document.getElementById('cliName');
const cliEmail     = document.getElementById('cliEmail');
const cliPhone     = document.getElementById('cliPhone');
const cliSubmitBtn = document.getElementById('cliSubmitBtn');
const cliCancelBtn = document.getElementById('cliCancelBtn');
const cliFormTitle = document.getElementById('clientFormTitle');

async function loadClients() {
  const res  = await fetch(`${API}/clients`);
  const data = await res.json();
  const tbody = document.querySelector('#clientsTable tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">Sin clientes registrados</td></tr>';
  } else {
    data.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone || '—'}</td>
        <td>${new Date(c.registered_at).toLocaleDateString('es-MX')}</td>
        <td class="actions">
          <button class="btn btn-edit" onclick="editClient('${c.id}','${escStr(c.name)}','${escStr(c.email)}','${escStr(c.phone)}')">✏️ Editar</button>
          <button class="btn btn-delete" onclick="deleteClient('${c.id}')">🗑 Eliminar</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  // Actualizar select de ventas
  const sel = document.getElementById('saleClient');
  const cur = sel.value;
  sel.innerHTML = '<option value="">-- Selecciona cliente --</option>';
  data.forEach(c => sel.appendChild(new Option(c.name, c.id)));
  if (cur) sel.value = cur;
}

cliForm.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = { name: cliName.value, email: cliEmail.value, phone: cliPhone.value };
  const id = cliIdInput.value;
  const res = id
    ? await fetch(`${API}/clients/${id}`, { method: 'PUT',  headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    : await fetch(`${API}/clients`,       { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });

  if (res.ok) {
    toast(id ? '✅ Cliente actualizado' : '✅ Cliente dado de alta');
    resetCliForm();
    loadClients();
  } else {
    const err = await res.json();
    toast('❌ ' + (err.error || 'Error al guardar cliente'), 'err');
  }
});

window.editClient = (id, name, email, phone) => {
  cliIdInput.value = id;
  cliName.value    = name;
  cliEmail.value   = email;
  cliPhone.value   = phone;
  cliSubmitBtn.textContent = '💾 Actualizar';
  cliCancelBtn.style.display = 'inline-flex';
  cliFormTitle.textContent = '✏️ Editar Cliente';
  cliForm.scrollIntoView({ behavior: 'smooth' });
};

window.deleteClient = async id => {
  if (!confirm('¿Eliminar este cliente? También se eliminarán sus ventas.')) return;
  const res = await fetch(`${API}/clients/${id}`, { method: 'DELETE' });
  if (res.ok) { toast('🗑 Cliente eliminado'); loadClients(); }
  else toast('❌ Error al eliminar', 'err');
};

cliCancelBtn.addEventListener('click', resetCliForm);

function resetCliForm() {
  cliForm.reset();
  cliIdInput.value = '';
  cliSubmitBtn.textContent = '💾 Guardar';
  cliCancelBtn.style.display = 'none';
  cliFormTitle.textContent = '➕ Nuevo Cliente';
}

// ─────────────────────────────────────────────
//  VENTAS
// ─────────────────────────────────────────────
const saleForm    = document.getElementById('saleForm');
const saleClient  = document.getElementById('saleClient');
const saleArticle = document.getElementById('saleArticle');
const saleQty     = document.getElementById('saleQty');
const saleTotal   = document.getElementById('saleTotal');

function calcTotal() {
  const opt = saleArticle.options[saleArticle.selectedIndex];
  const price = parseFloat(opt?.dataset?.price || 0);
  const qty   = parseInt(saleQty.value || 1);
  saleTotal.value = price ? `$${(price * qty).toFixed(2)}` : '';
}
saleArticle.addEventListener('change', calcTotal);
saleQty.addEventListener('input', calcTotal);

saleForm.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    client_id:  saleClient.value,
    article_id: saleArticle.value,
    quantity:   parseInt(saleQty.value)
  };
  const res = await fetch(`${API}/sales`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    toast('✅ Venta registrada');
    saleForm.reset();
    saleTotal.value = '';
    loadSales();
    loadArticles(); // actualiza stock
  } else {
    const err = await res.json();
    toast('❌ ' + (err.error || 'Error al registrar venta'), 'err');
  }
});

async function loadSales() {
  const res  = await fetch(`${API}/sales`);
  const data = await res.json();
  const tbody = document.querySelector('#salesTable tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">Sin ventas registradas</td></tr>';
    return;
  }

  data.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.client_name}</td>
      <td>${s.article_name}</td>
      <td class="money">$${s.article_price.toFixed(2)}</td>
      <td>${s.quantity}</td>
      <td class="money"><strong>$${s.total.toFixed(2)}</strong></td>
      <td>${new Date(s.date).toLocaleDateString('es-MX')}</td>
      <td class="actions">
        <button class="btn btn-delete" onclick="deleteSale('${s.id}')">🗑 Cancelar</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

window.deleteSale = async id => {
  if (!confirm('¿Cancelar esta venta? El stock será restaurado.')) return;
  const res = await fetch(`${API}/sales/${id}`, { method: 'DELETE' });
  if (res.ok) { toast('🗑 Venta cancelada'); loadSales(); loadArticles(); }
  else toast('❌ Error al cancelar', 'err');
};

// ─────────────────────────────────────────────
//  REPORTE
// ─────────────────────────────────────────────
async function loadReport() {
  const container = document.getElementById('reportContainer');
  container.innerHTML = '<p class="loading">Cargando reporte...</p>';
  const res  = await fetch(`${API}/report`);
  const data = await res.json();

  if (data.length === 0) {
    container.innerHTML = '<p class="empty">No hay clientes registrados aún.</p>';
    return;
  }

  container.innerHTML = data.map(c => `
    <div class="report-card">
      <div class="report-header">
        <div>
          <strong class="client-name">👤 ${c.name}</strong>
          <span class="client-email">${c.email}</span>
          ${c.phone ? `<span class="client-phone">📞 ${c.phone}</span>` : ''}
        </div>
        <div class="report-stats">
          <span class="stat">🛒 ${c.total_purchases} compra(s)</span>
          <span class="stat money">💰 $${c.total_spent.toFixed(2)}</span>
          <span class="stat date">📅 Alta: ${new Date(c.registered_at).toLocaleDateString('es-MX')}</span>
        </div>
      </div>
      ${c.purchases.length > 0 ? `
        <table class="inner-table">
          <thead><tr><th>Artículo</th><th>Cant.</th><th>Total</th><th>Fecha</th></tr></thead>
          <tbody>
            ${c.purchases.map(p => `
              <tr>
                <td>${p.article}</td>
                <td>${p.quantity}</td>
                <td class="money">$${p.total.toFixed(2)}</td>
                <td>${new Date(p.date).toLocaleDateString('es-MX')}</td>
              </tr>`).join('')}
          </tbody>
        </table>` : '<p class="no-purchases">Sin compras aún.</p>'}
    </div>`).join('');
}

// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────
function escStr(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadArticles);