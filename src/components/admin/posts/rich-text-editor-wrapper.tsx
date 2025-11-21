"use client";

import { RichTextEditor } from "./rich-text-editor";

interface RichTextEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditorWrapper(props: RichTextEditorWrapperProps) {
  return <RichTextEditor {...props} />;
}
