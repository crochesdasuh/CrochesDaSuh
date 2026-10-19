"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

let tracked = false;

export default function PageViewTracker() {
  useEffect(() => {
    // Evita contar duas vezes no StrictMode (dev) e em re-montagens.
    if (tracked) return;
    tracked = true;
    track({ type: "page_view" });
  }, []);
  return null;
}
