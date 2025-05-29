CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
);

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS trigger
language plpgsql
security definer set search_path = public
AS $$
BEGIN
  INSERT INTO users (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_auth_user();
