-- Migration: Allow Public Booking
-- Purpose: Enable anonymous users to book rooms from the public website
-- 
-- This migration adds RLS policies to allow anonymous (not logged in) users to:
-- 1. READ: rate_plans, rooms, properties (for browsing and availability checks)
-- 2. INSERT: guests and reservations (for creating bookings)
--
-- Security: Anonymous users can only INSERT their own data, not view other bookings

-- ============================================================================
-- SECTION 1: Allow Public READ Access (for browsing/booking flow)
-- ============================================================================

-- Rate Plans: Public users need to see pricing information
DROP POLICY IF EXISTS "Allow public read access to rate plans" ON public.rate_plans;
CREATE POLICY "Allow public read access to rate plans"
ON public.rate_plans
FOR SELECT
TO anon, authenticated
USING (true);

-- Rooms: Public users need to check room availability
DROP POLICY IF EXISTS "Allow public read access to rooms" ON public.rooms;
CREATE POLICY "Allow public read access to rooms"
ON public.rooms
FOR SELECT
TO anon, authenticated
USING (true);

-- Properties: Public users need to see property details
DROP POLICY IF EXISTS "Allow public read access to properties" ON public.properties;
CREATE POLICY "Allow public read access to properties"
ON public.properties
FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================================
-- SECTION 2: Allow Public INSERT Access (for creating bookings)
-- ============================================================================

-- Guests: Allow anonymous users to create guest records when booking
-- Note: They can only INSERT, not SELECT/UPDATE/DELETE other guests
DROP POLICY IF EXISTS "Allow public insert for guests" ON public.guests;
CREATE POLICY "Allow public insert for guests"
ON public.guests
FOR INSERT
TO anon
WITH CHECK (true);

-- Reservations: Allow anonymous users to create reservations
-- Note: They can only INSERT, not SELECT/UPDATE/DELETE other reservations
DROP POLICY IF EXISTS "Allow public insert for reservations" ON public.reservations;
CREATE POLICY "Allow public insert for reservations"
ON public.reservations
FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Existing authenticated user policies remain unchanged
-- 2. Anonymous users CANNOT view other people's bookings or guest data
-- 3. Admin/staff still require proper permissions for management operations
-- 4. This only affects the public booking flow on the website
