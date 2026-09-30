"use client";
import { useEffect, type RefObject } from "react";
import type { FormState } from "../admin/actions";

/**
 * After a failed submit, marks the field the action named (`state.field`) as invalid, points it at
 * its message (`<id>-error`) and moves focus there. Earlier marks are cleared first.
 */
export function useFieldError(form: RefObject<HTMLFormElement | null>, state: FormState) {
  useEffect(() => {
    const el = form.current;
    if (!el) return;
    for (const old of el.querySelectorAll("[data-field-invalid]")) {
      old.removeAttribute("aria-invalid");
      old.removeAttribute("data-field-invalid");
      old.removeAttribute("aria-describedby");
    }
    if (!state?.error || !state.field) return;
    const input = el.querySelector<HTMLElement>(`#${CSS.escape(state.field)}`);
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("data-field-invalid", "");
    input.setAttribute("aria-describedby", `${state.field}-error`);
    input.focus();
  }, [form, state]);
}
