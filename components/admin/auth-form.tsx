"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ErrorMessage, request } from "./ui";
import s from "./auth-form.module.css";
export function AuthForm({ setup = false }: { setup?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await request(setup ? "/api/setup" : "/api/auth", {
        method: "POST",
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
          ...(setup ? { token: form.get("token") } : {}),
        }),
      });
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={s.authPage}>
      <Link href="/admin" className={s.brand}>
        <span className={s.brandIcon}>
          <Link2 size={21} />
        </span>
        short<span className={s.brandDot}>.</span>
      </Link>
      <section className={s.authCard}>
        <span className={s.authIcon}>
          <LockKeyhole size={22} />
        </span>
        <h1>{setup ? "Create administrator account" : "Sign in"}</h1>
        <form className={s.form} onSubmit={submit}>
          {error && <ErrorMessage message={error} />}
          <label className={s.field}>
            Username
            <input
              name="username"
              required
              autoComplete="username"
              autoFocus
              placeholder="Your username"
            />
          </label>
          <label className={s.field}>
            Password
            <input
              name="password"
              required
              type="password"
              autoComplete={setup ? "new-password" : "current-password"}
              minLength={setup ? 12 : undefined}
              placeholder={setup ? "At least 12 characters" : "Your password"}
            />
          </label>
          {setup && (
            <label className={s.field}>
              Setup token
              <input
                name="token"
                required
                type="password"
                autoComplete="off"
                placeholder="Token from your server configuration"
              />
              <span>Use the SETUP_TOKEN configured on your server.</span>
            </label>
          )}
          <button className={s.primary} disabled={busy}>
            {busy ? "Please wait…" : setup ? "Create account" : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}
