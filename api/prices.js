// api/prices.js — Vercel Serverless Function
// CommonJS format (required when package.json has "type":"module" + Vercel API routes)
// Fetches Yahoo Finance price history server-side via yahoo-finance2

const yahooFinance = require("yahoo-finance2").default;

// How many trading days back for each period
const WINDOWS = { w1: 5, m1: 21, m3: 63, m6: 126 };

async function getReturns(ticker) {
  const symbol = ticker === "STI" ? "^STI" : ticker;
  try {
    // Use chart() — more reliable than historical() for SGX tickers
    const now   = new Date();
    const from  = new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000); // 200 days back

    const chart = await yahooFinance.chart(symbol, {
      period1: from,
      period2: now,
      interval: "1d",
    });

    const quotes = chart?.quotes;
    if (!quotes || quotes.length < 5) return null;

    // Extract valid closes (adjclose preferred, fallback to close)
    const closes = quotes
      .map(q => q.adjclose ?? q.close)
      .filter(c => c != null && !isNaN(c) && c > 0);

    if (closes.length < 5) return null;

    const last = closes[closes.length - 1];
    const ret  = (days) => {
      if (closes.length <= days) return null;
      const base = closes[closes.length - 1 - days];
      if (!base || base === 0) return null;
      return parseFloat(((last - base) / base * 100).toFixed(2));
    };

    return {
      w1: ret(WINDOWS.w1),
      m1: ret(WINDOWS.m1),
      m3: ret(WINDOWS.m3),
      m6: ret(WINDOWS.m6),
    };
  } catch (err) {
    // Log error detail for Vercel function logs
    console.error(`[prices] ${symbol}: ${err.message}`);
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: "tickers param required" });

  const list = tickers.split(",").map(t => t.trim()).filter(Boolean).slice(0, 30);
  if (list.length === 0) return res.status(400).json({ error: "empty ticker list" });

  console.log(`[prices] fetching ${list.length} tickers: ${list.join(", ")}`);

  // Fetch all tickers in parallel — server-side has no CORS or rate limit issues
  const entries = await Promise.all(
    list.map(async (ticker) => {
      const returns = await getReturns(ticker);
      return [ticker, returns];
    })
  );

  const result = Object.fromEntries(entries);
  const successCount = Object.values(result).filter(v => v !== null).length;
  console.log(`[prices] done: ${successCount}/${list.length} succeeded`);

  return res.status(200).json(result);
};
