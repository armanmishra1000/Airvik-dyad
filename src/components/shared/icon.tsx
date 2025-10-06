"use client";

import * as React from "react";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { IconName } from "@/lib/icons";

type LucideIconComponent = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

const lucideIcons = icons as Record<string, LucideIconComponent>;

interface IconProps extends LucideProps {
  name: IconName | string;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = lucideIcons[name];

  if (!LucideIcon) {
    return <icons.HelpCircle {...props} />; // Fallback icon
  }

  return <LucideIcon {...props} />;
};