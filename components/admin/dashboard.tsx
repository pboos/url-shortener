"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Link2, Plus, Search, MousePointer2 } from "lucide-react";
import type { LinkPage } from "@/lib/contracts";
import {
  AdminShell,
  CopyButton,
  dateLabel,
  ErrorMessage,
  ExternalLink,
  Modal,
  Pagination,
  request,
  safeUrl,
} from "./ui";
import { LinkForm } from "./link-form";
import s from "./dashboard.module.css";
export function Dashboard({ origin }: { origin: string }) {
  const [data, setData] = useState<LinkPage | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [create, setCreate] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        setLoading(true);
        setError("");
        request<LinkPage>(
          `/api/links?q=${encodeURIComponent(query)}&page=${page}`,
          { signal: controller.signal },
        )
          .then(setData)
          .catch((e) => {
            if (!controller.signal.aborted)
              setError(e instanceof Error ? e.message : "Unable to load links");
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query ? 200 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, page, revision]);
  const links = data?.links ?? [];
  function saved() {
    setCreate(false);
    setPage(1);
    setQuery("");
    setRevision((r) => r + 1);
  }
  return (
    <AdminShell origin={origin}>
      <div className={s.pageHeading}>
        <div>
          <h1>All links</h1>
        </div>
        <button className={s.primary} onClick={() => setCreate(true)}>
          <Plus size={17} /> Create link
        </button>
      </div>
      <section className={s.overview}>
        <div>
          <span className={s.statIcon}>
            <Link2 size={19} />
          </span>
          <div>
            <span>Total links</span>
            <strong>
              {data?.workspace.totalLinks.toLocaleString() ?? "—"}
            </strong>
          </div>
        </div>
        <div>
          <span className={s.statIcon}>
            <MousePointer2 size={19} />
          </span>
          <div>
            <span>Total visits</span>
            <strong>
              {data?.workspace.totalVisits.toLocaleString() ?? "—"}
            </strong>
          </div>
        </div>
      </section>
      <section className={s.panel}>
        <div className={s.tableToolbar}>
          <label className={s.search}>
            <Search size={17} />
            <input
              type="search"
              placeholder="Search by short key or destination…"
              maxLength={200}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              aria-label="Search links"
            />
          </label>
          {query && (
            <span role="status" className={s.resultCount}>
              {data?.total ?? 0} results
            </span>
          )}
        </div>
        {error && <ErrorMessage message={error} />}
        <div className={s.tableScroll}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>SHORT LINK / DESTINATION</th>
                <th>VISITS</th>
                <th>CREATED</th>
                <th>
                  <span className={s.srOnly}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td>
                    <div className={s.linkCell}>
                      <span className={s.rowIcon}>
                        <Link2 size={17} />
                      </span>
                      <div>
                        <Link
                          className={s.shortLink}
                          href={`/admin/${encodeURIComponent(link.key)}`}
                        >
                          {origin}/{encodeURIComponent(link.key)}
                        </Link>
                        {safeUrl(link.url) ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className={s.destination}
                          >
                            {link.url}
                          </a>
                        ) : (
                          <span className={s.destination}>{link.url}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={s.visitBadge}>
                      {link.totalVisits.toLocaleString()}
                    </span>
                  </td>
                  <td className={s.dateCell}>{dateLabel(link.createdAt)}</td>
                  <td>
                    <div className={s.rowActions}>
                      <CopyButton
                        value={`${origin}/${encodeURIComponent(link.key)}`}
                      />
                      <ExternalLink
                        url={`${origin}/${encodeURIComponent(link.key)}`}
                      />
                      <Link
                        href={`/admin/${encodeURIComponent(link.key)}`}
                        className={s.iconButton}
                        aria-label={`Manage ${link.key}`}
                      >
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!links.length && (
          <div className={s.empty}>
            <span className={s.emptyIcon}>
              <Link2 size={28} />
            </span>
            <h3>
              {loading
                ? "Loading your links…"
                : query
                  ? "No matching links"
                  : "No links yet"}
            </h3>
            <p>
              {query
                ? "Try a different key or destination URL."
                : "Create a link to get started."}
            </p>
            {!loading && !query && (
              <button className={s.primary} onClick={() => setCreate(true)}>
                <Plus size={16} /> Create a link
              </button>
            )}
          </div>
        )}
        {data && (
          <Pagination
            page={page}
            total={data.total}
            pageSize={data.pageSize}
            onChange={setPage}
          />
        )}
      </section>
      {create && (
        <Modal title="Create a short link" onClose={() => setCreate(false)}>
          <LinkForm
            origin={origin}
            onSaved={saved}
            onCancel={() => setCreate(false)}
          />
        </Modal>
      )}
    </AdminShell>
  );
}
