/**
 * demo.js — Modo de Demonstração do KosmoSystem
 *
 * Funciona 100% offline, sem precisar de Supabase configurado.
 * Ativado quando sessionStorage contém 'kosmo_demo' = 'admin' | 'vendedor'.
 *
 * Carregue este script APÓS supabase.js e ANTES de auth.js em cada página.
 */

(function () {
  const DEMO_PERFIL = sessionStorage.getItem('kosmo_demo');
  if (!DEMO_PERFIL) return; // fora do modo demo, não faz nada

  /* ── IDs fixos dos usuários demo ────────────────────────── */
  const ID_ADMIN     = 'demo-admin-0000-0000-000000000001';
  const ID_VENDEDOR  = 'demo-vend-0000-0000-000000000002';
  const ID_ATIVO     = DEMO_PERFIL === 'admin' ? ID_ADMIN : ID_VENDEDOR;

  /* ── Helpers para gerar dados ───────────────────────────── */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function diasAtras(n, hora = '10:00:00') {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10) + 'T' + hora + '.000Z';
  }

  /* ══════════════════════════════════════════════════════════
     DADOS DE DEMONSTRAÇÃO
     ══════════════════════════════════════════════════════════ */

  /* Perfis */
  const _profiles = [
    { id: ID_ADMIN,    nome: 'Ana Lima (Admin)',   perfil: 'admin',    criado_em: diasAtras(60) },
    { id: ID_VENDEDOR, nome: 'Carlos Souza',        perfil: 'vendedor', criado_em: diasAtras(30) }
  ];

  /* Formas de pagamento */
  const _formas_pagamento = [
    { id: 1, nome: 'Dinheiro',          ativo: true  },
    { id: 2, nome: 'PIX',               ativo: true  },
    { id: 3, nome: 'Cartão de Crédito', ativo: true  },
    { id: 4, nome: 'Cartão de Débito',  ativo: true  },
    { id: 5, nome: 'Vale-Compras',      ativo: false }
  ];

  /* Categorias */
  const _categorias = [
    { id: 1, nome: 'Shampoo & Condicionador' },
    { id: 2, nome: 'Maquiagem'               },
    { id: 3, nome: 'Skincare'                },
    { id: 4, nome: 'Perfumaria'              },
    { id: 5, nome: 'Tratamento Capilar'      }
  ];

  /* Produtos */
  const _produtos = [
    { id: uuid(), nome: 'Shampoo Liso Perfeito 300ml',       codigo_barras: '7891234560001', preco_venda: 28.90, preco_custo: 12.00, estoque: 42, categoria_id: 1, imagem_url: null, codigo_extra: 'SH-001' },
    { id: uuid(), nome: 'Shampoo Hidratação Intensa 400ml',  codigo_barras: '7891234560002', preco_venda: 34.90, preco_custo: 15.00, estoque: 27, categoria_id: 1, imagem_url: null, codigo_extra: 'SH-002' },
    { id: uuid(), nome: 'Condicionador Cachos Definidos 300ml', codigo_barras: '7891234560003', preco_venda: 29.90, preco_custo: 11.00, estoque: 4,  categoria_id: 1, imagem_url: null, codigo_extra: 'CO-001' },
    { id: uuid(), nome: 'Base Líquida FPS 30 Bege Claro',   codigo_barras: '7891234560004', preco_venda: 59.90, preco_custo: 22.00, estoque: 18, categoria_id: 2, imagem_url: null, codigo_extra: 'MK-001' },
    { id: uuid(), nome: 'Batom Rosé Nude Matte',             codigo_barras: '7891234560005', preco_venda: 22.90, preco_custo:  8.00, estoque: 35, categoria_id: 2, imagem_url: null, codigo_extra: 'MK-002' },
    { id: uuid(), nome: 'Máscara de Cílios Volume Total',    codigo_barras: '7891234560006', preco_venda: 44.90, preco_custo: 16.00, estoque: 0,  categoria_id: 2, imagem_url: null, codigo_extra: 'MK-003' },
    { id: uuid(), nome: 'Sérum Vitamina C 30ml',             codigo_barras: '7891234560007', preco_venda: 89.90, preco_custo: 35.00, estoque: 12, categoria_id: 3, imagem_url: null, codigo_extra: 'SK-001' },
    { id: uuid(), nome: 'Creme Hidratante Facial 50g',       codigo_barras: '7891234560008', preco_venda: 49.90, preco_custo: 18.00, estoque: 22, categoria_id: 3, imagem_url: null, codigo_extra: 'SK-002' },
    { id: uuid(), nome: 'Esfoliante Facial Suave 100g',      codigo_barras: '7891234560009', preco_venda: 39.90, preco_custo: 14.00, estoque: 8,  categoria_id: 3, imagem_url: null, codigo_extra: 'SK-003' },
    { id: uuid(), nome: 'Tônico Facial Poros 150ml',         codigo_barras: '7891234560010', preco_venda: 54.90, preco_custo: 20.00, estoque: 15, categoria_id: 3, imagem_url: null, codigo_extra: 'SK-004' },
    { id: uuid(), nome: 'Perfume Floral Bloom 100ml',        codigo_barras: '7891234560011', preco_venda: 129.90, preco_custo: 48.00, estoque: 9, categoria_id: 4, imagem_url: null, codigo_extra: 'PF-001' },
    { id: uuid(), nome: 'Perfume Masculino Wood 75ml',       codigo_barras: '7891234560012', preco_venda: 119.90, preco_custo: 44.00, estoque: 7, categoria_id: 4, imagem_url: null, codigo_extra: 'PF-002' },
    { id: uuid(), nome: 'Primer Facial Oil Free 30ml',       codigo_barras: '7891234560013', preco_venda: 67.90, preco_custo: 25.00, estoque: 3,  categoria_id: 2, imagem_url: null, codigo_extra: 'MK-004' },
    { id: uuid(), nome: 'Pó Compacto Translúcido 10g',       codigo_barras: '7891234560014', preco_venda: 38.90, preco_custo: 13.00, estoque: 20, categoria_id: 2, imagem_url: null, codigo_extra: 'MK-005' },
    { id: uuid(), nome: 'Blush Coral Suave 8g',              codigo_barras: '7891234560015', preco_venda: 34.90, preco_custo: 12.00, estoque: 25, categoria_id: 2, imagem_url: null, codigo_extra: 'MK-006' },
    { id: uuid(), nome: 'Paleta de Sombras 12 Cores',        codigo_barras: '7891234560016', preco_venda: 79.90, preco_custo: 28.00, estoque: 11, categoria_id: 2, imagem_url: null, codigo_extra: 'MK-007' },
    { id: uuid(), nome: 'Óleo Capilar Argan 50ml',           codigo_barras: '7891234560017', preco_venda: 42.90, preco_custo: 16.00, estoque: 2,  categoria_id: 5, imagem_url: null, codigo_extra: 'CA-001' },
    { id: uuid(), nome: 'Máscara Capilar Reconstrução 500g', codigo_barras: '7891234560018', preco_venda: 55.90, preco_custo: 20.00, estoque: 16, categoria_id: 5, imagem_url: null, codigo_extra: 'CA-002' },
    { id: uuid(), nome: 'Gloss Labial Transparente 5ml',     codigo_barras: '7891234560019', preco_venda: 18.90, preco_custo:  6.00, estoque: 40, categoria_id: 2, imagem_url: null, codigo_extra: 'MK-008' },
    { id: uuid(), nome: 'Ampola Nutritiva Capilar 15ml',     codigo_barras: '7891234560020', preco_venda: 12.90, preco_custo:  4.00, estoque: 60, categoria_id: 5, imagem_url: null, codigo_extra: 'CA-003' }
  ].map(p => ({ ...p, criado_em: diasAtras(90), atualizado_em: diasAtras(5) }));

  /* Clientes */
  const _clientes = [
    { id: uuid(), nome: 'Mariana Costa',       cpf: '123.456.789-00', telefone: '(11) 99999-1111', email: 'mariana@email.com', criado_em: diasAtras(45) },
    { id: uuid(), nome: 'Fernanda Alves',       cpf: '234.567.890-11', telefone: '(11) 98888-2222', email: 'fernanda@email.com', criado_em: diasAtras(30) },
    { id: uuid(), nome: 'Patrícia Mendes',      cpf: '345.678.901-22', telefone: '(11) 97777-3333', email: null,                  criado_em: diasAtras(20) },
    { id: uuid(), nome: 'Roberto Silva',        cpf: '456.789.012-33', telefone: '(11) 96666-4444', email: 'roberto@email.com',  criado_em: diasAtras(15) },
    { id: uuid(), nome: 'Juliana Rodrigues',    cpf: '567.890.123-44', telefone: '(11) 95555-5555', email: null,                  criado_em: diasAtras(10) }
  ];

  /* Configurações */
  const _configuracoes = [
    { chave: 'alerta_estoque_baixo', valor: '5'           },
    { chave: 'nome_loja',            valor: 'KosmoSystem Demo' }
  ];

  /* Vendas + Itens (gerados dinamicamente) */
  const _vendas     = [];
  const _itens_venda = [];

  /* Gera 35 vendas nos últimos 7 dias */
  (function gerarVendas() {
    const horarios  = ['09:15', '10:32', '11:48', '13:05', '14:22', '15:38', '16:55', '17:11'];
    const formaIds  = [1, 2, 3, 4]; // IDs de formas ativas
    const formaMap  = { 1: 'Dinheiro', 2: 'PIX', 3: 'Cartão de Crédito', 4: 'Cartão de Débito' };
    const vendedores = [
      { id: ID_ADMIN,    nome: 'Ana Lima (Admin)'  },
      { id: ID_VENDEDOR, nome: 'Carlos Souza'       }
    ];

    let totalVendas = 0;
    for (let dia = 6; dia >= 0; dia--) {
      const qtdNoDia = dia === 0 ? 4 : Math.floor(Math.random() * 5) + 3;
      for (let v = 0; v < qtdNoDia; v++) {
        const hora     = horarios[v % horarios.length];
        const vendedor = vendedores[v % 2];
        const cliente  = Math.random() > 0.4 ? _clientes[v % _clientes.length] : null;
        const formaId  = formaIds[totalVendas % formaIds.length];
        const temDesc  = totalVendas % 5 === 0;

        /* Sorteia 1-3 itens */
        const qtdItens = Math.floor(Math.random() * 3) + 1;
        const prodsSorteados = [..._produtos]
          .sort(() => 0.5 - Math.random())
          .slice(0, qtdItens);

        const ventaId = uuid();
        let subtotal  = 0;

        prodsSorteados.forEach(prod => {
          const qtd   = Math.floor(Math.random() * 3) + 1;
          const sub   = prod.preco_venda * qtd;
          subtotal   += sub;
          _itens_venda.push({
            id:                   uuid(),
            venda_id:             ventaId,
            produto_id:           prod.id,
            produto_nome:         prod.nome,
            quantidade:           qtd,
            preco_unitario:       prod.preco_venda,
            preco_custo_unitario: prod.preco_custo,
            subtotal:             sub
          });
        });

        const desconto = temDesc ? parseFloat((subtotal * 0.05).toFixed(2)) : 0;
        const total    = parseFloat((subtotal - desconto).toFixed(2));

        _vendas.push({
          id:                   ventaId,
          vendedor_id:          vendedor.id,
          vendedor_nome:        vendedor.nome,
          cliente_id:           cliente?.id ?? null,
          forma_pagamento_id:   formaId,
          forma_pagamento_nome: formaMap[formaId],
          desconto,
          tipo_desconto:        'fixo',
          subtotal:             parseFloat(subtotal.toFixed(2)),
          total,
          observacao:           null,
          criado_em:            diasAtras(dia, hora + ':00')
        });

        totalVendas++;
      }
    }
  })();

  /* ── Armazena tudo em objeto mutável ────────────────────── */
  const STORE = {
    profiles:         _profiles,
    formas_pagamento: _formas_pagamento,
    categorias:       _categorias,
    produtos:         _produtos,
    clientes:         _clientes,
    vendas:           _vendas,
    itens_venda:      _itens_venda,
    configuracoes:    _configuracoes
  };

  /* ══════════════════════════════════════════════════════════
     MOCK QUERY BUILDER
     ══════════════════════════════════════════════════════════ */

  /**
   * Parseia o filtro .or() do Supabase.
   * Formato: "coluna.operador.valor,coluna.operador.valor"
   */
  function matchOr(str, row) {
    return str.split(',').some(part => {
      const d1  = part.indexOf('.');
      const col = part.substring(0, d1);
      const rest = part.substring(d1 + 1);
      const d2  = rest.indexOf('.');
      const op  = rest.substring(0, d2);
      const val = rest.substring(d2 + 1).replace(/%/g, '').toLowerCase();
      const cell = String(row[col] ?? '').toLowerCase();
      if (op === 'ilike') return cell.includes(val);
      if (op === 'eq')    return cell === val;
      return false;
    });
  }

  /**
   * Injeta relações 1:1 nos registros (FK → tabela pai).
   * Exemplo: formas_pagamento(nome) → row.formas_pagamento = { nome: '...' }
   */
  function injetarRelacoes(row, selectStr, store) {
    const resultado = { ...row };

    /* Padrão: nomeTabela(campos) */
    const re = /(\w+)\(([^)]+)\)/g;
    let m;
    while ((m = re.exec(selectStr)) !== null) {
      const tabela = m[1];
      const campos = m[2].split(',').map(s => s.trim());

      /* Mapa de chave estrangeira por tabela */
      const fkMap = {
        formas_pagamento: 'forma_pagamento_id',
        categorias:       'categoria_id',
        profiles:         'vendedor_id',
        clientes:         'cliente_id'
      };
      const fk = fkMap[tabela];

      if (fk && row[fk] != null && store[tabela]) {
        const rel = store[tabela].find(r => String(r.id) === String(row[fk]));
        if (rel) {
          if (campos[0] === '*') {
            resultado[tabela] = { ...rel };
          } else {
            resultado[tabela] = {};
            campos.forEach(c => { resultado[tabela][c] = rel[c]; });
          }
        } else {
          resultado[tabela] = null;
        }
      }
    }

    /* Relação 1:N — itens_venda dentro de vendas */
    if (selectStr.includes('itens_venda') && row.id) {
      resultado.itens_venda = store.itens_venda.filter(i => i.venda_id === row.id);
    }

    return resultado;
  }

  class MockQuery {
    constructor(tabela, store) {
      this._tabela     = tabela;
      this._store      = store;
      this._filtros    = [];
      this._ordem      = null;
      this._limite     = null;
      this._unico      = false;
      this._op         = null;   // 'insert' | 'update' | 'delete' | 'upsert'
      this._opData     = null;
      this._selectStr  = '*';
      this._upsertOpts = null;
    }

    select(str = '*')  { this._selectStr = str; return this; }
    single()           { this._unico = true;  return this; }
    limit(n)           { this._limite = n;    return this; }

    order(col, opts = {}) {
      this._ordem = { col, asc: opts.ascending !== false };
      return this;
    }

    eq(col, val)  { this._filtros.push(r => String(r[col])  === String(val));  return this; }
    neq(col, val) { this._filtros.push(r => String(r[col])  !== String(val));  return this; }
    gte(col, val) { this._filtros.push(r => r[col] >= val);                    return this; }
    lte(col, val) { this._filtros.push(r => r[col] <= val);                    return this; }
    gt(col, val)  { this._filtros.push(r => r[col] > val);                     return this; }
    lt(col, val)  { this._filtros.push(r => r[col] < val);                     return this; }
    or(str)       { this._filtros.push(r => matchOr(str, r));                  return this; }

    insert(data) {
      this._op     = 'insert';
      this._opData = Array.isArray(data) ? data : [data];
      return this;
    }
    update(data) {
      this._op     = 'update';
      this._opData = data;
      return this;
    }
    delete() {
      this._op = 'delete';
      return this;
    }
    upsert(data, opts) {
      this._op        = 'upsert';
      this._opData    = Array.isArray(data) ? data : [data];
      this._upsertOpts = opts;
      return this;
    }

    /* Aplica os filtros acumulados sobre um array */
    _filtrar(arr) {
      return arr.filter(r => this._filtros.every(fn => fn(r)));
    }

    /* Torna a instância "thenable" (compatível com await) */
    then(resolve) {
      try {
        /* Garante que a tabela existe no store */
        if (!this._store[this._tabela]) this._store[this._tabela] = [];
        const tabela = this._store[this._tabela];

        /* ── INSERT ── */
        if (this._op === 'insert') {
          const inseridos = this._opData.map(row => {
            const novo = {
              criado_em:    new Date().toISOString(),
              atualizado_em: new Date().toISOString(),
              ...row,
              id: row.id ?? uuid()
            };
            tabela.push(novo);
            return injetarRelacoes(novo, this._selectStr, this._store);
          });
          const data = this._unico ? (inseridos[0] ?? null) : inseridos;
          return resolve({ data, error: null });
        }

        /* ── UPDATE ── */
        if (this._op === 'update') {
          const alvos = this._filtrar(tabela);
          alvos.forEach(r => Object.assign(r, this._opData, { atualizado_em: new Date().toISOString() }));
          return resolve({ data: null, error: null });
        }

        /* ── DELETE ── */
        if (this._op === 'delete') {
          const ids = this._filtrar(tabela).map(r => r.id);
          this._store[this._tabela] = tabela.filter(r => !ids.includes(r.id));
          return resolve({ data: null, error: null });
        }

        /* ── UPSERT ── */
        if (this._op === 'upsert') {
          const chave = this._upsertOpts?.onConflict ?? 'id';
          this._opData.forEach(novo => {
            const idx = tabela.findIndex(r => String(r[chave]) === String(novo[chave]));
            if (idx >= 0) {
              Object.assign(tabela[idx], novo);
            } else {
              tabela.push({ id: uuid(), criado_em: new Date().toISOString(), ...novo });
            }
          });
          return resolve({ data: null, error: null });
        }

        /* ── SELECT ── */
        let resultado = this._filtrar([...tabela]);

        /* Ordenação */
        if (this._ordem) {
          const { col, asc } = this._ordem;
          resultado.sort((a, b) => {
            const av = String(a[col] ?? '');
            const bv = String(b[col] ?? '');
            return asc
              ? av.localeCompare(bv, 'pt-BR', { numeric: true })
              : bv.localeCompare(av, 'pt-BR', { numeric: true });
          });
        }

        /* Limite */
        if (this._limite) resultado = resultado.slice(0, this._limite);

        /* Injetar relações (joins) */
        resultado = resultado.map(r => injetarRelacoes(r, this._selectStr, this._store));

        const data = this._unico ? (resultado[0] ?? null) : resultado;
        resolve({ data, error: null });

      } catch (err) {
        resolve({ data: null, error: { message: err.message } });
      }
    }

    /* Implementa catch para o Promise API */
    catch(reject) { return Promise.resolve(this).catch(reject); }
  }

  /* ══════════════════════════════════════════════════════════
     MOCK DB (substitui window.db)
     ══════════════════════════════════════════════════════════ */

  const MockDB = {
    /* Query builder principal */
    from(tabela) {
      return new MockQuery(tabela, STORE);
    },

    /* RPC — subtrair_estoque com controle local */
    rpc(funcao, params) {
      return {
        then(resolve) {
          if (funcao === 'subtrair_estoque') {
            const prod = STORE.produtos.find(p => p.id === params.p_produto_id);
            if (!prod) return resolve({ data: null, error: { message: 'Produto não encontrado' } });
            if (prod.estoque < params.p_quantidade)
              return resolve({ data: null, error: { message: 'Estoque insuficiente' } });
            prod.estoque -= params.p_quantidade;
          }
          resolve({ data: null, error: null });
        },
        catch(reject) { return Promise.resolve(this).catch(reject); }
      };
    },

    /* Storage — apenas retorna URLs fictícias, sem upload real */
    storage: {
      from() {
        return {
          upload:       async () => ({ error: null }),
          getPublicUrl: (path) => ({ data: { publicUrl: '' } })
        };
      }
    },

    /* Auth mock */
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: { id: ID_ATIVO, email: DEMO_PERFIL === 'admin' ? 'admin@demo.com' : 'vendedor@demo.com' }
          }
        },
        error: null
      }),

      signInWithPassword: async ({ email, password }) => {
        /* Aceita qualquer credencial em modo demo */
        const perfil = STORE.profiles.find(p => p.id === ID_ATIVO);
        return { data: { user: { id: ID_ATIVO } }, error: null };
      },

      signOut: async () => {
        sessionStorage.removeItem('kosmo_demo');
        window.location.href = 'index.html';
        return { error: null };
      },

      signUp: async () => ({ data: null, error: null }),

      admin: {
        createUser: async ({ email, password, user_metadata }) => {
          /* Simula criação de usuário */
          const novo = {
            id:        uuid(),
            nome:      user_metadata?.nome ?? email,
            perfil:    user_metadata?.perfil ?? 'vendedor',
            criado_em: new Date().toISOString()
          };
          STORE.profiles.push(novo);
          return { data: { user: novo }, error: null };
        }
      }
    }
  };

  /* ── Substitui o cliente Supabase real pelo mock ─────── */
  window.db = MockDB;

  /* ── Marca visualmente o modo demo ──────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.innerHTML = `
      🎭 <strong>Modo Demo</strong> —
      ${DEMO_PERFIL === 'admin' ? '👑 Admin Demo' : '🏪 Vendedor Demo'} &nbsp;|&nbsp;
      Dados fictícios, sem conexão real ao banco
      <button onclick="sessionStorage.removeItem('kosmo_demo');window.location.href='index.html'"
              style="margin-left:12px;background:#fff;color:#856404;border:none;
                     border-radius:4px;padding:3px 10px;cursor:pointer;font-size:.75rem;font-weight:600">
        Sair do Demo
      </button>`;
    Object.assign(banner.style, {
      position:   'fixed',
      top:        '0',
      left:       '0',
      right:      '0',
      zIndex:     '9998',
      background: '#fff3cd',
      color:      '#856404',
      padding:    '6px 16px',
      fontSize:   '.8rem',
      textAlign:  'center',
      borderBottom: '1px solid #ffc107',
      boxShadow:  '0 2px 4px rgba(0,0,0,.1)'
    });
    document.body.prepend(banner);

    /* Empurra o header para baixo do banner */
    const header = document.querySelector('.header');
    if (header) header.style.top = banner.offsetHeight + 'px';
  });

})(); /* fim da IIFE */
