-- CreateTable
CREATE TABLE "Update" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "notice" TEXT NOT NULL,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Update_notice_key" ON "Update"("notice");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_endpoint_key" ON "Subscriber"("endpoint");
