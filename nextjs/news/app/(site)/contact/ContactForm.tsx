"use client";
import { useActionState } from "react";
import { sendMessage, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, null);
  if (state?.ok) return <p className="note">{state.message}</p>;
  return (
    <form className="form" action={action}>
      {state ? <p className="note bad">{state.message}</p> : null}
      <label>
        Name
        <input name="name" required maxLength={100} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required maxLength={200} autoComplete="email" />
      </label>
      <label>
        Subject
        <input name="subject" maxLength={200} />
      </label>
      <label>
        Message
        <textarea name="body" required maxLength={5000} />
      </label>
      {/* Left empty by people; bots fill it in. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px" }}
        aria-hidden
      />
      <div>
        <button className="button" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
