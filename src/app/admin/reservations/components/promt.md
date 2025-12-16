I have an Aivik-dyad project folder, which is built using Next.js, TypeScript, Tailwind CSS, and Supabase — this project is a hotel room-booking system.

When I go to the Reservations page in the website’s admin panel and click on “Add Reservation”, a new reservation page opens.

On the new reservation page, I select the guest name, then enter the check-in and check-out dates, along with the number of adults and children. Based on the selected dates and the guest count, the system shows the Available Rooms. When I select a room from the Available Rooms list, the default price of the room is correctly shown in the Subtotal.

Now, if I want to apply a custom price for specific room categories in a particular booking, that custom price should be applied only to that specific booking. The summary section should then calculate and display the Subtotal correctly based on the custom prices.

For example, if I select the AnnaDaan and Brahmbhoj rooms:

The original price of the AnnaDaan room was 2400, and I change it to a custom price of 2000.

The original price of the Brahmbhoj room was 2100, and I change it to a custom price of 1800.

Then, in the summary, the Subtotal should be calculated and displayed correctly based on these custom prices.

Analyse all the related files and functions, and do websearch step by step not all at once, minimum 10 plus web queries, fetch the official docs guides, or blogs and find the best practice to implement this, without doing over-engineering, or without making it complex, find the simple and robust and proven way to implement the solution,
then make proper step by step implementation plan that what exactly will be implemented and what will be changed and modified and how existing function will not break, and make sure don't touch file or function that is not related for plan,

and never use 'any' in TypeScript, also write simple english before after.

- add in plan to must Quality Checks (lint, typecheck, build)

- do not forgot we're making basic working prototype so focus on core functions only, don't add any extra jargon, which can make complex


- edit-regeravation

If a reservation has a custom price applied and that reservation’s custom price is changed again, the updated price should be shown everywhere.