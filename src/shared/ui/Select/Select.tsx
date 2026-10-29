import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/shared/ui/Icon/Icon";
import "./Select.css";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  value: string | number;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "default" | "compact";
  "aria-label"?: string;
}

/** Select-only combobox: focus stays on the trigger while the list is open. */
export function Select({ id, value, options, onValueChange, disabled, fullWidth, size = "default", "aria-label": ariaLabel }: SelectProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listId = `${triggerId}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef({ text: "", time: 0 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const selectedIndex = options.findIndex((option) => String(option.value) === String(value));
  const open = activeIndex !== null && !disabled;

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    setActiveIndex(null);
    if (String(option.value) !== String(value)) onValueChange(String(option.value));
  }

  function openList(last = false) {
    const selected = options[selectedIndex];
    const index = selected && !selected.disabled ? selectedIndex : last
      ? options.findLastIndex((option) => !option.disabled)
      : options.findIndex((option) => !option.disabled);
    if (index >= 0) setActiveIndex(index);
    searchRef.current = { text: "", time: 0 };
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Tab" || event.key === "Escape") {
      if (open && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
      setActiveIndex(null);
      return;
    }
    if (["Enter", " ", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "Home" || event.key === "End") {
        const index = event.key === "Home" ? options.findIndex((option) => !option.disabled)
          : options.findLastIndex((option) => !option.disabled);
        if (index >= 0) setActiveIndex(index);
      } else if (!open) {
        openList(event.key === "ArrowUp");
      } else if (event.key === "Enter" || event.key === " ") {
        choose(activeIndex!);
      } else {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        for (let offset = 1; offset <= options.length; offset++) {
          const index = (activeIndex! + direction * offset + options.length) % options.length;
          if (!options[index].disabled) { setActiveIndex(index); break; }
        }
      }
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = (now - searchRef.current.time < 700 ? searchRef.current.text : "") + event.key.toLocaleLowerCase();
      searchRef.current = { text, time: now };
      const query = [...text].every((letter) => letter === text[0]) ? text[0] : text;
      const start = query.length === 1 ? (activeIndex ?? selectedIndex) + 1 : activeIndex ?? selectedIndex;
      for (let offset = 0; offset < options.length; offset++) {
        const index = (Math.max(0, start) + offset) % options.length;
        if (!options[index].disabled && options[index].label.toLocaleLowerCase().startsWith(query)) {
          setActiveIndex(index);
          break;
        }
      }
    }
  }

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current!;
    const list = listRef.current!;
    function position() {
      const rect = trigger.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - 14;
      const above = rect.top - 14;
      const upwards = below < 180 && above > below;
      list.style.width = `${Math.min(Math.max(rect.width, 160), window.innerWidth - 24)}px`;
      list.style.maxHeight = `${Math.max(60, Math.min(300, upwards ? above : below))}px`;
      list.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - list.offsetWidth - 12))}px`;
      list.style.top = `${upwards ? Math.max(12, rect.top - list.offsetHeight - 6) : rect.bottom + 6}px`;
    }
    position();
    function onScroll(event: Event) {
      if (!list.contains(event.target as Node)) position();
    }
    window.addEventListener("resize", position);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", position);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [open, options]);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !listRef.current?.contains(target)) setActiveIndex(null);
    }
    document.addEventListener("pointerdown", dismiss, true);
    return () => document.removeEventListener("pointerdown", dismiss, true);
  }, [open]);

  useLayoutEffect(() => {
    if (open) listRef.current?.children[activeIndex!]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  return (
    <>
      <button
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={`select-control select-control--${size}${fullWidth ? " select-control--full" : ""}`}
        disabled={disabled}
        id={triggerId}
        onBlur={() => setActiveIndex(null)}
        onClick={() => open ? setActiveIndex(null) : openList()}
        onKeyDown={handleKeyDown}
        ref={triggerRef}
        role="combobox"
        type="button"
      >
        <span className="select-control__value">{options[selectedIndex]?.label ?? "선택해 주세요"}</span>
        <Icon name="chevron-down" size={14} />
      </button>
      {open && createPortal(
        <div
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : triggerId}
          className="select-menu"
          id={listId}
          onPointerDown={(event) => event.preventDefault()}
          ref={listRef}
          role="listbox"
        >
          {options.map((option, index) => (
            <div
              aria-disabled={option.disabled || undefined}
              aria-selected={index === selectedIndex}
              className={`select-menu__option${index === activeIndex ? " is-active" : ""}`}
              id={`${listId}-${index}`}
              key={String(option.value)}
              onClick={() => choose(index)}
              role="option"
            >
              <span>{option.label}</span>
              {index === selectedIndex && <Icon name="check" size={14} tone="accent" />}
            </div>
          ))}
        </div>, document.body,
      )}
    </>
  );
}
