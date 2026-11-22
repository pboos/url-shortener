"use client";
import { useState, type FormEvent } from "react";
import type { LinkRecord } from "@/lib/contracts";
import { ErrorMessage, request } from "./ui";
import s from "./link-form.module.css";
export function LinkForm({
  link,
  origin,
  onSaved,
  onCancel,
}: {
  link?: LinkRecord;
  origin: string;
  onSaved: (link: LinkRecord) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const saved = await request<LinkRecord>(
        link ? `/api/links/${encodeURIComponent(link.key)}` : "/api/links",
        {
          method: link ? "PATCH" : "POST",
          body: JSON.stringify({
            url: data.get("url"),
            key:
              data.get("key") === link?.key
                ? undefined
                : data.get("key") || undefined,
          }),
        },
      );
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save link");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className={s.form}>
      {error && <ErrorMessage message={error} />}
      <label className={s.field}>
        Destination URL
        <input
          name="url"
          type="url"
          placeholder="https://example.com/your-long-url"
          defaultValue={link?.url}
          required
          autoFocus
        />
        <span>The address people will visit.</span>
      </label>
      <label className={s.field}>
        Short link
        <span className={s.inputGroup}>
          <span>{origin.replace(/^https?:\/\//, "")}/</span>
          <input
            name="key"
            aria-label="Short link key"
            placeholder="your-link"
            defaultValue={link?.key}
            pattern={link ? undefined : "[A-Za-z0-9_\\-]+"}
            minLength={1}
            maxLength={64}
          />
        </span>
        <span>
          {link
            ? "Changing this key will stop the old short URL from working."
            : "Optional. Leave blank and we’ll create a unique key."}
        </span>
      </label>
      <div className={s.formActions}>
        <button className={s.secondary} type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className={s.primary} disabled={busy}>
          {busy ? "Saving…" : link ? "Save changes" : "Create link"}
        </button>
      </div>
    </form>
  );
}
