-- ============================================================
-- FIX: handle_new_user trigger for omni1os-site Supabase project
-- Run this in: https://supabase.com/dashboard → SQL Editor
-- Project: njcellvgixkmugjozsex
-- ============================================================
--
-- PROBLEM: The `profiles.school_id` column is NOT NULL with a FK to schools.id.
-- When inviteUserByEmail or createUser is called, Supabase inserts into auth.users,
-- which fires the handle_new_user trigger. That trigger tries to INSERT into
-- profiles, but either:
--   a) It doesn't set school_id (violating NOT NULL), or
--   b) It sets a school_id that doesn't exist in schools (violating the FK).
--
-- FIX: Make school_id nullable so the trigger can create profiles without a school,
-- and update the trigger to properly read school_id from user metadata.
-- ============================================================

-- Step 1: Make school_id nullable (so profiles can exist without a school temporarily)
ALTER TABLE profiles ALTER COLUMN school_id DROP NOT NULL;

-- Step 2: Update the trigger function to read school_id from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, is_active, email, school_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    true,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'school_id', '')::uuid
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role      = COALESCE(EXCLUDED.role, profiles.role),
    email     = COALESCE(EXCLUDED.email, profiles.email),
    school_id = COALESCE(EXCLUDED.school_id, profiles.school_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
