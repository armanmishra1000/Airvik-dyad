import { RowData } from '@tanstack/react-table'

// This declaration merges with the original TanStack Table definition
// to add our custom meta properties. By making them optional, we can
// provide only the ones we need for each specific table instance.
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
      checkInReservation?: (reservation: TData) => void
      checkOutReservation?: (reservation: TData) => void
      openCancelDialog?: (reservation: TData) => void
      openDeleteDialog?: (item: TData) => void
      hasPermission?: (permission: string) => boolean
    }
}