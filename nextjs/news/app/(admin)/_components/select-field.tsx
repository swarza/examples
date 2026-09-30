"use client";
import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

/** A Base UI select that posts its value with the surrounding form, showing labels rather than values. */
export function SelectField({
  id,
  name,
  defaultValue,
  items,
  value,
  onValueChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string;
  name?: string;
  defaultValue?: string;
  /** Controlled value, instead of defaultValue. */
  value?: string;
  /** `icon` is drawn before the label, e.g. a small layout diagram. */
  items: { value: string; label: string; icon?: ReactNode }[];
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const icons = items.some((i) => i.icon);
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      value={value}
      disabled={disabled}
      items={items}
      onValueChange={(v) => onValueChange?.(String(v))}
    >
      <SelectTrigger id={id} className={className ?? "w-full"} aria-label={ariaLabel}>
        {icons ? (
          <SelectValue>
            {(v: string) => {
              const item = items.find((i) => i.value === v);
              return (
                <>
                  {item?.icon}
                  <span className="truncate">{item?.label}</span>
                </>
              );
            }}
          </SelectValue>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.icon}
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
