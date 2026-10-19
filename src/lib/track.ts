// Métricas anônimas do site: sem cookies, sem IP, sem dados pessoais.
// O "sessionId" é aleatório e vive só enquanto a aba estiver aberta.

export const IGNORE_METRICS_KEY = "suh:ignorar-metricas";

type TrackEvent =
  | { type: "page_view" }
  | { type: "product_view"; productId: string }
  | { type: "whatsapp_click"; productId?: string; palette?: string; quantity?: number };

function sessionId() {
  try {
    let id = sessionStorage.getItem("suh:sessao");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("suh:sessao", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function referrerSource() {
  try {
    if (!document.referrer) return undefined;
    const host = new URL(document.referrer).hostname;
    if (host === location.hostname) return undefined;
    return host.replace(/^(www|m|l|lm)\./, "");
  } catch {
    return undefined;
  }
}

function ignored() {
  try {
    return localStorage.getItem(IGNORE_METRICS_KEY) === "1";
  } catch {
    return false;
  }
}

export function track(event: TrackEvent) {
  if (typeof window === "undefined" || ignored()) return;
  const payload = JSON.stringify({
    ...event,
    sessionId: sessionId(),
    referrer: event.type === "page_view" ? referrerSource() : undefined,
    device: matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
  });
  const blob = new Blob([payload], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}
