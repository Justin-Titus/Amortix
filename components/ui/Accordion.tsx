"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

export default function Accordion({ title, children }: AccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">{children}</div> : null}
    </div>
  );
}
