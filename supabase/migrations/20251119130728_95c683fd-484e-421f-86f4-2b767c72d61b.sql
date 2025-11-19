-- Update handle_new_user function to support teacher role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from user metadata, default to student
  user_role := COALESCE(
    (new.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );
  
  -- Map 'teacher' to 'admin' role if needed
  IF user_role::text = 'teacher' THEN
    user_role := 'admin'::app_role;
  END IF;
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, display_name, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar', '👤')
  );
  
  -- Insert user role based on registration selection
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  -- Insert initial game progress
  INSERT INTO public.game_progress (user_id)
  VALUES (new.id);
  
  -- Insert initial leaderboard entry
  INSERT INTO public.leaderboard (user_id, points)
  VALUES (new.id, 0);
  
  RETURN new;
END;
$function$;