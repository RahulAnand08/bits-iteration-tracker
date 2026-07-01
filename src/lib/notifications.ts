import webpush from "web-push";
import { prisma } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(title: string, body: string) {
  const subscribers = await prisma.subscriber.findMany();

  const payload = JSON.stringify({
    title,
    body,
    url: "/",
  });

  for (const subscriber of subscribers) {
    try {
			const result = await webpush.sendNotification(
			{
					endpoint: subscriber.endpoint,
					keys: {
					p256dh: subscriber.p256dh,
					auth: subscriber.auth,
					},
			},
			payload
			);


    } catch (err: any) {
      console.error(`❌ Failed for ${subscriber.endpoint}`, err);

      // Remove expired subscriptions
      if (err.statusCode === 404 || err.statusCode === 410) {
        await prisma.subscriber.delete({
          where: {
            endpoint: subscriber.endpoint,
          },
        });

        ("🗑 Removed expired subscription");
      }
    }
  }
}