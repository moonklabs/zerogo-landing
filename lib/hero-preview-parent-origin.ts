export function configuredPreviewParentOrigins(value: string | undefined): string[] {
  const origins = new Set<string>();
  for (const candidate of (value ?? "").split(",")) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "https:" && parsed.pathname === "/" && !parsed.search && !parsed.hash && !parsed.username && !parsed.password) {
        origins.add(parsed.origin);
      }
    } catch {
      // Invalid entries remain disabled instead of weakening the framing policy.
    }
  }
  return [...origins];
}

export function allowedPreviewParentOrigin(value: string | undefined): string | null {
  if (!value) return null;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.username || parsed.password) return null;
  const origin = parsed.origin;
  if (process.env.NODE_ENV === "development" && parsed.protocol === "http:" && (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost")) {
    return origin;
  }
  const configured = configuredPreviewParentOrigins(process.env.LANDING_PREVIEW_ALLOWED_ORIGINS);
  return configured.includes(origin) ? origin : null;
}
