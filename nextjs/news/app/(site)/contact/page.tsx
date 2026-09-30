import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };
// The masthead lists the sections from the database, which the build has no access to.
export const dynamic = "force-dynamic";

export default function Contact() {
  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">Contact</span>
        <h1>Write to us.</h1>
        <p className="dek">Tips, corrections and complaints all land in the same inbox.</p>
      </div>
      <ContactForm />
    </div>
  );
}
