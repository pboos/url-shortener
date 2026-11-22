"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, LockKeyhole } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { ErrorMessage, request } from "./ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import s from "./auth-form.module.css";
export function AuthForm({ setup = false }: { setup?: boolean }) {
  const router = useRouter();
  const id = useId();
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
      <Card className={s.authCard}>
        <CardHeader className={s.cardHeader}>
          <span className={s.authIcon}>
            <LockKeyhole size={22} />
          </span>
          <CardTitle>
            <h1>{setup ? "Create administrator account" : "Sign in"}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className={s.cardContent}>
          <form className={s.form} onSubmit={submit}>
            {error && <ErrorMessage message={error} />}
            <div className={s.field}>
              <Label htmlFor={`${id}-username`}>Username</Label>
              <Input
                id={`${id}-username`}
                name="username"
                required
                autoComplete="username"
                autoFocus
                placeholder="Your username"
              />
            </div>
            <div className={s.field}>
              <Label htmlFor={`${id}-password`}>Password</Label>
              <Input
                id={`${id}-password`}
                name="password"
                required
                type="password"
                autoComplete={setup ? "new-password" : "current-password"}
                minLength={setup ? 12 : undefined}
                placeholder={setup ? "At least 12 characters" : "Your password"}
              />
            </div>
            {setup && (
              <div className={s.field}>
                <Label htmlFor={`${id}-token`}>Setup token</Label>
                <Input
                  id={`${id}-token`}
                  name="token"
                  required
                  type="password"
                  autoComplete="off"
                  placeholder="Token from your server configuration"
                />
                <span>Use the SETUP_TOKEN configured on your server.</span>
              </div>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait…" : setup ? "Create account" : "Sign in"}
              <ArrowRight size={16} />
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
