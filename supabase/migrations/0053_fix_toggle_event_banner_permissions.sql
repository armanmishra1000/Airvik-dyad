CREATE OR REPLACE FUNCTION public.toggle_event_banner(
    target_event_id UUID,
    new_status BOOLEAN
)
RETURNS SETOF public.event_banners
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    current_user_id UUID;
    has_permission BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    -- Check for authentication
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Access denied: Unauthenticated user';
    END IF;

    -- Verify permissions
    -- Note: explicit search_path ensures we find user_has_permission correctly
    has_permission := public.user_has_permission(current_user_id, 'update:setting');

    IF NOT has_permission THEN
        RAISE EXCEPTION 'Access denied: User % lacks update:setting permission', current_user_id;
    END IF;

    -- If we are enabling a banner, we must first disable all others
    IF new_status = true THEN
        UPDATE public.event_banners
        SET is_active = false
        WHERE id != target_event_id;
    END IF;

    -- Update the target banner
    RETURN QUERY
    UPDATE public.event_banners
    SET 
        is_active = new_status,
        updated_at = now(),
        updated_by = current_user_id
    WHERE id = target_event_id
    RETURNING *;
END;
$$;
