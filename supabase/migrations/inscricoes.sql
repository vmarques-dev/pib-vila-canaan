-- Tabela de inscrições em eventos
create table if not exists inscricoes (
  id         uuid        primary key default gen_random_uuid(),
  evento_id  uuid        not null references eventos(id) on delete cascade,
  adorador_id uuid       references adoradores(id) on delete set null,
  nome       text        not null,
  email      text        not null,
  telefone   text,
  created_at timestamptz not null default now(),
  constraint inscricoes_evento_email_unique unique (evento_id, email)
);

alter table inscricoes enable row level security;

-- Qualquer pessoa pode se inscrever em um evento (incluindo visitantes anônimos)
create policy "Qualquer pessoa pode se inscrever" on inscricoes
  for insert with check (true);

-- Adoradores autenticados podem consultar suas próprias inscrições
create policy "Adoradores podem ver suas inscricoes" on inscricoes
  for select using (
    adorador_id in (
      select id from adoradores where user_id = auth.uid()
    )
  );

-- Administradores podem consultar todas as inscrições
create policy "Admins podem ver todas as inscricoes" on inscricoes
  for select using (
    exists (
      select 1 from usuarios_admin
      where user_id = auth.uid() and ativo = true
    )
  );

-- Administradores podem excluir inscrições
create policy "Admins podem excluir inscricoes" on inscricoes
  for delete using (
    exists (
      select 1 from usuarios_admin
      where user_id = auth.uid() and ativo = true
    )
  );
