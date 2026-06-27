// Vercel Serverless Function: /api/prices.js
// Called by the React frontend as: GET /api/prices?tickers=D05.SI,O39.SI,^STI
// Runs server-side on Vercel — no CORS issues, Yahoo Finance works perfectly

import yahooFinance from "yahoo-finance2";

// Trading day lookback windows
const WINDOWS = { w1: 5, m1: 21, m3: 63, m6: 126 };

async function getReturns(ticker) {
  try {
    // Fetch 1 year of daily history
    const yTicker = ticker === "STI" ? "^STI" : ticker;
    const result  = await yahooFinance.historical(yTicker, {
      period1: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // ~400 days ago
      period2: new Date(),
      interval: "1d",
    });

    if (!result || result.length < 5) return null;

    // Use adjusted close prices, filter nulls
    const closes = result
      .map(r => r.adjClose ?? r.close)
      .filter(c => c != null && !isNaN(c));

    if (closes.length < 5) return null;

    const last = closes[closes.length - 1];
    const ret  = days => {
      if (closes.length <= days) return null;
      const base = closes[closes.length - 1 - days];
      return base ? parseFloat(((last - base) / base * 100).toFixed(2)) : null;
    };

    return {
      w1: ret(WINDOWS.w1),
      m1: ret(WINDOWS.m1),
      m3: ret(WINDOWS.m3),
      m6: ret(WINDOWS.m6),
    };
  } catch (e) {
    return null; // ticker not found or API error
  }
}

export default async function handler(req, res) {
  // CORS headers so the React frontend can call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600"); // cache 1hr on Vercel CDN

  if (req.method === "OPTIONS") return res.status(200).end();

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: "tickers param required" });

  const tickerList = tickers.split(",").map(t => t.trim()).filter(Boolean);
  if (tickerList.length === 0) return res.status(400).json({ error: "empty ticker list" });

  // Fetch all tickers in parallel (server-side, no rate limit concerns)
  const entries = await Promise.all(
    tickerList.map(async ticker => {
      const returns = await getReturns(ticker);
      return [ticker, returns];
    })
  );

  const result = Object.fromEntries(entries);
  return res.status(200).json(result);
}
