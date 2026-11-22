"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <Button size="sm" onClick={() => setCreate(true)}>
          <Plus size={17} /> Create link
        </Button>
      </div>
      <Card className={s.overview}>
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
      </Card>
      <Card className="gap-0 overflow-hidden py-0">
        <div className={s.tableToolbar}>
          <label className={s.search}>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 text-muted-foreground"
            />
            <Input
              className="pl-9 text-xs"
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
        <div>
          <Table className="text-xs [&_th]:px-4 [&_th]:text-[10px] [&_th]:tracking-wider [&_td]:px-4 [&_td]:py-2">
            <TableHeader>
              <TableRow>
                <TableHead>SHORT LINK / DESTINATION</TableHead>
                <TableHead>VISITS</TableHead>
                <TableHead className="hidden md:table-cell">CREATED</TableHead>
                <TableHead>
                  <span className={s.srOnly}>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="tabular-nums">
                      {link.totalVisits.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {dateLabel(link.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className={s.rowActions}>
                      <CopyButton
                        value={`${origin}/${encodeURIComponent(link.key)}`}
                      />
                      <ExternalLink
                        url={`${origin}/${encodeURIComponent(link.key)}`}
                      />
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-8"
                      >
                        <Link
                          href={`/admin/${encodeURIComponent(link.key)}`}
                          aria-label={`Manage ${link.key}`}
                        >
                          <ArrowRight size={17} />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <Button size="sm" onClick={() => setCreate(true)}>
                <Plus size={16} /> Create a link
              </Button>
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
      </Card>
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
