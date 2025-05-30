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

create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'folders' and
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Individual user Access"
on storage.objects for select
to authenticated
using ( (select auth.uid()) = owner_id::uuid );
