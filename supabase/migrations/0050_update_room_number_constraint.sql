-- Scope room-number uniqueness to each room type so the same
-- physical number can exist across different categories.
begin;

alter table public.rooms
  drop constraint if exists rooms_room_number_key;

alter table public.rooms
  add constraint rooms_room_type_id_room_number_key
  unique (room_type_id, room_number);

comment on constraint rooms_room_type_id_room_number_key on public.rooms
  is 'Ensure room numbers are unique within a room type, but reusable across types.';

commit;
