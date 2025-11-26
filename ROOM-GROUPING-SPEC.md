## Booking Room Grouping and Multi-Selection – Design Spec

This document describes, in simple language, how the new room grouping and multi-selection behaviour works on the booking flow.

It focuses on a basic, working prototype that is easy to understand and extend later.

---

## 1. Before – How the booking flow worked

- The booking page let a guest pick:
  - Check-in and check-out dates
  - Number of rooms
  - Number of adults
  - Number of children
- After the user clicked **Search Availability**, the system:
  - Checked Supabase for room types that were free for the selected date range.
  - Returned a flat list of room types.
- Each card showed one room type with:
  - Photo, name, short description
  - Guest capacity for that single room
  - Amenities and price per night
- Limitations:
  - It did not show **how many rooms** of each type were still free.
  - It was not clear how to combine different room types to cover a large total guest count.
  - The user could not simply tick multiple room cards to pick several rooms at once.

---

## 2. After – What we want the user to experience

When the user picks dates, rooms, adults and children, and clicks **Search Availability**:

1. The system still checks Supabase for rooms that are free for the whole date range.
2. Instead of just returning a flat list of room types, the system now:
   - Counts **how many individual rooms** of each room type are available.
   - Groups the result by room type and calculates total capacity per type.
3. The UI shows **all matching room types**, with a clear line like:
   - `3 rooms available for your dates`
4. Inside each room card, the user now sees:
   - The existing content (photo, name, description, amenities, price, capacity).
   - A **checkbox** that lets them select that room type.
   - A small **quantity selector** (for example a dropdown) to choose how many rooms of that type they want, up to the available count.
5. The user can mix and match room types to cover their group, for example:
   - 8 + 2 guests
   - 4 + 4 + 2 guests
   - 2 + 2 + 2 + 2 + 2 guests
6. A small summary section shows:
   - How many rooms have been selected.
   - The total guest capacity of the selected rooms.
   - How this compares with the total number of guests entered in the search.
7. When the user clicks **Continue** or **Proceed**, the selected room type IDs and their quantities are passed into the rest of the booking flow.

The goal is to keep the logic simple and transparent so that users understand what they are choosing.

---

## 3. Grouping system – how it works conceptually

### 3.1 Inputs

From the booking widget we have:

- `check-in` and `check-out` dates.
- A list of room occupancies, one entry per room the guest wants, each with:
  - number of adults
  - number of children

From this we can compute:

- `totalGuests = totalAdults + totalChildren` across all rooms.

### 3.2 Availability query

On the server side we do one clear task:

1. Ask Supabase for all **individual rooms** that are free for every night between `check-in` and `check-out`.
2. For each room we also fetch its room type information (name, capacity, price, photos, etc.).

We do not change the database schema. We only extend the query to return enough data to:

- Know which room type each room belongs to.
- Know how many guests a room can hold.

### 3.3 Grouping by room type

In TypeScript we take the list of free rooms and group them by `room_type_id`:

- For each `room_type_id` we count how many rooms of this type are free.
- For each group we also keep one copy of the shared room type information.

The result is a list of **room type availability objects**, each with:

- Room type details (name, description, amenities, max guests per room, price, photo).
- `totalAvailable` = how many rooms of this type are currently free.
- `maxGuestsTotal` = `totalAvailable * maxGuestsPerRoom`.

We also keep `totalGuests` from the search so we can tell how much of the group a particular combination could cover.

This logic is intentionally simple and runs in memory, which makes it easier to follow and test.

---

## 4. UI design – layout and interactions

### 4.1 Rooms result list

The booking results section shows cards in a responsive grid:

- Mobile: 1 column.
- Tablet: 2 columns.
- Desktop: 2–3 columns depending on space.

Each card reuses the current design and adds a small selection area.

### 4.2 Card content

Each room type card contains:

- A photo at the top.
- Room type name and a short description.
- Icons for key amenities.
- A line such as `Up to 4 guests` for one room.
- A price per night.
- A new line showing stock: `3 rooms available for your dates`.
- A new selection area:
  - A checkbox labelled clearly, for example: `Select this room type`.
  - When the checkbox is ticked, a small quantity control appears:
    - For example, a dropdown with options `1` to `totalAvailable`.

### 4.3 Selection behaviour

- If the user unticks the checkbox, the selected quantity for that room type becomes `0`.
- The parent component keeps the list of `(roomTypeId, quantity)` pairs.
- The total selected rooms and total capacity are calculated from this list.

This matches common “selectable card with checkbox” patterns used in design systems and booking sites.

---

## 5. How the functionality works step by step

1. **User fills the booking widget** and clicks **Search Availability**.
2. The booking page calls a new grouped availability helper, which:
   - Reads the dates and room occupancies.
   - Runs the Supabase availability query.
   - Groups rooms by room type and returns the list with counts.
3. The booking page stores this result and renders the **rooms result list**.
4. The user ticks checkboxes on different cards and chooses quantities.
5. As the user changes selections, the booking page:
   - Updates its selection state.
   - Recalculates total selected rooms and total capacity.
   - Shows a short text summary, for example:
     - `Selected 3 rooms, total capacity 10 guests for 10 guests in your search.`
6. When the user is satisfied and clicks **Continue**:
   - The booking flow passes the selected room type IDs, quantities, dates and total guest info to the next screen.
   - Later steps (such as review and payment) can show a breakdown like `2 × Deluxe Double, 1 × Family Suite`.

For this first version we only show a clear warning if the selected capacity is less than the total guests, instead of blocking the user.

---

## 6. Safety and simplicity decisions

- We do **not** change the database schema.
- We keep all critical availability checks in a single, well-typed helper.
- We add only small, local changes to the UI:
  - The booking widget keeps the same inputs.
  - Room cards gain a checkbox and quantity selector.
  - A compact summary bar shows what the user has chosen.
- TypeScript interfaces clearly describe the data shapes and we avoid using `any`.
- Lint and build checks are part of the workflow so that new code stays consistent with the existing project.

This keeps the implementation straightforward while giving users a much clearer way to choose multiple rooms and understand how their group fits into the hotel’s available rooms.

---

## 7. Over-capacity single-room search fallback (new behaviour)

This section describes the extra behaviour added when the user searches for **one room** and the total guests are **more than any single room can hold**.

### 7.1 When this fallback is used

On the main booking page:

- The user selects dates, **1 room**, adults and children, then clicks **Search Availability**.
- The system runs the availability search as usual.
- If **no single room type** can host that many guests on its own, but there **are rooms available** on those dates, then instead of only showing “No Rooms Found” we do the following:
  - Show a clear message, for example:
    - “We don’t have any single room available for 12 guests.”
  - Immediately below, show **all room types that have at least one room free** for the full stay.

The goal is to turn a hard dead-end into a helpful suggestion: “you can still stay with us by booking multiple rooms.”

### 7.2 What is shown to the user

Under the heading (e.g. “Available Rooms”) we show:

1. A notice panel explaining the situation:
   - Why there is no single room for this many guests.
   - That the user can instead book multiple rooms.
2. A grid of room cards for all **date-available** room types, reusing the same grouping UI:
   - Existing card content (photo, name, amenities, price, max occupancy).
   - A line like `2 rooms available for your dates`, using the grouped availability counts.
   - A checkbox and quantity selector so the user can pick combinations such as:
     - 3 × 4‑guest rooms for 12 guests.
     - 1 × 8‑guest + 1 × 4‑guest room for 12 guests.

This uses the same multi-selection logic as described earlier in this document; we only change **when** and **which** room types we show.

### 7.3 Capacity rule for the Continue / Book button

To keep behaviour simple and safe:

- For any multi-room selection (including this fallback):
  - We calculate **total guest capacity** from the selected rooms.
  - We compare it to the **total guests** from the search.
- The main **Continue / Proceed to Book** button is **disabled** until both are true:
  1. At least one room is selected.
  2. The total selected capacity is **greater than or equal to** the total guests.

If the capacity is still too low, we show a small red warning explaining that the user must add more rooms until capacity covers all guests. This mirrors the behaviour in both the result summary text and the booking summary footer.

### 7.4 Safety and simplicity

- We do not change any database tables or reservation records.
- All logic stays in the frontend:
  - The hook that calculates availability now also returns **how many rooms** of each type are free for the dates.
  - The page uses this to decide whether it is dealing with an “over-capacity single-room search” and to show the fallback list.
- Capacity checks are basic arithmetic (summing max occupancies) rather than complex optimisation algorithms.
- TypeScript types remain explicit and we avoid `any`.
- Lint and build checks are run to keep the codebase consistent.
