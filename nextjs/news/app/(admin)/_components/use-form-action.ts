"use client";
import { startTransition, useActionState, useCallback, type FormEvent } from "react";
import type { FormState } from "../admin/actions";

/** When a save doesn't reach the server or its answer isn't one (a busy host, a dropped connection). */
export const NOT_SAVED =
  "The server didn't answer, so nothing was saved. Your changes are still here: try again.";

/**
 * useActionState for a form, submitted through onSubmit instead of `action` so React does not reset
 * the fields afterwards: after an error, what the editor typed stays in place.
 */
export function useFormAction(action: (state: FormState, form: FormData) => Promise<FormState>) {
  // A failed call would otherwise throw into Next's error page and take the form with it.
  const safe = useCallback(
    async (state: FormState, form: FormData): Promise<FormState> => {
      try {
        return await action(state, form);
      } catch {
        return { error: NOT_SAVED };
      }
    },
    [action],
  );
  const [state, run, pending] = useActionState(safe, null);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => run(data));
  };
  /** Submits prepared data, for a save started by something other than the submit button. */
  const submit = (data: FormData) => startTransition(() => run(data));
  return { state, pending, onSubmit, submit };
}
