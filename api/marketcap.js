// api/marketcap.js — Vercel Serverless Function (ESM)
// Bulk market-cap lookup via Yahoo Finance quote API.
// Mirrors api/prices.js's fetch/chunk/retry pattern so behaviour under
// Vercel's execution-time limits is consistent (10-symbol chunks — tested
// reliable; 20-symbol chunks were observed to silently fail/timeout).

import https from "https";

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── HTTP helper ───────────────────────────────────────────────────────────────
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    }, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        body: Buffer.concat(chunks).toString()
      }));
    }).on("error", reject);
  });
}

// ── Bulk fetch via Yahoo Finance quote API ────────────────────────────────────
// v7/finance/quote accepts a comma-separated symbol list and returns
// marketCap (in raw currency units, not millions) per symbol in one call.
async function fetchBulkQuote(symbols) {
  const sym = symbols.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote` +
              `?symbols=${encodeURIComponent(sym)}&fields=marketCap,currency,regularMarketPrice,shortName`;

  const resp = await get(url);
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

  // Chunk into groups of 10 (same conservative size validated for /api/prices)
  const CHUNK = 10;
  const chunks = [];
  for (let i = 0; i < list.length; i += CHUNK) chunks.push(list.slice(i, i + CHUNK));

  console.log(`[marketcap] ${list.length} tickers in ${chunks.length} bulk quote calls`);

  const combined = {};
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await sleep(1000); // 1s between bulk calls, same as prices.js
    try {
      const batchResult = await fetchBulkQuote(chunks[i]);
      Object.assign(combined, batchResult);
      chunks[i].forEach(s => { if (!(s in combined)) combined[s] = null; }); // missing symbols
    } catch (e) {
      console.error(`[marketcap] Chunk ${i+1} failed: ${e.message}`);
      chunks[i].forEach(s => { combined[s] = null; });
    }
  }

  const ok = Object.values(combined).filter(v => v !== null).length;
  console.log(`[marketcap] Done: ${ok}/${list.length} OK`);
  return res.status(200).json(combined);
}
