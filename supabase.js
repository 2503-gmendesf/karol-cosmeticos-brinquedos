/**
 * supabase.js — Cliente Supabase compartilhado + funções auxiliares
 * Inclua este arquivo antes de auth.js e do script de cada página.
 */

// ── CONFIGURAÇÃO ─────────────────────────────────────────────
// Substitua pelos valores do seu projeto em:
// Supabase Dashboard > Project Settings > API
const SUPABASE_URL      = 'https://qvlvvnczyxdtttzltyhv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bHZ2bmN6eXhkdHR0emx0eWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzM1NzQsImV4cCI6MjA5NTg0OTU3NH0.eNAafh451nor4Ff0mlt7Jer8AJIUq_9vVgIHuQy2IJ8';

// Cria o cliente global (disponível como `db` em todos os scripts)
// Usamos window.db para que demo.js possa substituí-lo em modo de demonstração
window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── FORMATAÇÃO ────────────────────────────────────────────────

/** Formata número como moeda brasileira (R$ 1.234,56) */
function fmt(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(valor ?? 0);
}

/** Formata ISO string como data e hora curtas em pt-BR */
function fmtDataHora(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short', timeStyle: 'short'
  });
}

/** Formata ISO string como data curta em pt-BR */
function fmtData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ── TOAST ─────────────────────────────────────────────────────

/** Cria container de toasts se ainda não existir */
function _getToastContainer() {
  let el = document.getElementById('toast-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}

/**
 * Exibe notificação toast.
 * @param {string} msg - Mensagem
 * @param {'info'|'sucesso'|'erro'|'aviso'} tipo
 * @param {number} duracao - Milissegundos antes de sumir
 */
function toast(msg, tipo = 'info', duracao = 3500) {
  const icones = { sucesso: '✓', erro: '✕', aviso: '⚠', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.innerHTML = `<span class="toast-icon">${icones[tipo] ?? 'ℹ'}</span>${msg}`;
  _getToastContainer().appendChild(el);
  setTimeout(() => el.remove(), duracao);
}

// ── MODAL ─────────────────────────────────────────────────────

/** Abre modal pelo id do overlay */
function abrirModal(id) {
  document.getElementById(id)?.classList.add('ativo');
}

/** Fecha modal pelo id do overlay */
function fecharModal(id) {
  document.getElementById(id)?.classList.remove('ativo');
}

// ── UTILITÁRIOS ───────────────────────────────────────────────

/**
 * Retorna função com atraso para evitar chamadas excessivas.
 * @param {Function} fn
 * @param {number} atraso - ms
 */
function debounce(fn, atraso = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), atraso);
  };
}

/** Retorna fatia de items para a página solicitada */
function paginar(items, pagina, porPagina = 20) {
  const total  = items.length;
  const paginas = Math.ceil(total / porPagina);
  const fatia  = items.slice((pagina - 1) * porPagina, pagina * porPagina);
  return { items: fatia, total, paginas, pagina };
}

/**
 * Renderiza controles de paginação em um container.
 * @param {HTMLElement} container
 * @param {number} atual
 * @param {number} total
 * @param {Function} aoMudar - recebe o número da nova página
 */
function renderPaginacao(container, atual, total, aoMudar) {
  container.innerHTML = '';
  if (total <= 1) return;

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '←';
  prev.disabled = atual === 1;
  prev.onclick = () => aoMudar(atual - 1);
  container.appendChild(prev);

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn${i === atual ? ' ativo' : ''}`;
    btn.textContent = i;
    btn.onclick = () => aoMudar(i);
    container.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = '→';
  next.disabled = atual === total;
  next.onclick = () => aoMudar(atual + 1);
  container.appendChild(next);
}

// ── LAYOUT ────────────────────────────────────────────────────

/** Inicializa comportamento mobile da sidebar (hambúrguer) */
function initSidebar() {
  const hamburguer = document.getElementById('hamburguer');
  const sidebar    = document.getElementById('sidebar');
  const overlay    = document.getElementById('sidebar-overlay');

  hamburguer?.addEventListener('click', () => {
    sidebar.classList.toggle('aberta');
    overlay.classList.toggle('aberta');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('aberta');
    overlay.classList.remove('aberta');
  });
}

/** Marca o link de navegação correspondente à página atual como ativo */
function marcarNavAtivo() {
  const pagina = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('ativo', a.getAttribute('href') === pagina);
  });
}

// ── INTERVALOS DE DATA ────────────────────────────────────────

function rangeHoje() {
  const d = new Date();
  return {
    inicio: new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(),
    fim:    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString()
  };
}

function range7Dias() {
  const fim    = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 6);
  inicio.setHours(0, 0, 0, 0);
  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

function rangeMesAtual() {
  const agora = new Date();
  return {
    inicio: new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString(),
    fim:    new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59).toISOString()
  };
}
