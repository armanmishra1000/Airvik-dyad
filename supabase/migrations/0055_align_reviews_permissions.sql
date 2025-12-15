-- Align testimonial policies with granular review permissions
drop policy if exists "Staff can manage testimonials" on public.testimonials;

create policy "Staff can read reviews" on public.testimonials
    for select
    to authenticated
    using (public.user_has_permission(auth.uid(), 'read:review'));

create policy "Staff can create reviews" on public.testimonials
    for insert
    to authenticated
    with check (public.user_has_permission(auth.uid(), 'create:review'));

create policy "Staff can update reviews" on public.testimonials
    for update
    to authenticated
    using (public.user_has_permission(auth.uid(), 'update:review'))
    with check (public.user_has_permission(auth.uid(), 'update:review'));

create policy "Staff can delete reviews" on public.testimonials
    for delete
    to authenticated
    using (public.user_has_permission(auth.uid(), 'delete:review'));
