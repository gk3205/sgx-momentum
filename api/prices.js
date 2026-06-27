// api/prices.js — Vercel Serverless Function (ESM)
// Uses Yahoo Finance Spark API: fetches ALL tickers in 4-5 bulk calls
// instead of 70 individual calls — eliminates rate limiting entirely

import https from "https";

const WINDOWS = { w1: 5, m1: 21, m3: 63, m6: 126 };
const sleep   = ms => new Promise(r => setTimeout(r, ms));

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

// ── Bulk fetch via Yahoo Finance Spark API ────────────────────────────────────
// One call returns data for up to 20 tickers simultaneously
// Range=1y gives us enough history to compute 1W/1M/3M/6M returns
async function fetchBulk(symbols) {
  const sym = symbols.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/spark` +
              `?symbols=${encodeURIComponent(sym)}&range=1y&interval=1d`;

  const resp = await get(url);
  if (resp.status !== 200) {
    throw new Error(`Spark API ${resp.status}: ${resp.body.slice(0, 100)}`);
  }

  const data   = JSON.parse(resp.body);
  const result = data?.spark?.result ?? [];

  const out = {};
  for (const item of result) {
    const sym    = item.symbol;
    const series = item.response?.[0];
    if (!series) { out[sym] = null; continue; }

    const closes = (series.indicators?.quote?.[0]?.close ?? [])
      .filter(c => c != null && !isNaN(c) && c > 0);

    if (closes.length < 5) { out[sym] = null; continue; }

    const last = closes[closes.length - 1];
    const ret  = days => {
      if (closes.length <= days) return null;
      const base = closes[closes.length - 1 - days];
      return base ? parseFloat(((last - base) / base * 100).toFixed(2)) : null;
    };

    out[sym] = {
      w1: ret(WINDOWS.w1),
      m1: ret(WINDOWS.m1),
      m3: ret(WINDOWS.m3),
      m6: ret(WINDOWS.m6),
    };
    console.log(`[prices] ${sym}: w1=${out[sym].w1} m1=${out[sym].m1} m3=${out[sym].m3} m6=${out[sym].m6}`);
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

  // Map STI to Yahoo Finance symbol
  const list = tickers.split(",")
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t === "STI" ? "^STI" : t);

  if (!list.length) return res.status(400).json({ error: "empty list" });

  // Chunk into groups of 20 — Spark API handles 20 symbols per call
  const CHUNK = 20;
  const chunks = [];
  for (let i = 0; i < list.length; i += CHUNK) chunks.push(list.slice(i, i + CHUNK));

  console.log(`[prices] ${list.length} tickers in ${chunks.length} bulk Spark API calls`);

  const combined = {};
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await sleep(1000); // 1s between bulk calls (only 4-5 calls total)
    try {
      const batchResult = await fetchBulk(chunks[i]);
      Object.assign(combined, batchResult);
    } catch (e) {
      console.error(`[prices] Chunk ${i+1} failed: ${e.message}`);
      // Mark all tickers in this chunk as null
      chunks[i].forEach(s => { combined[s] = null; });
    }
  }

  // Remap ^STI back to STI for frontend
  if ("^STI" in combined) {
    combined["STI"] = combined["^STI"];
    delete combined["^STI"];
  }

  const ok = Object.values(combined).filter(v => v !== null).length;
  console.log(`[prices] Done: ${ok}/${list.length} OK`);
  return res.status(200).json(combined);
}