// api/prices.js — Vercel Serverless Function (ESM)
// Uses yahoo-finance2 which handles Yahoo Finance auth internally
// ESM imports required because package.json has "type":"module"

import yahooFinance from "yahoo-finance2";

const WINDOWS = { w1: 5, m1: 21, m3: 63, m6: 126 };

async function getReturns(ticker) {
  const symbol = ticker === "STI" ? "^STI" : ticker;
  try {
    const now    = new Date();
    const from   = new Date(now.getTime() - 210 * 24 * 60 * 60 * 1000);

    const chart  = await yahooFinance.chart(symbol, {
      period1:  from,
      period2:  now,
      interval: "1d",
    });

    const quotes = chart?.quotes;
    if (!quotes || quotes.length < 5) {
      console.log(`[prices] ${ticker}: only ${quotes?.length ?? 0} quotes`);
      return null;
    }

    const closes = quotes
      .map(q => q.adjclose ?? q.close)
      .filter(c => c != null && !isNaN(c) && c > 0);

    if (closes.length < 5) {
      console.log(`[prices] ${ticker}: only ${closes.length} valid closes`);
      return null;
    }

    const last = closes[closes.length - 1];
    const ret  = days => {
      if (closes.length <= days) return null;
      const base = closes[closes.length - 1 - days];
      return base ? parseFloat(((last - base) / base * 100).toFixed(2)) : null;
    };

    const result = {
      w1: ret(WINDOWS.w1),
      m1: ret(WINDOWS.m1),
      m3: ret(WINDOWS.m3),
      m6: ret(WINDOWS.m6),
    };
    console.log(`[prices] ${ticker}: OK w1=${result.w1} m1=${result.m1} m3=${result.m3} m6=${result.m6}`);
    return result;

  } catch (e) {
    console.error(`[prices] ${ticker}: ${e.message}`);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: "tickers param required" });

  const list = tickers.split(",").map(t => t.trim()).filter(Boolean).slice(0, 25);
  if (!list.length) return res.status(400).json({ error: "empty list" });

  console.log(`[prices] Fetching ${list.length}: ${list.join(", ")}`);

  // Parallel fetch — yahoo-finance2 handles auth internally
  const entries = await Promise.all(
    list.map(async ticker => [ticker, await getReturns(ticker)])
  );

  const result = Object.fromEntries(entries);
  const ok     = Object.values(result).filter(v => v !== null).length;
  console.log(`[prices] Done: ${ok}/${list.length} succeeded`);

  return res.status(200).json(result);
}
