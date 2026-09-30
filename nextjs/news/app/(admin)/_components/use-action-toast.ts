"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import type { FormState } from "../admin/actions";

/** Shows a toast for each result a form action returns; field errors show under their field instead. */
export function useActionToast(state: FormState) {
  useEffect(() => {
    if (state?.ok) toast.success(state.ok);
    else if (state?.error && !state.field) toast.error(state.error);
  }, [state]);
}
