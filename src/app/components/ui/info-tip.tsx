import * as React from "react";
import { Info } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

interface InfoTipProps {
  /** Plain-language explanation shown in the popover. */
  children: React.ReactNode;
  /** Optional bold heading inside the popover. */
  title?: string;
  /** Accessible name for the trigger button. Defaults to "More information". */
  label?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

/**
 * Small (i) icon that opens a short explanation. Works with tap, click and keyboard,
 * so it is usable on touch screens. Place it right after the label it explains.
 */
export function InfoTip({ children, title, label = "More information", side = "top", className }: InfoTipProps) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label={title ? `${label}: ${title}` : label}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex items-center justify-center align-middle ml-1 h-4 w-4 shrink-0 rounded-full text-slate-400 hover:text-indigo-500 focus-visible:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors",
          className,
        )}
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent side={side} className="w-64 p-3 text-xs leading-relaxed" onClick={(e) => e.stopPropagation()}>
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <div className="text-muted-foreground">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
