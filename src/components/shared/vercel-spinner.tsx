"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type GeistSpinnerProps = {
  size?: number | string;
  label?: string;
  className?: string;
};

export function GeistSpinner({
  size = 32,
  label = "Loading",
  className,
}: GeistSpinnerProps) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "inline-flex items-center justify-center text-primary",
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="geist-spinner block h-full w-full" />
      <style jsx>{`
        .geist-spinner {
          border-radius: 9999px;
          background: conic-gradient(
            from 90deg at 50% 50%,
            rgba(0, 0, 0, 0) 0deg,
            currentColor 360deg
          );
          -webkit-mask: radial-gradient(
            farthest-side,
            rgba(0, 0, 0, 0) calc(100% - 4px),
            black calc(100% - 3px)
          );
          mask: radial-gradient(
            farthest-side,
            rgba(0, 0, 0, 0) calc(100% - 4px),
            black calc(100% - 3px)
          );
          animation: geist-spinner-rotate 0.8s linear infinite;
        }

        @keyframes geist-spinner-rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export { GeistSpinner as VercelSpinner };
