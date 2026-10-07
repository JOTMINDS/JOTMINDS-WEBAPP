import * as React from "react";

import { InfoTip } from "./info-tip";

/** A page title with an (i) tag explaining the current tab. Renders just the title when there is no help text. */
export function TabTitle({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <>
      {children}
      {help && <InfoTip>{help}</InfoTip>}
    </>
  );
}

/** A short heading with an (i) tag, placed at the top of a tab panel to explain what the tab is for. */
export function TabIntro({ label, help }: { label: string; help: string }) {
  return (
    <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <InfoTip>{help}</InfoTip>
    </div>
  );
}
