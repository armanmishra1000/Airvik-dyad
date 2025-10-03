# Final Implementation Plan: Rooms Category Feature (Supabase Integration)

## Feature Scope
- Add a new "Rooms Category" tab to the Admin Panel Sidebar
- Position it above the "Room Types" tab
- Display Category Name and Category Description in the section
- Implement full CRUD functionality for room categories
- Follow the existing architectural patterns and maintain consistency
- Integrate with Supabase database using existing patterns

## Supabase Architecture Analysis

### Current Supabase Patterns Identified:
1. **Database Schema**: PostgreSQL with Row Level Security (RLS)
2. **Permission System**: Function-based `user_has_permission()` for security policies
3. **API Layer**: Centralized in `src/lib/api.ts` (currently missing but referenced)
4. **Client Integration**: Supabase client in `src/integrations/supabase/client.ts`
5. **Data Management**: Custom hooks and context with `useAppData()`
6. **Migration Pattern**: Sequential SQL migrations in `supabase/migrations/`

### Database Security Model:
- **Permission Function**: `user_has_permission(user_id, permission_text)`
- **Role-Based Access**: Hotel Owner (super-admin), Manager, Receptionist, Housekeeper
- **Granular Permissions**: `create:resource`, `read:resource`, `update:resource`, `delete:resource`

## Step-by-Step Execution Strategy

### 1. Database Layer Setup (Supabase)
- **Create room_categories table** with proper schema
- **Add RLS policies** using existing permission system
- **Create database migration file** following naming convention
- **Implement permission-based security** using `user_has_permission()` function

### 2. API Layer Integration
- **Create/Update API functions** in `src/lib/api.ts` for room categories
- **Implement CRUD operations**: `getRoomCategories()`, `upsertRoomCategory()`, `deleteRoomCategory()`
- **Add database helpers** for data transformation (following `fromDbRoomType` pattern)
- **Integrate with existing error handling** and response patterns

### 3. TypeScript Interface Updates
- **Create RoomCategory interface** in `src/data/types.ts`
- **Add room_category to PermissionResource type**
- **Update allPermissions array** with new permissions
- **Maintain type safety** across the application

### 4. Data Context Integration
- **Update DataContextType interface** in `src/context/data-context.tsx`
- **Add CRUD methods** for room categories
- **Update useAppData hook** in `src/hooks/use-app-data.ts`
- **Add room categories to data fetching** in `fetchData()` function

### 5. Sidebar Navigation Integration
- **Add navigation item** to `navItems` array in `src/components/layout/sidebar.tsx`
- **Position above "Room Types"** (index 35 in the array)
- **Configure permissions** using `read:room_category`
- **Add FolderOpen icon** from lucide-react

### 6. Page Structure Creation
- **Create route**: `src/app/(app)/room-categories/page.tsx`
- **Create components directory**: `src/app/(app)/room-categories/components/`
- **Build data table component**: Following existing room types pattern
- **Create form dialog component**: For adding/editing categories
- **Implement columns definition**: For table display and actions

### 7. UI/UX Implementation
- **Design category form**: With name and description fields only
- **Create table layout**: Displaying categories with CRUD actions
- **Add pagination**: Reuse existing `DataTablePagination` component
- **Implement delete confirmation**: Use existing `DeleteConfirmationDialog`
- **Form validation**: Implement with zod schema
- **Responsive design**: Follow existing responsive patterns

## Codebase File-Level Impact

### Files to Modify:

#### 1. **Database Schema**
- **supabase/migrations/0016_create_room_categories_table_and_security_policies.sql**
  - Create `room_categories` table with proper schema
  - Add RLS policies using permission system
  - Follow existing naming conventions

#### 2. **Type Definitions**
- **src/data/types.ts**
  - Add `RoomCategory` interface:
    ```typescript
    export interface RoomCategory {
      id: string;
      name: string;
      description: string;
      created_at: string;
    }
    ```
  - Add `room_category` to `PermissionResource` type
  - Update `allPermissions` array with room category permissions

#### 3. **API Layer**
- **src/lib/api.ts** (Create if missing, otherwise update)
  - Add room category CRUD functions:
    ```typescript
    export const getRoomCategories = () => supabase.from('room_categories').select('*');
    export const upsertRoomCategory = (category: Partial<RoomCategory>) => supabase.from('room_categories').upsert(category);
    export const deleteRoomCategory = (id: string) => supabase.from('room_categories').delete().eq('id', id);
    ```
  - Add data transformation helpers

#### 4. **Data Context**
- **src/context/data-context.tsx**
  - Add room categories to `DataContextType` interface
  - Add CRUD methods for room categories
  - Update context provider to include room categories

#### 5. **Data Hook**
- **src/hooks/use-app-data.ts**
  - Add room categories state management
  - Update `fetchData()` to include room categories
  - Add CRUD methods: `addRoomCategory()`, `updateRoomCategory()`, `deleteRoomCategory()`

#### 6. **Sidebar Navigation**
- **src/components/layout/sidebar.tsx**
  - Add room categories navigation item above "Room Types"
  - Import `FolderOpen` icon from lucide-react
  - Configure with `read:room_category` permission

### Files to Create:

#### 1. **Page Component**
- **src/app/(app)/room-categories/page.tsx**
  ```typescript
  export default function RoomCategoriesPage() {
    const { roomCategories } = useDataContext();
    return (
      <div className="space-y-4">
        <RoomCategoriesDataTable columns={columns} data={roomCategories} />
      </div>
    );
  }
  ```

#### 2. **Table Components**
- **src/app/(app)/room-categories/components/columns.tsx**
  - Define table columns for name, description, actions
  - Follow existing room types column patterns

- **src/app/(app)/room-categories/components/data-table.tsx**
  - Create data table with CRUD operations
  - Integrate with form dialog and delete confirmation
  - Reuse existing pagination components

#### 3. **Form Component**
- **src/app/(app)/room-categories/components/room-category-form-dialog.tsx**
  - Create form with name and description fields
  - Implement zod validation schema
  - Integrate with DataContext CRUD methods
  - Follow existing form dialog patterns

## Key Technical Considerations

### Database Schema Design:
```sql
CREATE TABLE public.room_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Security Policies:
- Use `user_has_permission()` function for RLS
- Apply same permission pattern as room_types
- Enable Row Level Security on the table

### Permission Integration:
- **Read**: `read:room_category`
- **Create**: `create:room_category`
- **Update**: `update:room_category`
- **Delete**: `delete:room_category`

### API Integration:
- Use existing Supabase client from `@/integrations/supabase/client`
- Follow existing error handling patterns
- Maintain consistent response structure

### Form Validation:
```typescript
const roomCategorySchema = z.object({
  name: z.string().min(1, "Category name is required."),
  description: z.string().optional(),
});
```

## Critical Prerequisites

### 1. Missing API File
- **Issue**: `src/lib/api.ts` is imported but doesn't exist
- **Solution**: Create the file with all referenced API functions
- **Impact**: Affects multiple components and data loading

### 2. Database Migration Naming
- **Pattern**: Follow existing sequential naming (0016_, 0017_, etc.)
- **Convention**: Use descriptive snake_case names
- **Execution**: Run migrations in proper order

## Timeline & Effort Estimation

### Phase 1: Backend Setup (3-4 hours)
- Database migration: 1 hour
- API functions: 1-2 hours
- Type definitions: 0.5 hours
- Data context integration: 0.5 hours

### Phase 2: Frontend Components (4-5 hours)
- Page creation: 0.5 hours
- Table components: 2 hours
- Form dialog: 1.5 hours
- Column definitions: 0.5 hours

### Phase 3: Integration & Testing (2-3 hours)
- Sidebar integration: 0.5 hours
- Permission testing: 1 hour
- CRUD functionality testing: 1 hour
- Polish and bug fixes: 0.5 hours

### Total Estimated Time: 9-12 hours

## Implementation Risks & Mitigation

### 1. Missing API Dependencies
- **Risk**: Multiple components import from non-existent `@/lib/api`
- **Mitigation**: Create comprehensive API file first
- **Fallback**: Use direct Supabase client calls if needed

### 2. Permission System Complexity
- **Risk**: Complex permission function may have edge cases
- **Mitigation**: Test with different user roles
- **Fallback**: Implement client-side permission checks

### 3. Database Migration Issues
- **Risk**: Migration conflicts or syntax errors
- **Mitigation**: Test migrations locally first
- **Fallback**: Manual database setup if needed

## Success Criteria

1. ✅ Room Categories tab appears in sidebar above Room Types
2. ✅ Only users with `read:room_category` permission can access
3. ✅ Full CRUD operations work correctly
4. ✅ Form validation prevents invalid data
5. ✅ Delete confirmation prevents accidental deletions
6. ✅ Responsive design works on all screen sizes
7. ✅ Security policies prevent unauthorized access
8. ✅ Data persists correctly in Supabase database

## Current Architecture Analysis

The codebase uses a modular Next.js architecture with:
1. **Sidebar Navigation**: Defined in `src/components/layout/sidebar.tsx` with a declarative `navItems` array
2. **Permission System**: Role-based access control via `useAuthContext()` hook
3. **Data Management**: Centralized state through `useDataContext()` hook
4. **Room Types Implementation**: Complete CRUD with table view, form dialogs, and data validation
5. **Type Safety**: Comprehensive TypeScript definitions in `src/data/types.ts`

The current sidebar structure follows a clean pattern where navigation items are defined in an array with properties for href, icon, label, and required permissions. The Room Types feature is already fully implemented with a sophisticated data table, form dialogs, and proper permission handling.