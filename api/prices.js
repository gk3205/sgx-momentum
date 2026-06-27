// api/prices.js — Vercel Serverless Function
// Uses Node.js built-in https — zero npm dependencies, no import issues
// Handles Yahoo Finance cookie/crumb session server-side

const https = require("https");

// ── Helpers ──────────────────────────────────────────────────────────────────
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        ...headers,
      },
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

// ── Get Yahoo Finance session cookie + crumb ──────────────────────────────────
let _cachedCookies = null;
let _cachedCrumb   = null;
let _cacheTime     = 0;

async function getYahooSession() {
  // Cache for 30 minutes
  if (_cachedCrumb && Date.now() - _cacheTime < 30 * 60 * 1000) {
    return { cookies: _cachedCookies, crumb: _cachedCrumb };
  }

  // Step 1: Hit Yahoo Finance homepage to get session cookies
  const homeResp = await httpsGet("https://finance.yahoo.com/");
  const rawCookies = homeResp.headers["set-cookie"] || [];
  const cookies = rawCookies
    .map(c => c.split(";")[0])
    .join("; ");

  // Step 2: Get crumb using session cookies
  const crumbResp = await httpsGet(
    "https://query2.finance.yahoo.com/v1/test/getcrumb",
    { Cookie: cookies }
  );

  if (crumbResp.status !== 200 || !crumbResp.body || crumbResp.body.length < 2) {
    throw new Error(`Crumb fetch failed: ${crumbResp.status} ${crumbResp.body}`);
  }

  _cachedCookies = cookies;
  _cachedCrumb   = crumbResp.body.trim();
  _cacheTime     = Date.now();

  console.log(`[prices] New session: crumb=${_cachedCrumb}`);
  return { cookies, crumb: _cachedCrumb };
}

// ── Fetch price history for one ticker ───────────────────────────────────────
const WINDOWS = { w1: 5, m1: 21, m3: 63, m6: 126 };

async function getReturns(ticker, cookies, crumb) {
  const symbol  = ticker === "STI" ? "%5ESTI" : encodeURIComponent(ticker);
  const period1 = Math.floor((Date.now() - 210 * 24 * 60 * 60 * 1000) / 1000);
  const period2 = Math.floor(Date.now() / 1000);
  const url     = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}` +
                  `?interval=1d&period1=${period1}&period2=${period2}&crumb=${crumb}`;

  try {
    const resp = await httpsGet(url, { Cookie: cookies });

    if (resp.status === 401 || resp.status === 403) {
      // Session expired — clear cache and signal retry needed
      _cachedCrumb = null;
      throw new Error(`Auth error ${resp.status}`);
    }

    if (resp.status !== 200) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data   = JSON.parse(resp.body);
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error("No chart result");

    const closes = (result.indicators?.adjclose?.[0]?.adjclose ||
                    result.indicators?.quote?.[0]?.close || [])
                    .filter(c => c != null && !isNaN(c) && c > 0);

    if (closes.length < 5) throw new Error(`Only ${closes.length} data points`);

    const last = closes[closes.length - 1];
    const ret  = (days) => {
      if (closes.length <= days) return null;
      const base = closes[closes.length - 1 - days];
      return base ? parseFloat(((last - base) / base * 100).toFixed(2)) : null;
    };

    return { w1: ret(WINDOWS.w1), m1: ret(WINDOWS.m1), m3: ret(WINDOWS.m3), m6: ret(WINDOWS.m6) };
  } catch (e) {
    console.error(`[prices] ${ticker}: ${e.message}`);
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: "tickers param required" });

  const list = tickers.split(",").map(t => t.trim()).filter(Boolean).slice(0, 25);
  if (list.length === 0) return res.status(400).json({ error: "empty ticker list" });

  console.log(`[prices] Request: ${list.join(", ")}`);

  // Get session (cached across warm invocations)
  let session;
  try {
    session = await getYahooSession();
  } catch (e) {
    console.error(`[prices] Session error: ${e.message}`);
    return res.status(503).json({ error: `Yahoo Finance session failed: ${e.message}` });
  }

  // Fetch all tickers in parallel
  const entries = await Promise.all(
    list.map(async (ticker) => {
      const returns = await getReturns(ticker, session.cookies, session.crumb);
      return [ticker, returns];
    })
  );

  const result = Object.fromEntries(entries);
  const ok     = Object.values(result).filter(v => v !== null).length;
  console.log(`[prices] Done: ${ok}/${list.length} succeeded`);

  return res.status(200).json(result);
};
