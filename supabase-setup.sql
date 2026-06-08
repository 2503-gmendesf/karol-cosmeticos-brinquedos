-- ============================================================
-- KosmoSystem — Schema do banco de dados
-- Execute no Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- -------------------------------------------------------------
-- 1. PERFIS DE USUÁRIO (estende auth.users)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome    TEXT NOT NULL,
  perfil  TEXT NOT NULL DEFAULT 'vendedor'
            CHECK (perfil IN ('admin', 'vendedor')),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: cria perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'perfil', 'vendedor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -------------------------------------------------------------
-- 2. FORMAS DE PAGAMENTO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS formas_pagamento (
  id    SERIAL PRIMARY KEY,
  nome  TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE
);

INSERT INTO formas_pagamento (nome, ativo) VALUES
  ('Dinheiro',          TRUE),
  ('PIX',               TRUE),
  ('Cartão de Crédito', TRUE),
  ('Cartão de Débito',  TRUE)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- 3. CATEGORIAS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id   SERIAL PRIMARY KEY,
  nome TEXT NOT NULL
);

-- -------------------------------------------------------------
-- 4. CLIENTES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       TEXT NOT NULL,
  cpf        TEXT,
  telefone   TEXT,
  email      TEXT,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf  ON clientes(cpf);

-- -------------------------------------------------------------
-- 5. PRODUTOS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          TEXT NOT NULL,
  codigo_barras TEXT,
  preco_venda   NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_custo   NUMERIC(10,2) DEFAULT 0,
  estoque       INTEGER NOT NULL DEFAULT 0,
  categoria_id  INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  imagem_url    TEXT,
  codigo_extra  TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_barras ON produtos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_produtos_nome   ON produtos(nome);

-- -------------------------------------------------------------
-- 6. VENDAS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendas (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vendedor_nome       TEXT,                            -- desnormalizado para histórico
  cliente_id          UUID REFERENCES clientes(id) ON DELETE SET NULL,
  forma_pagamento_id  INTEGER REFERENCES formas_pagamento(id) ON DELETE SET NULL,
  forma_pagamento_nome TEXT,                           -- desnormalizado
  desconto            NUMERIC(10,2) DEFAULT 0,
  tipo_desconto       TEXT DEFAULT 'fixo'
                        CHECK (tipo_desconto IN ('fixo','percentual')),
  subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
  total               NUMERIC(10,2) NOT NULL,
  observacao          TEXT,
  criado_em           TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 7. ITENS DA VENDA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens_venda (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id              UUID REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id            UUID REFERENCES produtos(id) ON DELETE SET NULL,
  produto_nome          TEXT NOT NULL,                 -- desnormalizado
  quantidade            INTEGER NOT NULL,
  preco_unitario        NUMERIC(10,2) NOT NULL,
  preco_custo_unitario  NUMERIC(10,2) DEFAULT 0,
  subtotal              NUMERIC(10,2) NOT NULL
);

-- -------------------------------------------------------------
-- 8. CONFIGURAÇÕES DO SISTEMA
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

INSERT INTO configuracoes (chave, valor) VALUES
  ('alerta_estoque_baixo', '5'),
  ('nome_loja',            'KosmoSystem')
ON CONFLICT (chave) DO NOTHING;

-- -------------------------------------------------------------
-- 9. RPC — Subtrair estoque com controle de concorrência
-- Evita race condition usando SELECT FOR UPDATE
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION subtrair_estoque(p_produto_id UUID, p_quantidade INTEGER)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  estoque_atual INTEGER;
BEGIN
  -- Bloqueia a linha enquanto processa
  SELECT estoque INTO estoque_atual
  FROM produtos
  WHERE id = p_produto_id
  FOR UPDATE;

  IF estoque_atual < p_quantidade THEN
    RAISE EXCEPTION 'Estoque insuficiente para o produto %', p_produto_id;
  END IF;

  UPDATE produtos
  SET estoque = estoque - p_quantidade,
      atualizado_em = NOW()
  WHERE id = p_produto_id;
END;
$$;

-- -------------------------------------------------------------
-- 10. RLS — Row Level Security
-- Usuário autenticado tem acesso total (ajuste conforme necessidade)
-- -------------------------------------------------------------
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias       ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda      ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes    ENABLE ROW LEVEL SECURITY;

-- Política: qualquer usuário autenticado pode ler e escrever
CREATE POLICY "acesso_autenticado" ON profiles         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON formas_pagamento FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON categorias       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON produtos         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON clientes         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON vendas           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON itens_venda      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON configuracoes    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- -------------------------------------------------------------
-- Bucket de imagens (criar manualmente no Supabase Dashboard)
-- Storage > New bucket > nome: "imagens-produtos" > Public: ON
-- -------------------------------------------------------------

-- -------------------------------------------------------------
-- 11. CRIAÇÃO DO ADMINISTRADOR OFICIAL (rodar uma única vez)
-- -------------------------------------------------------------
-- Passo 1: crie o usuário pelo Dashboard:
--   Supabase > Authentication > Users > Add user > "Create new user"
--   Preencha e-mail e senha do admin oficial e marque
--   "Auto Confirm User" para já vir confirmado.
--
-- Passo 2: promova esse usuário a administrador rodando o
--   comando abaixo (substitua o e-mail pelo que você cadastrou).
--   O trigger handle_new_user já criará a linha em "profiles"
--   automaticamente com perfil = 'vendedor'; este UPDATE só
--   ajusta o perfil para 'admin'.
-- -------------------------------------------------------------
UPDATE profiles
SET perfil = 'admin', nome = 'Administrador'
WHERE id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_ADMIN_AQUI@exemplo.com');
