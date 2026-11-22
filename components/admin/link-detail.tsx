"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MousePointer2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import type { LinkRecord, LinkStats } from "@/lib/contracts";
import { QrStudio } from "@/components/qr/qr-studio";
import {
  AdminShell,
  CopyButton,
  dateLabel,
  ErrorMessage,
  Modal,
  Pagination,
  request,
  safeUrl,
} from "./ui";
import { LinkForm } from "./link-form";
import s from "./link-detail.module.css";
export function LinkDetail({
  origin,
  linkKey,
}: {
  origin: string;
  linkKey: string;
}) {
  const router = useRouter();
  const [link, setLink] = useState<LinkRecord | null>(null);
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    request<LinkRecord>(`/api/links/${encodeURIComponent(linkKey)}`, {
      signal: controller.signal,
    })
      .then(setLink)
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Unable to load link");
      });
    return () => controller.abort();
  }, [linkKey]);
  useEffect(() => {
    const controller = new AbortController();
    request<LinkStats>(
      `/api/links/${encodeURIComponent(linkKey)}/visits?page=${page}`,
      { signal: controller.signal },
    )
      .then(setStats)
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Unable to load visits");
      });
    return () => controller.abort();
  }, [linkKey, page]);
  async function remove() {
    if (!link) return;
    setDeleting(true);
    try {
      await request(`/api/links/${encodeURIComponent(link.key)}`, {
        method: "DELETE",
        body: "{}",
      });
      router.push("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete link");
      setDialog(null);
    } finally {
      setDeleting(false);
    }
  }
  const shortUrl = `${origin}/${encodeURIComponent(link?.key ?? linkKey)}`;
  const peak = Math.max(1, ...(stats?.daily.map((day) => day.visits) ?? []));
  return (
    <AdminShell origin={origin}>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-5 -ml-3 text-muted-foreground"
      >
        <Link href="/admin">
          <ArrowLeft size={15} /> Back to all links
        </Link>
      </Button>
      {error && <ErrorMessage message={error} />}
      <div className={s.pageHeading}>
        <div>
          <h1>/{link?.key ?? linkKey}</h1>
        </div>
        {link && (
          <div className={s.headingActions}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("edit")}
            >
              <Pencil size={15} /> Edit link
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive"
              aria-label="Delete link"
              onClick={() => setDialog("delete")}
            >
              <Trash2 size={17} />
            </Button>
          </div>
        )}
      </div>
      {link && (
        <>
          <Card className={s.linkSummary}>
            <div>
              <span className={s.label}>SHORT LINK</span>
              <div className={s.shortUrl}>
                <a href={shortUrl} target="_blank" rel="noreferrer">
                  {shortUrl}
                </a>
                <CopyButton value={shortUrl} />
              </div>
              {safeUrl(link.url) ? (
                <a
                  className={s.destinationFull}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.url}
                  <ArrowUpRight size={14} />
                </a>
              ) : (
                <span className={s.destinationFull}>{link.url}</span>
              )}
            </div>
            <span className={s.created}>
              <CalendarDays size={15} /> Created {dateLabel(link.createdAt)}
            </span>
          </Card>
          <div className={s.detailGrid}>
            <div>
              <Card className="gap-0 overflow-hidden py-0">
                <div className={s.tableToolbar}>
                  <div>
                    <h2>Link activity</h2>
                    <span>
                      Last 7 days · UTC. Unique IPs exclude unknown addresses.
                    </span>
                  </div>
                </div>
                <div className={s.detailStats}>
                  <div>
                    <MousePointer2 size={17} />
                    <span>Total visits</span>
                    <strong>
                      {stats?.totalVisits.toLocaleString() ?? "—"}
                    </strong>
                  </div>
                  <div>
                    <Users size={17} />
                    <span title="Unknown addresses are excluded">
                      Unique IPs
                    </span>
                    <strong>
                      {stats?.uniqueVisitors.toLocaleString() ?? "—"}
                    </strong>
                  </div>
                </div>
                <div
                  className={s.chart}
                  role="img"
                  aria-label={`Daily visits for the last seven days. ${stats?.daily.map((day) => `${day.date}: ${day.visits}`).join(", ") ?? "Loading"}`}
                >
                  <div className={s.chartGrid} />
                  {stats?.daily.map((day) => (
                    <div className={s.chartColumn} key={day.date}>
                      <span className={s.barValue}>{day.visits}</span>
                      <div
                        className={s.bar}
                        style={{
                          height: `${Math.max(2, (day.visits / peak) * 112)}px`,
                        }}
                        title={`${day.date}: ${day.visits} visits`}
                      />
                      <span>
                        {new Date(`${day.date}T12:00:00Z`).toLocaleDateString(
                          undefined,
                          { weekday: "short", timeZone: "UTC" },
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="mt-6 gap-0 overflow-hidden py-0">
                <div className={s.tableToolbar}>
                  <div>
                    <h2>Recent visits</h2>
                  </div>
                  <Badge variant="secondary">{stats?.totalRows ?? 0}</Badge>
                </div>
                <div>
                  <Table className="text-xs [&_th]:px-4 [&_th]:text-[10px] [&_th]:tracking-wider [&_td]:px-4 [&_td]:py-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>VISITOR ID</TableHead>
                        <TableHead className="hidden md:table-cell">
                          LOCATION
                        </TableHead>
                        <TableHead>TIME · UTC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.visits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className={s.mono}>
                            {visit.visitor ?? "Unknown"}
                            <details className={s.visitDetails}>
                              <summary>Browser &amp; location</summary>
                              <p>
                                Location:{" "}
                                {[visit.city, visit.country]
                                  .filter(Boolean)
                                  .join(", ") || "Unknown"}
                              </p>
                              <p>Browser: {visit.userAgent || "Unknown"}</p>
                            </details>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {[visit.city, visit.country]
                              .filter(Boolean)
                              .join(", ") || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <time
                              className={s.timestamp}
                              dateTime={visit.createdAt}
                              title={visit.createdAt}
                            >
                              {new Date(visit.createdAt)
                                .toISOString()
                                .replace("T", " ")
                                .slice(0, 19)}
                            </time>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {stats && !stats.visits.length && (
                  <div className={s.empty}>
                    <MousePointer2 size={24} />
                    <h3>No visits yet</h3>
                    <p>Visits will appear here after the link is opened.</p>
                  </div>
                )}
                {stats && (
                  <Pagination
                    page={page}
                    total={stats.totalRows}
                    pageSize={stats.pageSize}
                    onChange={setPage}
                  />
                )}
              </Card>
            </div>
            <div className={s.qrColumn}>
              <QrStudio
                shortUrl={shortUrl}
                linkKey={link.key}
                config={link.qrConfig}
                onSave={(config) => setLink({ ...link, qrConfig: config })}
              />
            </div>
          </div>
        </>
      )}
      {dialog === "edit" && link && (
        <Modal
          title="Edit link"
          description="Keep your destination up to date."
          onClose={() => setDialog(null)}
        >
          <LinkForm
            link={link}
            origin={origin}
            onCancel={() => setDialog(null)}
            onSaved={(updated) => {
              setLink(updated);
              setDialog(null);
              if (updated.key !== link.key)
                router.replace(`/admin/${encodeURIComponent(updated.key)}`);
            }}
          />
        </Modal>
      )}
      {dialog === "delete" && link && (
        <Modal
          title="Delete this link?"
          description="This short URL will stop working. Its visit history and QR settings will also be permanently deleted."
          onClose={() => setDialog(null)}
        >
          <div className={s.deletePreview}>{shortUrl}</div>
          <div className={s.formActions}>
            <Button variant="outline" size="sm" onClick={() => setDialog(null)}>
              Keep link
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={remove}
            >
              {deleting ? "Deleting…" : "Delete link"}
            </Button>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}
