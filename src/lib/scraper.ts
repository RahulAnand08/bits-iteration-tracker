import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

const URL = "https://admissions.bits-pilani.ac.in/FD/FD.html";

export async function getLatestNotice(): Promise<string> {
  const { data } = await axios.get(URL, {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Only because the BITS server's certificate chain is incomplete
    }),
    headers: {
      "User-Agent": "BITS Admission Tracker",
    },
  });

  const $ = cheerio.load(data);

  const notice = $("div.notice")
    .first()
    .find("h3")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  if (!notice) {
    throw new Error("Could not find first div.notice h3");
  }

  return notice;
}