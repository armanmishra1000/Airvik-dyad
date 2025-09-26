"use client";

import * as React from "react";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { IconName } from "@/lib/icons";

interface IconProps extends LucideProps {
  name: IconName | string;
}

export const Icon = ({ name, ...props }: IconProps) => {
  // @ts-ignore
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    return <icons.HelpCircle {...props} />; // Fallback icon
  }

  return <LucideIcon {...props} />;
};