-- ============================================================
-- Cria o bucket "site-images" no Supabase Storage
-- Execute este script UMA VEZ no Supabase SQL Editor
-- ============================================================

-- 1. Cria o bucket público
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880,  -- 5 MB por arquivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- 2. Permite leitura pública (qualquer um pode ver as imagens)
create policy "Imagens públicas — leitura"
  on storage.objects for select
  using ( bucket_id = 'site-images' );

-- 3. Permite upload/delete somente para usuários autenticados (admin logado)
create policy "Admin pode fazer upload"
  on storage.objects for insert
  with check (
    bucket_id = 'site-images'
    and auth.role() = 'authenticated'
  );

create policy "Admin pode substituir imagem"
  on storage.objects for update
  using (
    bucket_id = 'site-images'
    and auth.role() = 'authenticated'
  );

create policy "Admin pode deletar imagem"
  on storage.objects for delete
  using (
    bucket_id = 'site-images'
    and auth.role() = 'authenticated'
  );
