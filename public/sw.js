self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    console.error("Failed to parse push payload", err);
  }


  event.waitUntil(
    self.registration.showNotification(
      data.title || "BITS Admission Tracker",
      {
        body: data.body || "No body",
        icon: "/icon.png",
        badge: "/icon.png",
        data: {
          url: data.url || "/",
        },
      }
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});