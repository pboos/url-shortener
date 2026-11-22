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
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
          <button
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
          </button>
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
    <p className={s.error} role="alert">
      {message}
    </p>
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
      <button
        className={s.iconButton}
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
      </button>
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
    <a
      className={s.iconButton}
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Open destination"
    >
      <ArrowUpRight size={17} />
    </a>
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
        <button
          className={s.iconButton}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={17} />
        </button>
        <span className={s.pageCount}>
          {page} / {pages}
        </span>
        <button
          className={s.iconButton}
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={17} />
        </button>
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
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={s.modal}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={s.modalBody}>
        <div className={s.modalHeading}>
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            className={s.iconButton}
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
