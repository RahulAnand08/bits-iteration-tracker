"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push";

type Update = {
  notice: string;
  scrapedAt: string;
};

export default function Home() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadLatest() {
    try {
      const res = await fetch("/api/latest", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setUpdate(data);
    } catch (err) {
      console.error("loadLatest failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatest();

    // Refresh every 30 seconds
    const interval = setInterval(loadLatest, 30000);

    return () => clearInterval(interval);
  }, []);

  const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator)) {
    alert("Service Workers are not supported.");
    return;
  }

  if (!("PushManager" in window)) {
    alert("Push notifications are not supported.");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    alert("Notification permission denied.");
    return;
  }

  // Register the service worker (safe to call multiple times)
  await navigator.serviceWorker.register("/sw.js");

  // Wait until it's active and controlling the page
  const registration = await navigator.serviceWorker.ready;

  // Reuse an existing subscription if there is one
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
  }

  const response = await fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });

  const data = await response.json();

  if (data.success) {
    alert("Notifications enabled!");
  } else {
    alert("Failed to subscribe.");
  }
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070c] flex justify-center items-center p-6">
      {/* Ambient background layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(#7c6fff 1px, transparent 1px), linear-gradient(90deg, #7c6fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden="true"
        className="signal-blob pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-violet-600/25 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="signal-blob-alt pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-cyan-500/20 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05070c_78%)]"
      />

      {/* Console card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_80px_-25px_rgba(124,111,255,0.45)] p-8 sm:p-10 overflow-hidden">
        <div aria-hidden="true" className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/10 to-transparent" />

        <div className="relative flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="dot-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="font-mono text-[11px] tracking-[0.25em] text-cyan-300/80 uppercase">
              Signal Monitor
            </span>
          </div>
          <span className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
            BITS · Live
          </span>
        </div>

        <h1 className="relative text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-violet-200 to-cyan-300 bg-clip-text text-transparent">
          BITS Admission Tracker
        </h1>

        <p className="relative mt-3 font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
          Official Website Monitoring
        </p>

        <div className="relative my-8 h-px w-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

        {loading ? (
          <div className="relative space-y-4">
            <div className="skeleton-pulse h-3 w-32 rounded bg-white/10" />
            <div className="skeleton-pulse h-24 w-full rounded-2xl bg-white/[0.05]" />
            <div className="grid grid-cols-2 gap-6">
              <div className="skeleton-pulse h-8 w-full rounded bg-white/[0.05]" />
              <div className="skeleton-pulse h-8 w-full rounded bg-white/[0.05]" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 text-violet-300"
                fill="currentColor"
              >
                <rect x="1" y="9" width="3" height="6" rx="0.5" />
                <rect x="6.5" y="5" width="3" height="10" rx="0.5" />
                <rect x="12" y="1" width="3" height="14" rx="0.5" />
              </svg>
              <h2 className="font-mono text-xs tracking-[0.25em] text-white/50 uppercase">
                Latest Update
              </h2>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-black/40 p-6 overflow-hidden">
              <div aria-hidden="true" className="scan-sweep-fast pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-violet-300/10 to-transparent" />
              <p className="relative text-xl sm:text-2xl font-semibold text-white leading-snug">
                {update?.notice ?? "No updates found"}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-1">
                  Last Checked
                </h3>
                <p className="font-mono text-sm text-white/70 tabular-nums">
                  {update
                    ? new Date(update.scrapedAt).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div>
                <h3 className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-1">
                  Status
                </h3>
                <p className="flex items-center gap-2 text-sm text-emerald-300 font-medium">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="dot-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Monitoring every minute. Last checked is sometimes the last update recieved.
                </p>
              </div>
            </div>

            <button
              onClick={subscribeToPush}
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-gradient-to-r from-violet-500/10 to-cyan-400/10 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase text-violet-200 transition-all duration-300 hover:text-white hover:border-violet-300/60 hover:shadow-[0_0_25px_-5px_rgba(124,111,255,0.6)]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-current transition-transform duration-300 group-hover:-rotate-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              Enable Notifications
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes signal-blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, -18px) scale(1.08); }
        }
        @keyframes signal-blob-float-alt {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 18px) scale(1.06); }
        }
        @keyframes scan-sweep-move {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(340%); opacity: 0; }
        }
        @keyframes scan-sweep-move-fast {
          0% { transform: translateY(-100%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(220%); opacity: 0; }
        }
        @keyframes dot-ping-soft {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes skeleton-pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .signal-blob { animation: signal-blob-float 10s ease-in-out infinite; }
        .signal-blob-alt { animation: signal-blob-float-alt 12s ease-in-out infinite; }
        .scan-sweep { animation: scan-sweep-move 6s linear infinite; }
        .scan-sweep-fast { animation: scan-sweep-move-fast 3.4s linear infinite; }
        .dot-ping { animation: dot-ping-soft 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .skeleton-pulse { animation: skeleton-pulse-soft 1.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .signal-blob,
          .signal-blob-alt,
          .scan-sweep,
          .scan-sweep-fast,
          .dot-ping,
          .skeleton-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
