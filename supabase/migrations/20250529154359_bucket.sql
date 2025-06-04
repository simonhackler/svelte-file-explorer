DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'folder') THEN
        INSERT INTO storage.buckets
          (id, name, public)
        VALUES
          ('folders', 'folders', false);
    END IF;
END
$$;

create policy "Allow insert on user folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'folders' and
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Allow delete on user folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'folders' and
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Allow select on user folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'folders' and
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Select own files"
on storage.objects for select
to authenticated
using ( (select auth.uid()) = owner_id::uuid );

create policy "Delete own files"
on storage.objects for delete
to authenticated
using ( (select auth.uid()) = owner_id::uuid );
