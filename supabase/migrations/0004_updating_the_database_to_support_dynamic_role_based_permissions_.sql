-- Add a 'permissions' column to the 'roles' table to store an array of text values.
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS permissions TEXT[];

-- Set default permissions for the 'Hotel Manager' role.
UPDATE public.roles
SET permissions = ARRAY[
  'create:guest', 'read:guest', 'update:guest', 'delete:guest',
  'create:reservation', 'read:reservation', 'update:reservation', 'delete:reservation',
  'create:room', 'read:room', 'update:room', 'delete:room',
  'create:room_type', 'read:room_type', 'update:room_type', 'delete:room_type',
  'create:rate_plan', 'read:rate_plan', 'update:rate_plan', 'delete:rate_plan',
  'read:report',
  'update:setting'
]
WHERE name = 'Hotel Manager';

-- Set default permissions for the 'Receptionist' role.
UPDATE public.roles
SET permissions = ARRAY[
  'create:guest', 'read:guest', 'update:guest',
  'create:reservation', 'read:reservation', 'update:reservation',
  'read:room', 'update:room', 'read:room_type', 'read:rate_plan'
]
WHERE name = 'Receptionist';

-- Set default permissions for the 'Housekeeper' role.
UPDATE public.roles
SET permissions = ARRAY['read:room', 'update:room']
WHERE name = 'Housekeeper';