## What is a Rate Plan?
A rate plan is the price tag the system uses when it calculates how much a guest pays per night. Every reservation, whether created by staff or through the public website, points to one rate plan so the software knows the nightly amount, the minimum stay, and the cancellation note it should apply.

## Where does it show up today?
1. **Admin → Rates page (/admin/rates):** Managers create, edit, or delete plans in this table. The action button uses the "Add Rate Plan" dialog. Removing this page would leave no user interface to change pricing.
2. **Admin sidebar:** The left navigation lists “Rate Plans.” Hiding that link only removes the shortcut; it does not stop other screens from needing a plan.
3. **Admin reservation screens:**
   - Creating a reservation requires at least one plan so the form can prefill pricing. If no plan exists, the form shows the error “No rate plan configured yet.”
   - Editing reservations blocks room changes unless a plan is assigned (“Assign a rate plan before selecting rooms”).
4. **Activity log filters:** The Admin Activity view includes a “Rate Plans” category, so plan changes appear in the audit trail.
5. **Public booking flow (/book/review and /book/confirmation):** Guests see prices that come from the selected plan. If the site cannot find any plan, it falls back to a “Contact us to book” message instead of allowing self-service checkout.

## What depends on it behind the scenes?
1. **Database:**
   - The `supabase/public.rate_plans` table stores name, price, and rules, and row-level security policies allow managers to manage them while receptionists can only read.
   - The `reservations.rate_plan_id` column references that table. Existing bookings keep that reference forever, so deleting a plan that is still linked will fail.
2. **Server logic:** The `create_reservations_with_total` stored procedure (Supabase RPC) accepts a `p_rate_plan_id` value for every new booking. It loads that price first; if the price is zero it falls back to the room-type price and finally to a hard-coded ₹3,000 default. The procedure still expects the plan ID even when it ends up using the fallback, so passing “no plan” is not supported.
3. **API layer (`src/lib/api/index.ts`):** Helper functions such as `addRatePlan`, `updateRatePlan`, and `deleteRatePlan` call Supabase. Reservation mutations always include `rate_plan_id`, so removing the field would require code changes across the hooks, RPC call, and database.
4. **Pricing utilities (`src/lib/pricing-calculator.ts`):** Front-end totals are computed with this priority: room type price → rate plan price → ₹3,000 fallback. This explains why screens still render prices even if the record’s price is empty, but they still need the plan reference for validation.

## What happens if we hide or disable it?
| Action | Short-term effect | Risk |
| --- | --- | --- |
| Remove the sidebar link only | Users cannot easily reach the rate screen, but reservations and website still function because the data remains | Low |
| Hide the `/admin/rates` page route | Staff lose the ability to change pricing; they can still create bookings as long as the existing plans stay in the database | Medium (operational) |
| Delete every plan record or block `rate_plans` reads | Reservation creation (admin + website) fails because the RPC cannot find a `p_rate_plan_id`; admin edit forms show blocking errors | High |
| Remove the `rate_plan_id` field from reservations | Requires code + database migrations. Existing reservations would violate foreign keys, and the RPC plus pricing logic would need to be rewritten | Very High |

## Safe ways to “pause” the feature temporarily
1. **Keep one hidden “Standard Rate”:** Leave a single plan in the database (price can match your default rate) and simply avoid exposing extra plans in the UI. Everything keeps working because the ID still exists.
2. **Update permissions instead of code:** Adjust manager/receptionist roles so only selected admins can see the Rates page. This stops day-to-day editing without touching the code.
3. **Inform staff to ignore the menu item:** If you just need to stop people from changing rates for a short period, communicate the policy and optionally remove permissions to add/delete plans. No engineering work is required.
4. **UI-only hide:** You can comment out or feature-flag the `/admin/rates` navigation link, but make sure at least one plan remains in the database, otherwise the reservation flows will immediately fail.

## Recommended checklist before hiding anything
1. Confirm there is at least one active plan (for example, “Standard Rate”).
2. Ensure no upcoming reservations rely on a plan you intend to delete; otherwise deletion will be blocked.
3. Decide how staff should handle price changes while the screen is hidden (e.g., fixed price policy, manual approvals, etc.).
4. After hiding the UI, test both admin reservation creation and the public booking flow to verify they still compute prices and complete successfully.
5. When you want the feature back, simply restore the navigation link or permissions; no data migration is needed if you kept the underlying plan record.

## Bottom line
The rate plan is a foundational record that the rest of the system references whenever it needs a nightly price. You can safely hide the management screens or restrict who can edit plans, but you should not delete the underlying records unless you also change every reservation workflow and the Supabase stored procedure. The safest temporary pause is to keep one plan in place, hide the UI entry points, and communicate the policy to staff.
