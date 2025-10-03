import React from "react";
import Image from "next/image";

export function Marquee() {
  const marqueeContent = (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <React.Fragment key={i}>
          <p className="px-6 text-lg font-semibold tracking-wider whitespace-nowrap">
            Jay Shree Swaminarayan 📿
          </p>
          
          <div className="h-2 w-2 rounded-full bg-primary-foreground/50" />
        </React.Fragment>
      ))}
    </>
  );

  return (
    <div className="bg-primary text-primary-foreground w-full overflow-hidden py-2">
      <div className="flex w-max animate-marquee">
        <div className="flex items-center flex-shrink-0">{marqueeContent}</div>
        <div className="flex items-center flex-shrink-0" aria-hidden="true">
          {marqueeContent}
        </div>
      </div>
    </div>
  );
}