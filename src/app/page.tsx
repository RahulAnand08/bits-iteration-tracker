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
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-black">
          BITS Admission Tracker
        </h1>

        <p className="text-gray-500 mt-2">
          Official Website Monitoring
        </p>

        <hr className="my-6"/>

        <h2 className="text-xl font-semibold text-black text-center">
          Latest Update
        </h2>

        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <>
            <div className="mt-4 text-2xl font-bold text-black">
              {update?.notice ?? "No updates found"}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-black">
                Last Checked
              </h3>

              <p className="text-gray-600">
                {update
                  ? new Date(update.scrapedAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-black">
                Status
              </h3>

              <p className="text-green-600 font-medium">
                Monitoring every 5 minutes
              </p>
            </div>

            <button
                onClick={subscribeToPush}
                className="..."
            >
                Enable Notifications
            </button>
          </>
        )}
      </div>
    </main>
  );
}