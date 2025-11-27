-- Seed the properties table with a default entry if it's empty.
-- This ensures the application has a property to work with on first run.
INSERT INTO public.properties (
    id,
    name,
    address,
    phone,
    email,
    logo_url,
    google_maps_url,
    timezone,
    currency,
    allow_same_day_turnover,
    show_partial_days,
    default_units_view,
    tax_enabled,
    tax_percentage
)
SELECT
    'a1b2c3d4-e5f6-7890-1234-567890abcdef', -- A fixed UUID for idempotency
    'Airvik',
    '123 Main Street, Anytown, USA',
    '555-123-4567',
    'contact@airvik.com',
    '/logo-placeholder.svg',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617023443543!2d-73.98784668459395!3d40.74844097932803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1620312953789!5m2!1sen!2sus',
    'America/New_York',
    'USD',
    true,
    true,
    'remaining',
    false,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM public.properties
);