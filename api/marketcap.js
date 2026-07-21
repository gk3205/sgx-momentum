// api/marketcap.js — Vercel Serverless Function (ESM)
// Bulk market-cap lookup via Yahoo Finance quote API.
//
// v7/finance/quote now requires a session cookie + "crumb" token (Yahoo
// tightened this in 2024 — unauthenticated calls return an empty/blocked
// response). This function fetches the cookie+crumb once per invocation,
// then reuses them across all ticker chunks in that call.
//
// Chunk size kept at 10 symbols/call — same conservative size validated
// as reliable for api/prices.js (20-symbol batches were observed to
// silently fail/timeout on Vercel's free-tier execution limit).

import https from "https";

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── HTTP helper — returns status, headers, and body ───────────────────────────
function request(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
        ...headers,
      }
    }, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString()
      }));
    }).on("error", reject);
  });
}

// ── Get session cookie + crumb (required by v7/finance/quote) ────────────────
async function getCookieAndCrumb() {
  // Step 1: hit a Yahoo page to receive session cookies
  const cookieResp = await request("https://fc.yahoo.com");
  const setCookie = cookieResp.headers["set-cookie"];
  if (!setCookie || !setCookie.length) {
    throw new Error("No cookie received from Yahoo");
  }
  const cookie = setCookie.map(c => c.split(";")[0]).join("; ");

  // Step 2: use the cookie to fetch a crumb
  const crumbResp = await request("https://query2.finance.yahoo.com/v1/test/getcrumb", { Cookie: cookie });
  if (crumbResp.status !== 200 || !crumbResp.body || crumbResp.body.includes("<html")) {
    throw new Error(`Crumb fetch failed: ${crumbResp.status} ${crumbResp.body.slice(0, 100)}`);
  }
  return { cookie, crumb: crumbResp.body.trim() };
}

// ── Bulk fetch via Yahoo Finance quote API ────────────────────────────────────
async function fetchBulkQuote(symbols, cookie, crumb) {
  const sym = symbols.join(",");
  const url = `https://query2.finance.yahoo.com/v7/finance/quote` +
              `?symbols=${encodeURIComponent(sym)}&fields=marketCap,currency,regularMarketPrice,shortName` +
              `&crumb=${encodeURIComponent(crumb)}`;

  const resp = await request(url, { Cookie: cookie });
  if (resp.status !== 200) {
    throw new Error(`Quote API ${resp.status}: ${resp.body.slice(0, 150)}`);
  }

  const data   = JSON.parse(resp.body);
  const result = data?.quoteResponse?.result ?? [];

  const out = {};
  for (const item of result) {
    out[item.symbol] = {
      mktCapM: item.marketCap != null ? +(item.marketCap / 1e6).toFixed(2) : null,
      currency: item.currency ?? null,
      name: item.shortName ?? null,
    };
    console.log(`[marketcap] ${item.symbol}: ${out[item.symbol].mktCapM}M ${out[item.symbol].currency}`);
  }
  return out;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: "tickers param required" });

  const list = tickers.split(",").map(t => t.trim()).filter(Boolean);
  if (!list.length) return res.status(400).json({ error: "empty list" });

  let cookie, crumb;
  try {
    ({ cookie, crumb } = await getCookieAndCrumb());
  } catch (e) {
    console.error(`[marketcap] cookie/crumb fetch failed: ${e.message}`);
    return res.status(502).json({ error: `Auth failed: ${e.message}` });
  }

  const CHUNK = 10;
  const chunks = [];
  for (let i = 0; i < list.length; i += CHUNK) chunks.push(list.slice(i, i + CHUNK));

  console.log(`[marketcap] ${list.length} tickers in ${chunks.length} bulk quote calls`);

  const combined = {};
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await sleep(1000);
    try {
      const batchResult = await fetchBulkQuote(chunks[i], cookie, crumb);
      Object.assign(combined, batchResult);
      chunks[i].forEach(s => { if (!(s in combined)) combined[s] = null; });
    } catch (e) {
      console.error(`[marketcap] Chunk ${i+1} failed: ${e.message}`);
      chunks[i].forEach(s => { combined[s] = null; });
    }
  }

  const ok = Object.values(combined).filter(v => v !== null).length;
  console.log(`[marketcap] Done: ${ok}/${list.length} OK`);
  return res.status(200).json(combined);
}
