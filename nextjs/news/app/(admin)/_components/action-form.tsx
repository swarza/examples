"use client";
import { CircleAlert } from "lucide-react";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import type { FormState } from "../admin/actions";
import { cn } from "../_lib/utils";
import { SubmitButton } from "./submit-button";
import { Alert, AlertDescription } from "./ui/alert";
import { useActionToast } from "./use-action-toast";
import { FieldError } from "./ui/field";
import { useFieldError } from "./use-field-error";
import { useFormAction } from "./use-form-action";

const StateContext = createContext<FormState>(null);

/** The error for one field of the surrounding ActionForm, shown under it when the action names it. */
export function ActionFieldError({ name }: { name: string }) {
  const state = useContext(StateContext);
  if (!state?.error || state.field !== name) return null;
  return <FieldError id={`${name}-error`}>{state.error}</FieldError>;
}

/**
 * A form bound to a server action. The result shows as a toast, and an error also stays above the
 * fields so it can be read again. `reset` clears the fields after a success.
 */
export function ActionForm({
  action,
  submit,
  pendingLabel,
  children,
  className,
  encType,
  reset = false,
  footer,
  submitClassName,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  submit: string;
  pendingLabel?: string;
  children?: ReactNode;
  className?: string;
  encType?: string;
  reset?: boolean;
  footer?: ReactNode;
  submitClassName?: string;
}) {
  const { state, pending, onSubmit } = useFormAction(action);
  const form = useRef<HTMLFormElement>(null);
  useActionToast(state);
  useEffect(() => {
    if (reset && state?.ok) form.current?.reset();
  }, [reset, state]);
  useFieldError(form, state);

  return (
    <form ref={form} onSubmit={onSubmit} encType={encType} className={cn("flex flex-col gap-5", className)}>
      {state?.error && !state.field ? (
        <Alert variant="destructive" role="alert">
          <CircleAlert />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pending={pending} pendingLabel={pendingLabel} className={submitClassName}>
          {submit}
        </SubmitButton>
        {footer}
      </div>
    </form>
  );
}
