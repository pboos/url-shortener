"use client";

import { Download, QrCode, Upload } from "lucide-react";
import type QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { defaultQr, qrPatterns } from "@/lib/qr";
import type { QrConfig } from "@/lib/contracts";
import { resizeLogo } from "./logo";
import s from "./qr-studio.module.css";

export function QrStudio({
  shortUrl,
  linkKey,
  config,
  onSave,
}: {
  shortUrl: string;
  linkKey: string;
  config: QrConfig | null;
  onSave?: (config: QrConfig) => void;
}) {
  const [style, setStyle] = useState(config ?? defaultQr);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [format, setFormat] = useState<"svg" | "png">("svg");
  const preview = useRef<HTMLDivElement>(null);
  const logoUpload = useRef<HTMLInputElement>(null);
  const generator = useRef<QRCodeStyling | null>(null);
  const remoteLogo = style.logo?.startsWith("https://") ? style.logo : null;

  useEffect(() => {
    let active = true;
    const host = preview.current;
    async function render() {
      const { default: QRCode } = await import("qr-code-styling");
      if (!active || !host) return;
      const withLogo = style.logo?.startsWith("data:") === true;
      const code = new QRCode({
        width: 1024,
        height: 1024,
        type: "svg",
        data: shortUrl,
        margin: 144,
        qrOptions: { errorCorrectionLevel: withLogo ? "H" : "Q" },
        dotsOptions: { type: style.pattern, color: style.ink },
        cornersSquareOptions: {
          type: ["square", "dots"].includes(style.pattern)
            ? "square"
            : "extra-rounded",
          color: style.ink,
        },
        cornersDotOptions: { type: "square", color: style.ink },
        backgroundOptions: { color: style.paper },
        ...(withLogo && style.logo
          ? {
              image: style.logo,
              imageOptions: { imageSize: 0.29, margin: 4, saveAsBlob: true },
            }
          : {}),
      });
      host.replaceChildren();
      code.append(host);
      generator.current = code;
    }
    render().catch(() => {
      if (active) setError("Could not generate the QR code for this URL.");
    });
    return () => {
      active = false;
      generator.current = null;
      host?.replaceChildren();
    };
  }, [shortUrl, style]);

  function change(next: Partial<QrConfig>) {
    setStyle((prev) => ({ ...prev, ...next }));
    setMessage("");
    setError("");
  }
  async function act(operation: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await operation();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    const result = await fetch(`/api/links/${encodeURIComponent(linkKey)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrConfig: style }),
    });
    if (!result.ok)
      throw new Error(
        (await result.json()).error ?? "Could not save this design.",
      );
    onSave?.(style);
    setMessage("Design saved.");
  }

  return (
    <Card className={s.panel} role="region" aria-labelledby="qr-heading">
      <CardHeader>
        <CardTitle>
          <h2 id="qr-heading" className={s.heading}>
            <QrCode size={18} aria-hidden /> QR code
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={s.preview}
          ref={preview}
          role="img"
          aria-label={`QR code for ${shortUrl}`}
        />
        <fieldset disabled={busy} className={s.controls}>
          <div className={s.field}>
            <Label htmlFor="qr-dot-style">Dot style</Label>
            <NativeSelect
              id="qr-dot-style"
              value={style.pattern}
              onChange={(e) => {
                const pattern = qrPatterns.find((p) => p === e.target.value);
                if (pattern) change({ pattern });
              }}
            >
              {qrPatterns.map((p) => (
                <NativeSelectOption key={p} value={p}>
                  {p[0].toUpperCase() + p.slice(1).replace("-", " ")}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className={s.colors}>
            {(["ink", "paper"] as const).map((key) => (
              <div key={key} className={s.field}>
                <Label htmlFor={`qr-${key}`}>
                  {key === "ink" ? "Foreground" : "Background"}
                </Label>
                <span className={s.colorValue}>
                  <Input
                    id={`qr-${key}`}
                    type="color"
                    value={style[key]}
                    onChange={(e) => change({ [key]: e.target.value })}
                  />
                  <small>{style[key].toUpperCase()}</small>
                </span>
              </div>
            ))}
          </div>
          <div className={s.logo}>
            <Button
              type="button"
              variant="outline"
              onClick={() => logoUpload.current?.click()}
            >
              <Upload size={15} /> {style.logo ? "Replace logo" : "Add logo"}
            </Button>
            <Input
              ref={logoUpload}
              hidden
              aria-label="Upload logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file)
                  void act(async () =>
                    change({ logo: await resizeLogo(file) }),
                  );
              }}
            />
            {style.logo && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => change({ logo: null })}
              >
                Remove logo
              </Button>
            )}
          </div>
          {remoteLogo && (
            <p>
              Upload a copy of your{" "}
              <a href={remoteLogo} target="_blank" rel="noreferrer">
                saved logo
              </a>{" "}
              to include it in the download.
            </p>
          )}
          <Button type="button" onClick={() => void act(save)}>
            Save design
          </Button>
          <div className={s.export}>
            <NativeSelect
              aria-label="Download format"
              value={format}
              onChange={(e) =>
                setFormat(e.target.value === "png" ? "png" : "svg")
              }
            >
              <NativeSelectOption value="svg">SVG</NativeSelectOption>
              <NativeSelectOption value="png">PNG</NativeSelectOption>
            </NativeSelect>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void act(async () => {
                  if (!generator.current)
                    throw new Error("The preview is still loading.");
                  await generator.current.download({
                    name: linkKey,
                    extension: format,
                  });
                })
              }
            >
              <Download size={15} /> Download
            </Button>
          </div>
        </fieldset>
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        <span className={s.feedback} role="status">
          {message}
        </span>
      </CardContent>
    </Card>
  );
}
