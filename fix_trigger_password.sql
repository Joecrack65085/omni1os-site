ALTER TABLE profiles ALTER COLUMN must_change_password SET DEFAULT true;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $DO$
BEGIN
  INSERT INTO profiles (id, full_name, role, is_active, email, school_id, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    true,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'school_id', '')::uuid,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role      = COALESCE(EXCLUDED.role, profiles.role),
    email     = COALESCE(EXCLUDED.email, profiles.email),
    school_id = COALESCE(EXCLUDED.school_id, profiles.school_id);
  RETURN NEW;
END;
$DO$ LANGUAGE plpgsql SECURITY DEFINER;
