"use client";
import { useId, useState, type FormEvent } from "react";
import type { LinkRecord } from "@/lib/contracts";
import { ErrorMessage, request } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const id = useId();
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
      <div className={s.field}>
        <Label htmlFor={`${id}-url`}>Destination URL</Label>
        <Input
          id={`${id}-url`}
          name="url"
          type="url"
          placeholder="https://example.com/your-long-url"
          defaultValue={link?.url}
          required
          autoFocus
        />
        <span>The address people will visit.</span>
      </div>
      <div className={s.field}>
        <Label htmlFor={`${id}-key`}>Short link</Label>
        <span className={s.inputGroup}>
          <span>{origin.replace(/^https?:\/\//, "")}/</span>
          <Input
            id={`${id}-key`}
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
      </div>
      <div className={s.formActions}>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : link ? "Save changes" : "Create link"}
        </Button>
      </div>
    </form>
  );
}
