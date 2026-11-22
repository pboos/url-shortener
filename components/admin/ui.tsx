"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Link2,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import s from "./ui.module.css";

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const body = await response.json();
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== "/api/auth" &&
      path !== "/api/setup"
    )
      window.location.replace(
        new URL("/admin/login", window.location.origin).href,
      );
    throw new Error(
      typeof body.error === "string"
        ? body.error
        : "Something went wrong. Please try again.",
    );
  }
  return body;
}

export function AdminShell({
  children,
  origin,
}: {
  children: ReactNode;
  origin: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <Link className={s.brand} href="/admin">
          <span className={s.brandIcon}>
            <Link2 size={21} />
          </span>{" "}
          short<span className={s.brandDot}>.</span>
        </Link>
        <span className={s.workspaceLabel}>WORKSPACE</span>
        <Link className={s.navActive} href="/admin">
          <Link2 size={17} /> All links <span className={s.navIndicator} />
        </Link>
        <div className={s.sidebarBottom}>
          <span className={s.serverDot} />{" "}
          <span className={s.serverName}>
            {origin.replace(/^https?:\/\//, "")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={s.logout}
            aria-label="Sign out"
            onClick={async () => {
              try {
                await request("/api/logout", { method: "POST", body: "{}" });
                router.push("/admin/login");
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Unable to sign out");
              }
            }}
          >
            <LogOut size={16} />
          </Button>
        </div>
      </aside>
      <div className={s.mainWrap}>
        <header className={s.topbar}>
          <span>
            Workspace <span className={s.breadcrumbSlash}>/</span>{" "}
            <strong>Links</strong>
          </span>
        </header>
        <main className={s.main}>
          {error && <ErrorMessage message={error} />} {children}
        </main>
      </div>
    </div>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
export function CopyButton({
  value,
  label = "Copy short URL",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={copied ? "Copied" : label}
        title={copied ? "Copied" : label}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setFailed(false);
          } catch {
            setFailed(true);
          }
        }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </Button>
      {failed && (
        <span role="alert" className={s.copyError}>
          Copy failed. Select and copy the URL.
        </span>
      )}
    </>
  );
}
export function safeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
export function ExternalLink({ url }: { url: string }) {
  if (!safeUrl(url)) return null;
  return (
    <Button variant="ghost" size="icon" asChild>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label="Open destination"
      >
        <ArrowUpRight size={17} />
      </a>
    </Button>
  );
}
export function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className={s.pagination}>
      <span>
        {total
          ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`
          : "0 results"}
      </span>
      <div>
        <Button
          variant="ghost"
          size="icon"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={17} />
        </Button>
        <span className={s.pageCount}>
          {page} / {pages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={17} />
        </Button>
      </div>
    </div>
  );
}
export function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const [returnFocus] = useState(() =>
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        onCloseAutoFocus={(event) => {
          if (returnFocus?.isConnected) {
            event.preventDefault();
            returnFocus.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
