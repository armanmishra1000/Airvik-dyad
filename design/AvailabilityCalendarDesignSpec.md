# Admin Availability Calendar – Visual Redesign Spec

## 1. Snapshot (Before → After)
- **Before:** Flat gray table, cramped header controls, low-contrast booking states, unclear focus outlines, mobile layout relies on horizontal scrolling without hierarchy.
- **After:** Layered card layout with breathing room, segmented control header, color-coded chips, sticky legend, responsive card stack on mobile, WCAG-compliant color/focus system.

## 2. Layout System
| Zone | Desktop (≥1024px) | Mobile (≤640px) |
| --- | --- | --- |
| Shell | `max-w-7xl mx-auto px-6 py-6 space-y-4` | `px-4 py-4 space-y-4` |
| Header | Two-row flex container: left title + metrics, right control cluster (month nav, month select, units toggle) | Stacked cards: title + metrics, controls collapsed into segmented buttons & dropdown row |
| Calendar grid | Table inside rounded card (`overflow-x-auto`) with sticky left column + sticky day header row | Horizontal scroll snap for day pills above stacked room-type cards; each card shows condensed grid using CSS grid (`grid-cols-[repeat(7,minmax(2.5rem,1fr))]`) |
| Legend & helper actions | Chips aligned right beneath grid; persistent “Use legacy view” tertiary button | Legend converts to horizontally scrollable chip row; helper button becomes full-width secondary |

## 3. Color Palette (WCAG AA compliant)
| Token | Hex | Usage |
| --- | --- | --- |
| `--cal-surface` | `#F8FAFC` | Page background |
| `--cal-card` | `#FFFFFF` | Card shells |
| `--cal-border` | `#E2E8F0` | Card/table borders |
| `--cal-text` | `#0F172A` | Primary text |
| `--cal-muted` | `#64748B` | Secondary text |
| `--cal-free` | `#DCFCE7` text `#065F46` | Free cells |
| `--cal-partial` | `#FEF3C7` text `#92400E` | Partial cells |
| `--cal-busy` | `#FEE2E2` text `#B91C1C` | Busy cells |
| `--cal-closed` | `#E2E8F0` text `#475569` | Closed cells |
| `--cal-focus` | `#2563EB` | Focus ring |

Sources: RoomRaccoon/MIDAS color-coding practices, Timely + WCAG 2.2 contrast guidance.

## 4. Typography & Spacing
- Base font-size `16px` (HarvardSites / RedHat min legibility) with **Major Second scale** (1.125 ratio) per Design Systems Collective:
  - Title `text-xl font-semibold` (~20px)
  - Section subtitles `text-base font-medium`
  - Body `text-sm` (~14px) for dense data, `leading-5`
- 4px spacing grid: paddings/margins in multiples of 4 (8/12/16/24px) to align with existing Tailwind spacing.

## 5. Component Details
### Header Controls
- Container: `flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 backdrop-blur`.
- Month navigation buttons: circular ghost buttons with icon, `ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary` per Deque focus guidance.
- Month select + Units toggle: use `SelectTrigger` with `text-sm font-semibold`, add subtle inset border.

### Calendar Grid
- Table header row sticky with subtle backdrop blur: `bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70`.
- Day cells: `aspect-square min-w-[3rem] rounded-xl border border-slate-200 text-sm font-semibold flex items-center justify-center transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary`.
- Selected cell: `ring-2 ring-offset-2 ring-primary` + drop shadow.
- Zebra striping for rows using `odd:bg-white even:bg-slate-50/60` to improve scan.

### Legend Chips
- `inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600` with colored dot `h-2.5 w-2.5 rounded-full`.

### Reservation Hover Card
- Increase contrast: `bg-white shadow-xl/60 border border-slate-200 rounded-2xl p-4 space-y-3`, highlight payment badges with `bg-emerald-50 text-emerald-700` etc.

### Legacy View (fallback)
- Apply same shell styles but keep flatter palette to clearly differentiate from new aggregated view; reuse header/legend components for consistency.

## 6. Responsive & Interaction Guidance
- Breakpoints borrowed from Mobiscroll demos (`sm=640`, `md=768`, `lg=1024`).
- Mobile: convert table to stacked cards using `RoomTypeRow` data; day pills scroll horizontally with snap alignment (`snap-x snap-mandatory`).
- Provide persistent summary chips (e.g., “Free 22 / 34 units”) above cards for quick context.
- Keyboard navigation: ensure arrow keys still move focus across day buttons; add `aria-pressed` for selected state.

## 7. Accessibility Checklist
- Color contrast ≥4.5:1 for text, ≥3:1 for non-text indicators (WCAG, Timely docs).
- Focus states visible even in Windows High Contrast (use `outline` fallback, no `outline: none`).
- Provide textual labels for icons (“Previous month”, “Next month”).
- All color-coded statuses paired with text (legend + tooltip copy) satisfying Microsoft accessibility guidance.
- Maintain semantic table markup for screen readers; for mobile cards provide `aria-label` summarizing date range & availability.

## 8. Tailwind / CSS Tokens
```
:root {
  --cal-surface: #f8fafc;
  --cal-card: #ffffff;
  --cal-border: #e2e8f0;
  --cal-focus: #2563eb;
  --cal-free: #dcfce7;
  --cal-free-text: #065f46;
  --cal-partial: #fef3c7;
  --cal-partial-text: #92400e;
  --cal-busy: #fee2e2;
  --cal-busy-text: #b91c1c;
  --cal-closed: #e2e8f0;
  --cal-closed-text: #475569;
}
```
- Map to Tailwind via `extend.colors.cal = {...}` for reuse in `className`s.

## 9. Implementation Notes
1. **`AvailabilityCalendar`**: update outer wrapper + header class names, inject new legend component, maintain existing state/handlers.
2. **`RoomTypeRow`**: adjust aggregated + expanded row cells to use new status classes; add `focus-visible` utilities and `aria-pressed` to buttons.
3. **`ReservationHoverCard`**: restyle container & badges; ensure typography scale applied.
4. **Responsive card mode** (optional progressive enhancement): use existing data to render condensed cards at `<sm` breakpoint without new API calls.
5. **Tailwind config**: add CSS variables + color names, enable `safelist` entries for status classes if needed.
6. **Testing**: verify keyboard-only navigation, screen reader labels, and dark-mode behavior if theme switching is enabled elsewhere.

## 10. Reference Links
- Mobbin Airbnb calendar, Subframe 25 calendar examples, Tailwind UI calendars, Mobiscroll responsive demos, Designmodo hospitality UX tips, Timely accessibility setup, W3C keyboard interface, RoomRaccoon color coding, HarvardSites typography scale.
