## Roles & Permissions Clarification

The admin panel lets us hide or show buttons based on a role’s permissions, but the *actual* access rules in the database and backend often ignore those permissions. As a result, changing a role’s permissions usually has no real effect—people can still perform the action if they know where to go.

### What currently happens

1. **Hotel Owner is always a super-admin.** Even if we remove a permission (like `update:setting`), the code and database policies still allow an owner to do everything. That is why a Hotel Owner can add an amenity even when that permission is not listed.
2. **Most other roles are controlled by hard-coded role names, not by the permission list.** The database checks only whether someone is a “Hotel Manager,” “Receptionist,” etc. The permission array edited in the UI is ignored for real security decisions.
3. **Some pages do not check permissions at all.** If a user can guess the URL (e.g., `/admin/reservations`, `/admin/posts`, `/admin/donations`, `/admin/reports`), they can load the screen because nothing in the page or backend blocks them.
4. **Supabase edge functions (create-user, get-users) do not check permissions.** Any authenticated request that hits those endpoints can create or list users.
5. **Housekeeper/Receptionist flows are broken.** Their permissions say they can read rooms, but the database refuses because its policies only allow owners/managers.

### What we actually need

1. **Permission arrays must drive both UI and backend.** If a role lacks `update:setting`, the UI should hide the button *and* the database/backend must reject the request.
2. **Every page or action should verify permissions on the server.** Even if a user directly opens `/admin/some-page`, the server has to enforce the same permission.
3. **Supabase policies should call `user_has_permission(...)` instead of checking role names.** That way updating a role’s permissions automatically changes what it can do in the database.
4. **Edge functions and API routes must check permissions before doing anything.** No more “any logged-in user can create/list users.”
5. **Document that Hotel Owner is either immutable or make it respect the permission list.** Right now it silently overrides everything, which confuses people when they remove permissions and nothing changes.
6. **Every new admin feature should get its own permissions.** When we add a feature, the codebase must make it straightforward to mint and assign fresh permission strings for that feature so the system stays scalable and easy to manage.

### One-line takeaway

> “Changing permissions in the Roles UI should immediately change what someone can actually do. Today it only changes what buttons they see.”
