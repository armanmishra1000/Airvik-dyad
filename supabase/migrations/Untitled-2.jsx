---------
currently multiple room select krya hoy to room wise alag-alag reservations row create thay chhe je thavu joiye nahi. aa issue tame aapel "0048_cleanup_create_reservations_with_total.sql" Query run krya pachi problem thayo chhe or thayo hase.

ok so now have resevations karti samye issue found thayo chhe. jyare koi user nu reservation karu ane tema multiple room select kari resevation save karu tyare room wise alag-alag reservations row create thay chhe. to tena badle only single resevation row create thavi joiye. 

jyare koi user nu reservation karu ane tema multiple room select kari resevation save karu tyare only single j reservation row create thavi joiye and reservations page na data table ma ane reservations detail page ma badhi detail proeprly show thavi joiye pahela thati hati e rite. 
for example - Dec 29, 2025-Dec 31, 2025 aa date ma 2 nights, 6 guests (4 adults · 2 children), 2 rooms select krya. jema 1)AnnaDaan · Room 204-2 only 2) Brahmbhoj · Room 101 3)Brahmbhoj · Room 102 aa three roomma resevertion krya chhe to only ek j reservation create thavyu joiye ane jete reservation create thayu hoy tena reservation detail page ma properly rite Group Booking section ma room's show thavi joiye.
------

Analyse all the related files and functions, and do websearch step by step not all at once, minimum 10 plus web queries, fetch the official docs guides, or blogs and find the best practice to implement this, without doing over-engineering, or without making it complex, find the simple and robust and proven way to implement the solution,
then make proper step by step implementation plan that what exactly will be implemented and what will be changed and modified and how existing function will not break, and make sure don't touch file or function that is not related for plan,

and never use 'any' in TypeScript, also write simple english before after.

- add in plan to must Quality Checks (lint, typecheck, build)

- do not forgot we're making basic working prototype so focus on core functions only, don't add any extra jargon, which can make complex