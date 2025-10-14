-- Drop deprecated price column from rate_plans

alter table if exists public.rate_plans
  drop column if exists price;
