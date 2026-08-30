-- Bucket "fotos": leitura publica, escrita apenas na pasta do proprio usuario
drop policy if exists fotos_leitura_publica on storage.objects;
create policy fotos_leitura_publica on storage.objects
for select using (bucket_id = 'fotos');

drop policy if exists fotos_insert_pasta_do_usuario on storage.objects;
create policy fotos_insert_pasta_do_usuario on storage.objects
for insert to authenticated
with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists fotos_update_pasta_do_usuario on storage.objects;
create policy fotos_update_pasta_do_usuario on storage.objects
for update to authenticated
using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists fotos_delete_pasta_do_usuario on storage.objects;
create policy fotos_delete_pasta_do_usuario on storage.objects
for delete to authenticated
using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
