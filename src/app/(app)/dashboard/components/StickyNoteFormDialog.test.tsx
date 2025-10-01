import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { StickyNoteFormDialog } from "./StickyNoteFormDialog";
import { buildStickyNote } from "@/test/builders";
import type { StickyNote } from "@/data/types";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the data context
const mockAddStickyNote = vi.fn();
const mockUpdateStickyNote = vi.fn();

vi.mock("@/context/data-context", () => ({
  useDataContext: () => ({
    addStickyNote: mockAddStickyNote,
    updateStickyNote: mockUpdateStickyNote,
  }),
}));

describe("StickyNoteFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create flow", () => {
    it("renders the create dialog with empty form fields", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <StickyNoteFormDialog>
          <button>Add Note</button>
        </StickyNoteFormDialog>
      );

      // Act
      await user.click(screen.getByRole("button", { name: /add note/i }));

      // Assert
      expect(screen.getByRole("heading", { name: /add new note/i })).toBeInTheDocument();
      expect(screen.getByText(/write your note and choose a color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue("");
      expect(screen.getByLabelText(/description \(optional\)/i)).toHaveValue("");
      expect(screen.getByRole("button", { name: /add note/i })).toBeInTheDocument();
    });

    it("successfully creates a new sticky note with valid input", async () => {
      // Arrange
      const user = userEvent.setup();
      mockAddStickyNote.mockResolvedValueOnce(undefined);

      render(
        <StickyNoteFormDialog>
          <button>Open Dialog</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog
      await user.click(screen.getByRole("button", { name: /open dialog/i }));

      // Act - fill form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description \(optional\)/i);

      await user.type(titleInput, "Important reminder");
      await user.type(descriptionInput, "Don't forget to call the supplier");

      // Act - submit form
      const submitButton = screen.getByRole("button", { name: /add note/i });
      await user.click(submitButton);

      // Assert - context helper called
      await waitFor(() => {
        expect(mockAddStickyNote).toHaveBeenCalledWith({
          title: "Important reminder",
          description: "Don't forget to call the supplier",
          color: "yellow",
        });
      });

      // Assert - toast success shown
      expect(toast.success).toHaveBeenCalledWith("Note created successfully!");

      // Assert - dialog closes
      await waitFor(() => {
        expect(screen.queryByRole("heading", { name: /add new note/i })).not.toBeInTheDocument();
      });
    });

    it("allows selecting a different color before submission", async () => {
      // Arrange
      const user = userEvent.setup();
      mockAddStickyNote.mockResolvedValueOnce(undefined);

      render(
        <StickyNoteFormDialog>
          <button>Add Note</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog and fill form
      await user.click(screen.getByRole("button", { name: /add note/i }));
      await user.type(screen.getByLabelText(/title/i), "Blue note");

      // Act - select blue color (ToggleGroupItem renders as button with value attribute)
      const colorToggles = screen.getAllByRole("radio");
      const blueToggle = colorToggles[2]; // blue is the 3rd color (yellow, pink, blue, green)
      await user.click(blueToggle);

      // Act - submit
      const submitButtons = screen.getAllByRole("button", { name: /add note/i });
      await user.click(submitButtons[submitButtons.length - 1]);

      // Assert
      await waitFor(() => {
        expect(mockAddStickyNote).toHaveBeenCalledWith({
          title: "Blue note",
          description: "",
          color: "blue",
        });
      });
    });

    it("shows validation error when title is missing", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <StickyNoteFormDialog>
          <button>Add Note</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog
      await user.click(screen.getByRole("button", { name: /add note/i }));

      // Act - submit without filling title
      const submitButton = screen.getByRole("button", { name: /add note/i });
      await user.click(submitButton);

      // Assert - validation message shown
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Assert - context helper not called
      expect(mockAddStickyNote).not.toHaveBeenCalled();

      // Assert - toast not shown
      expect(toast.success).not.toHaveBeenCalled();
    });

    it("displays toast error when creation fails", async () => {
      // Arrange
      const user = userEvent.setup();
      const errorMessage = "Database connection failed";
      mockAddStickyNote.mockRejectedValueOnce(new Error(errorMessage));

      render(
        <StickyNoteFormDialog>
          <button>Add Note</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog, fill form, and submit
      await user.click(screen.getByRole("button", { name: /add note/i }));
      await user.type(screen.getByLabelText(/title/i), "Test note");
      await user.click(screen.getByRole("button", { name: /add note/i }));

      // Assert - error toast shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to save note", {
          description: errorMessage,
        });
      });

      // Assert - dialog remains open
      expect(screen.getByRole("heading", { name: /add new note/i })).toBeInTheDocument();
    });
  });

  describe("Edit flow", () => {
    let existingNote: StickyNote;

    beforeEach(() => {
      existingNote = buildStickyNote({
        id: "note-123",
        title: "Existing note",
        description: "Original description",
        color: "pink",
      });
    });

    it("pre-populates form fields when editing an existing note", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <StickyNoteFormDialog note={existingNote}>
          <button>Edit Note</button>
        </StickyNoteFormDialog>
      );

      // Act
      await user.click(screen.getByRole("button", { name: /edit note/i }));

      // Assert - dialog shows edit mode
      expect(screen.getByRole("heading", { name: /edit note/i })).toBeInTheDocument();

      // Assert - fields are pre-filled
      expect(screen.getByLabelText(/title/i)).toHaveValue("Existing note");
      expect(screen.getByLabelText(/description \(optional\)/i)).toHaveValue("Original description");

      // Assert - submit button shows "Save Changes"
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("successfully updates an existing sticky note", async () => {
      // Arrange
      const user = userEvent.setup();
      mockUpdateStickyNote.mockResolvedValueOnce(undefined);

      render(
        <StickyNoteFormDialog note={existingNote}>
          <button>Edit</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog
      await user.click(screen.getByRole("button", { name: /edit/i }));

      // Act - modify fields
      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, "Updated title");

      const descriptionInput = screen.getByLabelText(/description \(optional\)/i);
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated description");

      // Act - submit
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      // Assert - updateStickyNote called with correct data
      await waitFor(() => {
        expect(mockUpdateStickyNote).toHaveBeenCalledWith("note-123", {
          title: "Updated title",
          description: "Updated description",
          color: "pink",
        });
      });

      // Assert - success toast shown
      expect(toast.success).toHaveBeenCalledWith("Note updated successfully!");

      // Assert - dialog closes
      await waitFor(() => {
        expect(screen.queryByRole("heading", { name: /edit note/i })).not.toBeInTheDocument();
      });
    });

    it("shows validation error when clearing the title during edit", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <StickyNoteFormDialog note={existingNote}>
          <button>Edit</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog and clear title
      await user.click(screen.getByRole("button", { name: /edit/i }));
      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);

      // Act - submit
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      // Assert - validation error shown
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Assert - update not called
      expect(mockUpdateStickyNote).not.toHaveBeenCalled();
    });

    it("displays toast error when update fails", async () => {
      // Arrange
      const user = userEvent.setup();
      const errorMessage = "Note not found";
      mockUpdateStickyNote.mockRejectedValueOnce(new Error(errorMessage));

      render(
        <StickyNoteFormDialog note={existingNote}>
          <button>Edit</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog and submit
      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      // Assert - error toast shown with description
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to save note", {
          description: errorMessage,
        });
      });

      // Assert - dialog remains open
      expect(screen.getByRole("heading", { name: /edit note/i })).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles optional description field correctly when empty", async () => {
      // Arrange
      const user = userEvent.setup();
      mockAddStickyNote.mockResolvedValueOnce(undefined);

      render(
        <StickyNoteFormDialog>
          <button>Add</button>
        </StickyNoteFormDialog>
      );

      // Act - submit with only title
      await user.click(screen.getByRole("button", { name: /add/i }));
      await user.type(screen.getByLabelText(/title/i), "Title only");
      await user.click(screen.getByRole("button", { name: /add note/i }));

      // Assert - called with empty description
      await waitFor(() => {
        expect(mockAddStickyNote).toHaveBeenCalledWith({
          title: "Title only",
          description: "",
          color: "yellow",
        });
      });
    });

    it("allows user to close dialog via state change without submitting", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <StickyNoteFormDialog>
          <button>Open</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog
      await user.click(screen.getByRole("button", { name: /open/i }));
      expect(screen.getByRole("heading", { name: /add new note/i })).toBeInTheDocument();

      // Act - press escape to close (Dialog component handles this)
      await user.keyboard("{Escape}");

      // Assert - dialog closes without calling context
      await waitFor(() => {
        expect(screen.queryByRole("heading", { name: /add new note/i })).not.toBeInTheDocument();
      });
      expect(mockAddStickyNote).not.toHaveBeenCalled();
    });

    it("resets form after successful submission", async () => {
      // Arrange
      const user = userEvent.setup();
      mockAddStickyNote.mockResolvedValueOnce(undefined);

      render(
        <StickyNoteFormDialog>
          <button>Add</button>
        </StickyNoteFormDialog>
      );

      // Act - first submission
      await user.click(screen.getByRole("button", { name: /add/i }));
      await user.type(screen.getByLabelText(/title/i), "First note");
      await user.click(screen.getByRole("button", { name: /add note/i }));

      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByRole("heading", { name: /add new note/i })).not.toBeInTheDocument();
      });

      // Act - reopen dialog
      await user.click(screen.getByRole("button", { name: /add/i }));

      // Assert - form is reset
      expect(screen.getByLabelText(/title/i)).toHaveValue("");
      expect(screen.getByLabelText(/description \(optional\)/i)).toHaveValue("");
    });

    it("handles note without description in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      const noteWithoutDescription = buildStickyNote({
        title: "No description",
        description: undefined,
        color: "green",
      });

      render(
        <StickyNoteFormDialog note={noteWithoutDescription}>
          <button>Edit</button>
        </StickyNoteFormDialog>
      );

      // Act - open dialog
      await user.click(screen.getByRole("button", { name: /edit/i }));

      // Assert - description field is empty
      expect(screen.getByLabelText(/description \(optional\)/i)).toHaveValue("");
    });
  });
});
