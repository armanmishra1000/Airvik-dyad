-- Create a function to atomically upsert a room type and its amenities
CREATE OR REPLACE FUNCTION upsert_room_type_with_amenities(
    p_id uuid,
    p_name text,
    p_description text,
    p_max_occupancy integer,
    p_bed_types text[],
    p_photos text[],
    p_main_photo_url text,
    p_amenity_ids uuid[]
)
RETURNS json AS $$
DECLARE
    v_room_type_id uuid;
    result_room_type record;
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO public.room_types (name, description, max_occupancy, bed_types, photos, main_photo_url)
        VALUES (p_name, p_description, p_max_occupancy, p_bed_types, p_photos, p_main_photo_url)
        RETURNING id INTO v_room_type_id;
    ELSE
        UPDATE public.room_types
        SET
            name = p_name,
            description = p_description,
            max_occupancy = p_max_occupancy,
            bed_types = p_bed_types,
            photos = p_photos,
            main_photo_url = p_main_photo_url
        WHERE id = p_id
        RETURNING id INTO v_room_type_id;
    END IF;

    DELETE FROM public.room_type_amenities WHERE room_type_id = v_room_type_id;

    IF array_length(p_amenity_ids, 1) > 0 THEN
        INSERT INTO public.room_type_amenities (room_type_id, amenity_id)
        SELECT v_room_type_id, unnest(p_amenity_ids);
    END IF;

    SELECT rt.*, COALESCE(json_agg(rta.amenity_id) FILTER (WHERE rta.amenity_id IS NOT NULL), '[]') as amenities
    INTO result_room_type
    FROM public.room_types rt
    LEFT JOIN public.room_type_amenities rta ON rt.id = rta.room_type_id
    WHERE rt.id = v_room_type_id
    GROUP BY rt.id;

    RETURN row_to_json(result_room_type);
END;
$$ LANGUAGE plpgsql;

-- Update security policy for the join table to use the permission system
DROP POLICY IF EXISTS "Allow managers to manage room type amenities" ON public.room_type_amenities;
CREATE POLICY "Allow managers to manage room type amenities"
ON public.room_type_amenities
FOR ALL
TO authenticated
USING (public.user_has_permission(auth.uid(), 'update:room_type'))
WITH CHECK (public.user_has_permission(auth.uid(), 'update:room_type'));