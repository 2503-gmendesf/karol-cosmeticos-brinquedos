/**
 * auth.js — Lógica de autenticação e proteção de rotas
 * Depende de supabase.js (deve ser incluído antes).
 */

/**
 * Verifica se há sessão ativa e se o perfil tem permissão.
 * Redireciona para index.html se não autenticado ou sem permissão.
 *
 * @param {string[]} perfisPermitidos - Ex: ['admin'] ou ['admin','vendedor']
 * @returns {{ usuario, perfil } | null} - Dados do usuário logado ou null
 */
async function verificarAuth(perfisPermitidos = ['admin', 'vendedor']) {
  try {
    const { data: { session } } = await db.auth.getSession();

    if (!session) {
      window.location.href = 'index.html';
      return null;
    }

    const { data: perfil, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !perfil || !perfisPermitidos.includes(perfil.perfil)) {
      await db.auth.signOut();
      window.location.href = 'index.html';
      return null;
    }

    return { usuario: session.user, perfil };

  } catch (err) {
    // Erro de rede — exibe mensagem amigável
    console.error('Erro ao verificar autenticação:', err);
    toast('Erro de conexão. Verifique sua internet.', 'erro');
    return null;
  }
}

/** Encerra a sessão e redireciona para login */
async function logout() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

/**
 * Preenche os elementos de nome e perfil do usuário no header.
 * @param {{ nome: string, perfil: string }} perfil
 */
function renderInfoUsuario(perfil) {
  const elNome   = document.getElementById('usuario-nome');
  const elPerfil = document.getElementById('usuario-perfil');

  if (elNome)   elNome.textContent   = perfil.nome ?? '—';
  if (elPerfil) elPerfil.textContent = perfil.perfil === 'admin'
    ? 'Administrador' : 'Vendedor';
}

/**
 * Remove do DOM todos os elementos marcados com [data-admin],
 * caso o usuário não seja administrador.
 * @param {{ perfil: string }} perfil
 */
function ocultarElementosAdmin(perfil) {
  if (perfil.perfil !== 'admin') {
    document.querySelectorAll('[data-admin]').forEach(el => el.remove());
  }
}
