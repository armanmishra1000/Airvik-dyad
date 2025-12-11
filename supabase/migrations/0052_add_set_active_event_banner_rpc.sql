-- Function to toggle event banner active status
-- If enabling: deactivates all other banners first, then activates the target
-- If disabling: simply deactivates the target
CREATE OR REPLACE FUNCTION public.toggle_event_banner(
    target_event_id UUID,
    new_status BOOLEAN
)
RETURNS SETOF public.event_banners
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check permissions (using existing helper)
    IF NOT public.user_has_permission(auth.uid(), 'update:setting') THEN
        RAISE EXCEPTION 'Access denied';
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
        updated_by = auth.uid()
    WHERE id = target_event_id
    RETURNING *;
END;
$$;
