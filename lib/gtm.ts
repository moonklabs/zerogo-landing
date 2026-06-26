type GtmPrimitive = string | number | boolean | null | undefined;

export type GtmEventPayload = Record<string, GtmPrimitive>;

declare global {
  interface Window {
    dataLayer?: GtmEventPayload[];
  }
}

export function gtmId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  if (!id) return undefined;
  return /^GTM-[A-Z0-9]+$/.test(id) ? id : undefined;
}

export function pushGtmEvent(
  event: string,
  payload: GtmEventPayload = {}
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}
