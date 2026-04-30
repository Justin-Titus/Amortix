"use client";

import { useState, useMemo } from "react";
import { Search, X, BookOpen, TrendingUp, ShieldCheck, Calculator } from "lucide-react";

type GlossaryItem = {
  term: string;
  definition: string;
};

type GlossaryGroup = {
  title: string;
  icon?: string;
  color: string;
  items: GlossaryItem[];
};

const colorMap: Record<string, { icon: string; badge: string }> = {
  blue: { icon: "text-blue-500", badge: "bg-blue-50 border-blue-200" },
  emerald: { icon: "text-emerald-500", badge: "bg-emerald-50 border-emerald-200" },
  amber: { icon: "text-amber-500", badge: "bg-amber-50 border-amber-200" },
  slate: { icon: "text-slate-400", badge: "bg-slate-50 border-slate-200" },
  default: { icon: "text-slate-400", badge: "bg-slate-50 border-slate-200" },
};

const iconMap = {
  "book-open": BookOpen,
  "trending-up": TrendingUp,
  "shield-check": ShieldCheck,
  calculator: Calculator,
} as const;

export default function GlossaryList({ groups }: { groups: GlossaryGroup[] }) {
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;

    const query = search.toLowerCase().trim();
    return groups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.term.toLowerCase().includes(query) || 
        item.definition.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [groups, search]);

  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <label id="glossary-search-label" htmlFor="glossary-search" className="sr-only">
          Search glossary
        </label>
        <input
          id="glossary-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-labelledby="glossary-search-label"
          placeholder="Search terms, concepts, or formulas..."
          className="block w-full pl-11 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {filteredGroups.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-medium text-slate-500">No results found for &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch("")} className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredGroups.map((group) => (
            <section key={group.title} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-300">
              {(() => {
                const safeColor = colorMap[group.color] ?? colorMap.default;
                const Icon = group.icon ? iconMap[group.icon as keyof typeof iconMap] : null;
                return (
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/30">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${safeColor.badge}`}>
                  {Icon ? <Icon className={`w-3.5 h-3.5 ${safeColor.icon}`} /> : null}
                </div>
                <h2 className="text-[14px] font-medium text-[#0D1F3C]">{group.title}</h2>
              </div>
                );
              })()}

              <div className="divide-y divide-slate-100">
                {group.items.map((item) => {
                  const id = item.term.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <div 
                      key={item.term} 
                      id={id}
                      className="px-5 py-4 hover:bg-slate-50/60 transition-colors scroll-mt-24"
                    >
                      <p className="text-[13px] font-medium text-[#0D1F3C] mb-1">{item.term}</p>
                      <p className={`text-[12px] leading-relaxed ${group.color === "slate" ? "font-mono text-slate-600" : "text-slate-500"}`}>
                        {item.definition}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
