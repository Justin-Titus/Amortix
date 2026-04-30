"use client";

import { ChevronDown } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type CustomSelectProps<T extends string> = {
  id?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
};

export function CustomSelect<T extends string>({ id, value, options, onChange, placeholder = "Select...", className }: CustomSelectProps<T>) {
  const generatedId = useId();
  const selectId = id ?? `custom-select-${generatedId}`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (
        !buttonRef.current?.contains(event.target as Node) &&
        !listRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  useEffect(() => {
    if (open) {
      listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    }
  }, [open, highlightedIndex]);

  const selectedOption = options.find((option) => option.value === value);

  const closeList = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    closeList();
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) => {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = current + delta;
        if (nextIndex < 0) return options.length - 1;
        if (nextIndex >= options.length) return 0;
        return nextIndex;
      });
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        handleSelect(options[highlightedIndex]?.value ?? value);
      } else {
        setOpen(true);
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        id={selectId}
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={selectId}
        onClick={() => {
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
          setOpen((current) => !current);
        }}
        onKeyDown={handleButtonKeyDown}
        className={`flex w-full items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0D1F3C] transition duration-200 ease-out hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#118c76] focus:ring-offset-2 focus:ring-offset-white ${className ?? ""}`}
      >
        <span className={`truncate ${selectedOption ? "text-slate-900" : "text-slate-500"}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className="ml-3 h-4 w-4 text-slate-400" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={selectId}
          tabIndex={-1}
          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                className={`cursor-pointer px-4 py-3 text-sm text-[#0D1F3C] transition duration-150 ease-out ${
                  isHighlighted ? "bg-slate-100" : "bg-white"
                } ${isSelected ? "font-semibold" : "font-normal"} hover:bg-slate-100 focus-visible:outline-none focus-visible:bg-slate-100`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
