import { useState, useCallback, useRef } from "react";

// ─── HARDCODED UNIVERSE: SGD-only, >=200M mkt cap (Yahoo quote API, verified against full 606-stock reconciliation), 205 stocks, new Industry Sectors (21 Jul 2026) ───
const STOCK_UNIVERSE = [{"name":"AEM SGD","code":"AWX","ticker":"AWX.SI","sector":"Semiconductors","mktCapM":2927.06},{"name":"AIMS APAC Reit","code":"O5RU","ticker":"O5RU.SI","sector":"Real Estate","mktCapM":1367.33},{"name":"AMTD IDEA OV","code":"HKB","ticker":"HKB.SI","sector":"Financial Services","mktCapM":1987.42},{"name":"APAC Realty","code":"CLN","ticker":"CLN.SI","sector":"Real Estate","mktCapM":245.69},{"name":"ASL Marine","code":"A04","ticker":"A04.SI","sector":"Industrials","mktCapM":360.16},{"name":"Addvalue Tech","code":"A31","ticker":"A31.SI","sector":"Technology","mktCapM":545.14},{"name":"Alpha Integrated REIT","code":"M1GU","ticker":"M1GU.SI","sector":"Real Estate","mktCapM":573.78},{"name":"Aoxin Q & M","code":"1D4","ticker":"1D4.SI","sector":"Healthcare","mktCapM":295.05},{"name":"Aspial Corp","code":"A30","ticker":"A30.SI","sector":"Consumer Cyclical","mktCapM":310.18},{"name":"Aspial Lifestyle","code":"5UF","ticker":"5UF.SI","sector":"Consumer Cyclical","mktCapM":709.74},{"name":"Avarga Ltd","code":"X5N","ticker":"X5N.SI","sector":"Industrials","mktCapM":274.97},{"name":"AvePoint","code":"AVP","ticker":"AVP.SI","sector":"Technology","mktCapM":3619.13},{"name":"Azeus","code":"BBW","ticker":"BBW.SI","sector":"Technology","mktCapM":303},{"name":"Aztech Gbl","code":"8AZ","ticker":"8AZ.SI","sector":"Technology","mktCapM":663.74},{"name":"BHG Retail Reit","code":"BMGU","ticker":"BMGU.SI","sector":"Real Estate","mktCapM":239.02},{"name":"BRC Asia","code":"BEC","ticker":"BEC.SI","sector":"Basic Materials","mktCapM":1165.99},{"name":"Banyan Tree","code":"B58","ticker":"B58.SI","sector":"Consumer Cyclical","mktCapM":472.87},{"name":"Bonvests","code":"B28","ticker":"B28.SI","sector":"Consumer Cyclical","mktCapM":381.44},{"name":"Boustead","code":"F9D","ticker":"F9D.SI","sector":"Industrials","mktCapM":1054.87},{"name":"Bukit Sembawang","code":"B61","ticker":"B61.SI","sector":"Real Estate","mktCapM":1263.49},{"name":"Bumitama Agri","code":"P8Z","ticker":"P8Z.SI","sector":"Consumer Defensive","mktCapM":3173.48},{"name":"Bund Center","code":"BTE","ticker":"BTE.SI","sector":"Real Estate","mktCapM":314.89},{"name":"CDL HTrust","code":"J85","ticker":"J85.SI","sector":"Real Estate","mktCapM":986.58},{"name":"CMS","code":"8A8","ticker":"8A8.SI","sector":"Healthcare","mktCapM":5669.2},{"name":"CNMC Goldmine","code":"5TP","ticker":"5TP.SI","sector":"Basic Materials","mktCapM":510.66},{"name":"CONCORD NE","code":"SEG","ticker":"SEG.SI","sector":"Utilities","mktCapM":429.29},{"name":"COSCO SHP SG","code":"F83","ticker":"F83.SI","sector":"Transportation","mktCapM":501.59},{"name":"CSE Global","code":"544","ticker":"544.SI","sector":"Technology","mktCapM":940.72},{"name":"CapLand Ascendas REIT","code":"A17U","ticker":"A17U.SI","sector":"Real Estate","mktCapM":12537.99},{"name":"CapLand Ascott T","code":"HMN","ticker":"HMN.SI","sector":"Real Estate","mktCapM":3500.18},{"name":"CapLand China T","code":"AU8U","ticker":"AU8U.SI","sector":"Real Estate","mktCapM":1150.93},{"name":"CapLand India T","code":"CY6U","ticker":"CY6U.SI","sector":"Real Estate","mktCapM":1516.65},{"name":"CapLand IntCom T","code":"C38U","ticker":"C38U.SI","sector":"Real Estate","mktCapM":19384.18},{"name":"CapitaLandInvest","code":"9CI","ticker":"9CI.SI","sector":"Real Estate","mktCapM":12483.83},{"name":"Cent Accom REIT","code":"8C8U","ticker":"8C8U.SI","sector":"Real Estate","mktCapM":1931.96},{"name":"Centurion","code":"OU8","ticker":"OU8.SI","sector":"Consumer Cyclical","mktCapM":1362.06},{"name":"China Aviation","code":"G92","ticker":"G92.SI","sector":"Energy","mktCapM":1453.71},{"name":"China Everbright","code":"U9E","ticker":"U9E.SI","sector":"Utilities","mktCapM":643.7},{"name":"ChinaSunsine","code":"QES","ticker":"QES.SI","sector":"Basic Materials","mktCapM":643.53},{"name":"Chuan Hup","code":"C33","ticker":"C33.SI","sector":"Real Estate","mktCapM":228.67},{"name":"CityDev","code":"C09","ticker":"C09.SI","sector":"Real Estate","mktCapM":7004.27},{"name":"Civmec","code":"P9D","ticker":"P9D.SI","sector":"Construction","mktCapM":784.82},{"name":"Coliwoo Hldgs","code":"W8W","ticker":"W8W.SI","sector":"Real Estate","mktCapM":238},{"name":"Comba","code":"STC","ticker":"STC.SI","sector":"Technology","mktCapM":684.02},{"name":"ComfortDelGro","code":"C52","ticker":"C52.SI","sector":"Transportation","mktCapM":2882.69},{"name":"Cortina","code":"C41","ticker":"C41.SI","sector":"Consumer Cyclical","mktCapM":660.66},{"name":"CreditBureauAsia","code":"TCU","ticker":"TCU.SI","sector":"Financial Services","mktCapM":254.68},{"name":"DBS","code":"D05","ticker":"D05.SI","sector":"Financial Services","mktCapM":204139.76},{"name":"Daiwa Hse Log Tr","code":"DHLU","ticker":"DHLU.SI","sector":"Real Estate","mktCapM":340.06},{"name":"Delfi","code":"P34","ticker":"P34.SI","sector":"Consumer Defensive","mktCapM":537.82},{"name":"EC World Reit","code":"BWCU","ticker":"BWCU.SI","sector":"Real Estate","mktCapM":226.75},{"name":"ESR REIT","code":"9A4U","ticker":"9A4U.SI","sector":"Real Estate","mktCapM":1867.68},{"name":"Emperador Inc.","code":"EMI","ticker":"EMI.SI","sector":"Consumer Defensive","mktCapM":5332.73},{"name":"Ever Glory","code":"ZKX","ticker":"ZKX.SI","sector":"Construction","mktCapM":408.54},{"name":"F & N","code":"F99","ticker":"F99.SI","sector":"Consumer Defensive","mktCapM":2081.06},{"name":"Far East HTrust","code":"Q5T","ticker":"Q5T.SI","sector":"Real Estate","mktCapM":1190.83},{"name":"Far East Orchard","code":"O10","ticker":"O10.SI","sector":"Real Estate","mktCapM":546.1},{"name":"First Reit","code":"AW9U","ticker":"AW9U.SI","sector":"Real Estate","mktCapM":476.83},{"name":"First Resources","code":"EB5","ticker":"EB5.SI","sector":"Consumer Defensive","mktCapM":5588.43},{"name":"First Sponsor","code":"ADN","ticker":"ADN.SI","sector":"Real Estate","mktCapM":1140.56},{"name":"Food Empire","code":"F03","ticker":"F03.SI","sector":"Consumer Defensive","mktCapM":1591.67},{"name":"FoundationHealth","code":"FHH","ticker":"FHH.SI","sector":"Healthcare","mktCapM":956.63},{"name":"Frasers Cpt Tr","code":"J69U","ticker":"J69U.SI","sector":"Real Estate","mktCapM":4625.86},{"name":"Frasers L&C Tr","code":"BUOU","ticker":"BUOU.SI","sector":"Real Estate","mktCapM":3687.22},{"name":"Frasers Property","code":"TQ5","ticker":"TQ5.SI","sector":"Real Estate","mktCapM":4161.6},{"name":"Frencken","code":"E28","ticker":"E28.SI","sector":"Technology","mktCapM":1176.36},{"name":"GP Industries","code":"G20","ticker":"G20.SI","sector":"Industrials","mktCapM":290.7},{"name":"GRC","code":"S3N","ticker":"S3N.SI","sector":"Real Estate","mktCapM":382.6},{"name":"GSH","code":"BDX","ticker":"BDX.SI","sector":"Industrials","mktCapM":394.56},{"name":"Gallant Venture","code":"5IG","ticker":"5IG.SI","sector":"Utilities","mktCapM":327.79},{"name":"Genting Sing","code":"G13","ticker":"G13.SI","sector":"Consumer Cyclical","mktCapM":7615.49},{"name":"Geo Energy Res","code":"RE4","ticker":"RE4.SI","sector":"Energy","mktCapM":944.23},{"name":"Global Inv","code":"B73","ticker":"B73.SI","sector":"Financial Services","mktCapM":212.88},{"name":"Golden Agri-Res","code":"E5H","ticker":"E5H.SI","sector":"Consumer Defensive","mktCapM":3550.87},{"name":"Great Eastern","code":"G07","ticker":"G07.SI","sector":"Financial Services","mktCapM":19178.89},{"name":"GuocoLand","code":"F17","ticker":"F17.SI","sector":"Real Estate","mktCapM":2605.47},{"name":"HPH Trust SGD","code":"P7VU","ticker":"P7VU.SI","sector":"Transportation","mktCapM":2172.35},{"name":"HPL","code":"H15","ticker":"H15.SI","sector":"Consumer Cyclical","mktCapM":2425.64},{"name":"HRnetGroup","code":"CHZ","ticker":"CHZ.SI","sector":"Industrials","mktCapM":733.71},{"name":"Hafary","code":"5VS","ticker":"5VS.SI","sector":"Construction","mktCapM":238.96},{"name":"Halcyon Agri","code":"5VJ","ticker":"5VJ.SI","sector":"Basic Materials","mktCapM":653.95},{"name":"Haw Par","code":"H02","ticker":"H02.SI","sector":"Healthcare","mktCapM":3608.3},{"name":"Helens","code":"HLS","ticker":"HLS.SI","sector":"Consumer Cyclical","mktCapM":215.05},{"name":"Hiap Hoe","code":"5JK","ticker":"5JK.SI","sector":"Consumer Cyclical","mktCapM":305.86},{"name":"Ho Bee Land","code":"H13","ticker":"H13.SI","sector":"Real Estate","mktCapM":1354.59},{"name":"Hong Fok","code":"H30","ticker":"H30.SI","sector":"Real Estate","mktCapM":719.96},{"name":"Hong Leong Asia","code":"H22","ticker":"H22.SI","sector":"Consumer Cyclical","mktCapM":2194.89},{"name":"Hong Leong Fin","code":"S41","ticker":"S41.SI","sector":"Financial Services","mktCapM":1124.75},{"name":"Hotel Grand","code":"H18","ticker":"H18.SI","sector":"Consumer Cyclical","mktCapM":536.08},{"name":"Hotel Royal","code":"H12","ticker":"H12.SI","sector":"Consumer Cyclical","mktCapM":264.9},{"name":"IFAST","code":"AIY","ticker":"AIY.SI","sector":"Technology","mktCapM":2873.76},{"name":"IHH","code":"Q0F","ticker":"Q0F.SI","sector":"Healthcare","mktCapM":24347.63},{"name":"IREIT Global SGD","code":"UD1U","ticker":"UD1U.SI","sector":"Real Estate","mktCapM":244.76},{"name":"ISDN","code":"I07","ticker":"I07.SI","sector":"Construction","mktCapM":310.58},{"name":"IX Biopharma","code":"42C","ticker":"42C.SI","sector":"Healthcare","mktCapM":457.45},{"name":"Indofood Agri","code":"5JS","ticker":"5JS.SI","sector":"Consumer Defensive","mktCapM":516.48},{"name":"Info-Tech","code":"ITS","ticker":"ITS.SI","sector":"Technology","mktCapM":254.13},{"name":"Intl Cement","code":"KUO","ticker":"KUO.SI","sector":"Basic Materials","mktCapM":367.02},{"name":"JB Foods","code":"BEW","ticker":"BEW.SI","sector":"Consumer Defensive","mktCapM":254.69},{"name":"JEP","code":"1J4","ticker":"1J4.SI","sector":"Industrials","mktCapM":231.29},{"name":"Jardine C&C","code":"C07","ticker":"C07.SI","sector":"Industrials","mktCapM":10948.05},{"name":"Kep Infra Tr","code":"A7RU","ticker":"A7RU.SI","sector":"Basic Materials","mktCapM":3195.33},{"name":"Keppel","code":"BN4","ticker":"BN4.SI","sector":"Industrials","mktCapM":20364.45},{"name":"Keppel DC Reit","code":"AJBU","ticker":"AJBU.SI","sector":"Real Estate","mktCapM":5675.12},{"name":"Keppel Reit","code":"K71U","ticker":"K71U.SI","sector":"Real Estate","mktCapM":4445.77},{"name":"Kimly","code":"1D0","ticker":"1D0.SI","sector":"Consumer Cyclical","mktCapM":491.73},{"name":"Koh Eco","code":"5HV","ticker":"5HV.SI","sector":"Construction","mktCapM":391.73},{"name":"LHN","code":"41O","ticker":"41O.SI","sector":"Real Estate","mktCapM":241.76},{"name":"Lendlease Reit","code":"JYEU","ticker":"JYEU.SI","sector":"Real Estate","mktCapM":1896.41},{"name":"Lum Chang Creat","code":"LCC","ticker":"LCC.SI","sector":"Construction","mktCapM":254.1},{"name":"MSC","code":"NPW","ticker":"NPW.SI","sector":"Basic Materials","mktCapM":512.4},{"name":"Mapletree Ind Tr","code":"ME8U","ticker":"ME8U.SI","sector":"Real Estate","mktCapM":5538.71},{"name":"Mapletree Log Tr","code":"M44U","ticker":"M44U.SI","sector":"Real Estate","mktCapM":6143.88},{"name":"Mapletree PanAsia Com Tr","code":"N2IU","ticker":"N2IU.SI","sector":"Real Estate","mktCapM":7133.9},{"name":"MarcoPolo Marine","code":"5LY","ticker":"5LY.SI","sector":"Transportation","mktCapM":532.32},{"name":"Mermaid Maritime","code":"DU4","ticker":"DU4.SI","sector":"Energy","mktCapM":207.98},{"name":"Metro","code":"M01","ticker":"M01.SI","sector":"Consumer Cyclical","mktCapM":385.04},{"name":"Mewah Intl","code":"MV4","ticker":"MV4.SI","sector":"Consumer Defensive","mktCapM":420.19},{"name":"Micro-Mechanics","code":"5DD","ticker":"5DD.SI","sector":"Semiconductors","mktCapM":378.87},{"name":"MoneyMax Fin","code":"5WJ","ticker":"5WJ.SI","sector":"Consumer Cyclical","mktCapM":716.57},{"name":"Multi-Chem","code":"AWZ","ticker":"AWZ.SI","sector":"Technology","mktCapM":336.06},{"name":"NSL","code":"N02","ticker":"N02.SI","sector":"Basic Materials","mktCapM":332.47},{"name":"NamCheong","code":"1MZ","ticker":"1MZ.SI","sector":"Industrials","mktCapM":469.3},{"name":"Nanofilm","code":"MZH","ticker":"MZH.SI","sector":"Technology","mktCapM":750.23},{"name":"NetLink NBN Tr","code":"CJLU","ticker":"CJLU.SI","sector":"Communication Services","mktCapM":3858},{"name":"Nordic","code":"MR7","ticker":"MR7.SI","sector":"Construction","mktCapM":212.94},{"name":"OCBC Bank","code":"O39","ticker":"O39.SI","sector":"Financial Services","mktCapM":129351.76},{"name":"OKP","code":"5CF","ticker":"5CF.SI","sector":"Construction","mktCapM":421.69},{"name":"OUE","code":"LJ3","ticker":"LJ3.SI","sector":"Real Estate","mktCapM":751.09},{"name":"OUEREIT","code":"TS0U","ticker":"TS0U.SI","sector":"Real Estate","mktCapM":1990.8},{"name":"Oiltek","code":"HQU","ticker":"HQU.SI","sector":"Industrials","mktCapM":699.27},{"name":"Olam Group","code":"VC2","ticker":"VC2.SI","sector":"Consumer Defensive","mktCapM":4829.52},{"name":"Oxley","code":"5UX","ticker":"5UX.SI","sector":"Real Estate","mktCapM":320.05},{"name":"PC Partner","code":"PCT","ticker":"PCT.SI","sector":"Technology","mktCapM":1024.01},{"name":"PSC Corporation","code":"DM0","ticker":"DM0.SI","sector":"Consumer Cyclical","mktCapM":234.48},{"name":"Pacific Century","code":"P15","ticker":"P15.SI","sector":"Financial Services","mktCapM":1296.81},{"name":"PanUnited","code":"P52","ticker":"P52.SI","sector":"Basic Materials","mktCapM":1120.61},{"name":"ParkwayLife Reit","code":"C2PU","ticker":"C2PU.SI","sector":"Real Estate","mktCapM":2767.25},{"name":"Penguin Intl","code":"BTM","ticker":"BTM.SI","sector":"Industrials","mktCapM":330.25},{"name":"PropNex","code":"OYY","ticker":"OYY.SI","sector":"Real Estate","mktCapM":1332},{"name":"Q&M Dental","code":"QC7","ticker":"QC7.SI","sector":"Healthcare","mktCapM":540.19},{"name":"QAF","code":"Q01","ticker":"Q01.SI","sector":"Consumer Defensive","mktCapM":566.64},{"name":"Raffles Edu","code":"NR7","ticker":"NR7.SI","sector":"Consumer Defensive","mktCapM":252.87},{"name":"Raffles Medical","code":"BSL","ticker":"BSL.SI","sector":"Healthcare","mktCapM":1738.98},{"name":"Riverstone","code":"AP4","ticker":"AP4.SI","sector":"Healthcare","mktCapM":1267.25},{"name":"SATS","code":"S58","ticker":"S58.SI","sector":"Transportation","mktCapM":6956.43},{"name":"SBS Transit","code":"S61","ticker":"S61.SI","sector":"Transportation","mktCapM":1133.55},{"name":"SGX","code":"S68","ticker":"S68.SI","sector":"Financial Services","mktCapM":25187.33},{"name":"SIA","code":"C6L","ticker":"C6L.SI","sector":"Transportation","mktCapM":24482.37},{"name":"SIA Engineering","code":"S59","ticker":"S59.SI","sector":"Transportation","mktCapM":3712.9},{"name":"SIIC Environment","code":"BHK","ticker":"BHK.SI","sector":"Utilities","mktCapM":430.14},{"name":"ST Engineering","code":"S63","ticker":"S63.SI","sector":"Industrials","mktCapM":32383.58},{"name":"SamuderaShipping","code":"S56","ticker":"S56.SI","sector":"Transportation","mktCapM":519.21},{"name":"Sasseur Reit","code":"CRPU","ticker":"CRPU.SI","sector":"Real Estate","mktCapM":860},{"name":"Seatrium Ltd","code":"5E2","ticker":"5E2.SI","sector":"Energy","mktCapM":6879.14},{"name":"Sembcorp Ind","code":"U96","ticker":"U96.SI","sector":"Utilities","mktCapM":9666.43},{"name":"Sheng Siong","code":"OV8","ticker":"OV8.SI","sector":"Consumer Defensive","mktCapM":4976.71},{"name":"Sing Inv & Fin","code":"S35","ticker":"S35.SI","sector":"Financial Services","mktCapM":373.57},{"name":"SingHoldings","code":"5IC","ticker":"5IC.SI","sector":"Real Estate","mktCapM":225.56},{"name":"SingPost","code":"S08","ticker":"S08.SI","sector":"Transportation","mktCapM":799.61},{"name":"SingaporeLandGrp","code":"U06","ticker":"U06.SI","sector":"Real Estate","mktCapM":4742.78},{"name":"Singtel","code":"Z74","ticker":"Z74.SI","sector":"Communication Services","mktCapM":72350.65},{"name":"Singtel 10","code":"Z77","ticker":"Z77.SI","sector":"Communication Services","mktCapM":72656.44},{"name":"SoilbuildConstr","code":"ZQM","ticker":"ZQM.SI","sector":"Construction","mktCapM":430.21},{"name":"SouthernAlliance","code":"QNS","ticker":"QNS.SI","sector":"Basic Materials","mktCapM":267.43},{"name":"Sri Trang Agro","code":"NC2","ticker":"NC2.SI","sector":"Basic Materials","mktCapM":1071.7},{"name":"Sri Trang Gloves","code":"STG","ticker":"STG.SI","sector":"Basic Materials","mktCapM":1211.84},{"name":"Stamford Land","code":"H07","ticker":"H07.SI","sector":"Consumer Cyclical","mktCapM":734.39},{"name":"StarHub","code":"CC3","ticker":"CC3.SI","sector":"Communication Services","mktCapM":1743.76},{"name":"StarhillGbl Reit","code":"P40U","ticker":"P40U.SI","sector":"Real Estate","mktCapM":1276.56},{"name":"StoneWeg EUTrust SGD","code":"SEB","ticker":"SEB.SI","sector":"Real Estate","mktCapM":1309.23},{"name":"Straco","code":"S85","ticker":"S85.SI","sector":"Consumer Cyclical","mktCapM":290.86},{"name":"Straits Trading","code":"S20","ticker":"S20.SI","sector":"Basic Materials","mktCapM":780.56},{"name":"Sunpower","code":"5GD","ticker":"5GD.SI","sector":"Utilities","mktCapM":414.83},{"name":"Suntec Reit","code":"T82U","ticker":"T82U.SI","sector":"Real Estate","mktCapM":4581.09},{"name":"TSH Resources","code":"TSH","ticker":"TSH.SI","sector":"Consumer Defensive","mktCapM":489.44},{"name":"Tai Sin Electric","code":"500","ticker":"500.SI","sector":"Industrials","mktCapM":243.94},{"name":"ThaiBev","code":"Y92","ticker":"Y92.SI","sector":"Consumer Defensive","mktCapM":11309.26},{"name":"Thakral","code":"AWI","ticker":"AWI.SI","sector":"Consumer Cyclical","mktCapM":272.24},{"name":"TheHourGlass","code":"AGS","ticker":"AGS.SI","sector":"Consumer Cyclical","mktCapM":1758.46},{"name":"Thomson Medical","code":"A50","ticker":"A50.SI","sector":"Healthcare","mktCapM":1401.51},{"name":"Tiong Woon","code":"BQM","ticker":"BQM.SI","sector":"Industrials","mktCapM":243.43},{"name":"Top Glove","code":"BVA","ticker":"BVA.SI","sector":"Healthcare","mktCapM":1643.71},{"name":"Tuan Sing","code":"T24","ticker":"T24.SI","sector":"Real Estate","mktCapM":380.88},{"name":"UIBREIT","code":"UIBU","ticker":"UIBU.SI","sector":"Real Estate","mktCapM":1140.5},{"name":"UMS","code":"558","ticker":"558.SI","sector":"Semiconductors","mktCapM":2254.26},{"name":"UOA","code":"EH5","ticker":"EH5.SI","sector":"Real Estate","mktCapM":1051.64},{"name":"UOB","code":"U11","ticker":"U11.SI","sector":"Financial Services","mktCapM":70938.33},{"name":"UOB Kay Hian","code":"U10","ticker":"U10.SI","sector":"Financial Services","mktCapM":4123.75},{"name":"UOI","code":"U13","ticker":"U13.SI","sector":"Financial Services","mktCapM":536.94},{"name":"UOL","code":"U14","ticker":"U14.SI","sector":"Real Estate","mktCapM":8161.18},{"name":"VICOM Ltd","code":"WJP","ticker":"WJP.SI","sector":"Consumer Cyclical","mktCapM":638.22},{"name":"ValueMax","code":"T6I","ticker":"T6I.SI","sector":"Consumer Cyclical","mktCapM":880.67},{"name":"Valuetronics","code":"BN2","ticker":"BN2.SI","sector":"Technology","mktCapM":442},{"name":"Venture","code":"V03","ticker":"V03.SI","sector":"Technology","mktCapM":4680.99},{"name":"Wee Hur","code":"E3B","ticker":"E3B.SI","sector":"Construction","mktCapM":615.89},{"name":"Wilmar Intl","code":"F34","ticker":"F34.SI","sector":"Consumer Defensive","mktCapM":24534.59},{"name":"Wing Tai","code":"W05","ticker":"W05.SI","sector":"Real Estate","mktCapM":1206.95},{"name":"XMH","code":"BQF","ticker":"BQF.SI","sector":"Industrials","mktCapM":251.08},{"name":"YZJ Fin Hldg","code":"YF8","ticker":"YF8.SI","sector":"Financial Services","mktCapM":750.15},{"name":"YZJ Maritime","code":"8YZ","ticker":"8YZ.SI","sector":"Financial Services","mktCapM":2023.67},{"name":"YZJ Shipbldg SGD","code":"BS6","ticker":"BS6.SI","sector":"Industrials","mktCapM":14679.75},{"name":"Yanlord Land","code":"Z25","ticker":"Z25.SI","sector":"Real Estate","mktCapM":1294.13},{"name":"Yeo Hiap Seng","code":"Y03","ticker":"Y03.SI","sector":"Consumer Defensive","mktCapM":355.7},{"name":"Zheneng Jinjiang","code":"BWM","ticker":"BWM.SI","sector":"Utilities","mktCapM":846.13}];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const WEIGHTS       = { w1:0.10, m1:0.35, m3:0.35, m6:0.15 };
const TRADING_DAYS  = { w1:5, m1:21, m3:63, m6:126 };
const TIE_THRESHOLD = 0.5;
const TOP_SECTORS   = 3;
const SCORE_NAMES   = 5;
const MIN_VALID     = 3;

// ─── FETCH: Vercel serverless function /api/prices ───────────────────────────
// Calls our own /api/prices.js which runs server-side on Vercel
// Server-side fetches Yahoo Finance via yahoo-finance2 — no CORS, no auth needed
// Batches tickers to minimise round trips (up to 20 per call)

const BATCH_SIZE = 20;

async function fetchPriceBatch(tickers) {
  const param = tickers.join(",");
  const resp  = await fetch(`/api/prices?tickers=${encodeURIComponent(param)}`);
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`/api/prices ${resp.status}: ${errText.slice(0, 100)}`);
  }
  const data = await resp.json();
  // If the API returned an error object instead of price data
  if (data.error) throw new Error(`API error: ${data.error}`);
  return data; // { "D05.SI": {w1,m1,m3,m6}, "STI": {...}, ... }
}

function computeReturns(history) {
  if (!history || history.length < 5) return null;
  const last = history[history.length - 1].c;
  const getR = days => {
    if (history.length <= days) return null;
    const base = history[history.length - 1 - days].c;
    return base ? ((last - base) / base) * 100 : null;
  };
  return {
    w1: getR(TRADING_DAYS.w1),
    m1: getR(TRADING_DAYS.m1),
    m3: getR(TRADING_DAYS.m3),
    m6: getR(TRADING_DAYS.m6),
    latest: last,
  };
}

function weightedScore(returns) {
  if (!returns) return null;
  let totalW = 0, raw = 0;
  Object.entries(WEIGHTS).forEach(([k, w]) => {
    if (returns[k] != null) { totalW += w; raw += returns[k] * w; }
  });
  return totalW > 0 ? raw / totalW : null;
}

function groupBySector(universe) {
  const map = {};
  universe.forEach(s => {
    if (!map[s.sector]) map[s.sector] = [];
    map[s.sector].push(s);
  });
  Object.values(map).forEach(arr => arr.sort((a, b) => b.mktCapM - a.mktCapM));
  return map;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtPct   = (v, d = 2) => v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(d)}%`;
const pctColor = v => v == null ? "#6b7280" : v > 0 ? "#10b981" : "#ef4444";
const sigColor = t => ({ BUY:"#10b981", SELL:"#ef4444", HOLD:"#3b82f6", CASH:"#f59e0b" }[t] || "#6b7280");
const rnkColor = r => r === 1 ? "#f59e0b" : r === 2 ? "#94a3b8" : "#b45309";
const fmtCap   = m => m >= 1000 ? (m / 1000).toFixed(1) + "B" : m.toFixed(0) + "M";
const pill     = (t, label) => ({
  display:"inline-block", background:sigColor(t)+"22", color:sigColor(t),
  padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
  border:`1px solid ${sigColor(t)}44`, label: label || t
});

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function SGXMomentum() {
  const [status,       setStatus]       = useState("idle");
  const [progress,     setProgress]     = useState({ done:0, total:0, current:"" });
  const [stockData,    setStockData]    = useState({});
  const [sectorRanked, setSectorRanked] = useState([]);
  const [stiScore,     setStiScore]     = useState(null);
  const [stiReturns,   setStiReturns]   = useState(null);
  const [stiError,     setStiError]     = useState(null);
  const [signals,      setSignals]      = useState([]);
  const [prevTop3,     setPrevTop3]     = useState(null);
  const [lastRefresh,  setLastRefresh]  = useState(null);
  const [fetchErrors,  setFetchErrors]  = useState([]);
  const [activeTab,    setActiveTab]    = useState("signals");
  const [expanded,     setExpanded]     = useState(null);
  const abortRef = useRef(false);

  // ── FETCH ALL ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    abortRef.current = false;
    setStatus("loading");
    setFetchErrors([]); setStockData({}); setSectorRanked([]); setSignals([]);
    setStiScore(null); setStiReturns(null); setStiError(null);

    const sectorMap = groupBySector(STOCK_UNIVERSE);

    // Build ticker list: STI first, then top SCORE_NAMES per sector
    const tickersNeeded = ["STI"];
    Object.values(sectorMap).forEach(stocks =>
      stocks.slice(0, SCORE_NAMES).forEach(s => {
        if (!tickersNeeded.includes(s.ticker)) tickersNeeded.push(s.ticker);
      })
    );

    // Split into batches of BATCH_SIZE
    const batches = [];
    for (let i = 0; i < tickersNeeded.length; i += BATCH_SIZE) {
      batches.push(tickersNeeded.slice(i, i + BATCH_SIZE));
    }
    setProgress({ done:0, total:batches.length, current:"Loading prices…" });

    const results = {};
    const errors  = [];

    for (let i = 0; i < batches.length; i++) {
      if (abortRef.current) break;
      const batch = batches[i];
      setProgress({ done:i, total:batches.length,
        current:`Batch ${i+1}/${batches.length}: ${batch.slice(0,4).join(", ")}…` });
      try {
        const batchResult = await fetchPriceBatch(batch);
        for (const ticker of batch) {
          const ret = batchResult[ticker];
          if (ret && (ret.w1 != null || ret.m1 != null || ret.m3 != null || ret.m6 != null)) {
            results[ticker] = { returns: ret, error: null };
          } else {
            results[ticker] = { returns: null, error: "No data" };
            if (ticker !== "STI") errors.push({ ticker, error: "No data from Yahoo Finance" });
            else setStiError("No data");
          }
        }
      } catch (e) {
        for (const ticker of batch) {
          results[ticker] = { returns: null, error: e.message };
          if (ticker !== "STI") errors.push({ ticker, error: e.message });
          else setStiError(e.message);
        }
      }
      if (i < batches.length - 1) await new Promise(r => setTimeout(r, 300));
    }

    setProgress({ done: batches.length, total: batches.length, current: "" });
    setStockData(results);
    setFetchErrors(errors);

    // ── STI benchmark score ────────────────────────────────────────────────
    const stiRet = results["STI"]?.returns ?? null;
    const stiWS  = stiRet ? weightedScore(stiRet) : null;
    setStiScore(stiWS);
    setStiReturns(stiRet);

    // ── Compute sector scores ──────────────────────────────────────────────
    const sectors = [];
    Object.entries(sectorMap).forEach(([sector, stocks]) => {
      const top5 = stocks.slice(0, SCORE_NAMES);

      // Score each of top 5
      const scored = top5.map(s => {
        const d   = results[s.ticker];
        const sc  = d?.returns ? weightedScore(d.returns) : null;
        return { ...s, returns: d?.returns ?? null, score: sc, error: d?.error ?? null };
      });

      // Only count stocks with valid data
      const valid = scored.filter(s => s.score != null);

      // Require MIN_VALID names to have good data, otherwise sector is unscored
      const sectorScore = valid.length >= MIN_VALID
        ? valid.reduce((a, b) => a + b.score, 0) / valid.length
        : null;

      const valid3m  = scored.filter(s => s.returns?.m3 != null);
      const sector3m = valid3m.length > 0
        ? valid3m.reduce((a, b) => a + b.returns.m3, 0) / valid3m.length
        : null;

      // Trade = stock with HIGHEST momentum score (not just top mkt cap)
      // This is the purest expression of the momentum thesis
      const scoredValid = scored.filter(s => s.score != null);
      const tradeStock = scoredValid.length > 0
        ? scoredValid.reduce((best, s) => s.score > best.score ? s : best, scoredValid[0])
        : scored[0]; // fallback to top mkt cap if no scores available

      sectors.push({
        sector, sectorScore, sector3m, scored, tradeStock,
        validCount: valid.length,
        dataQuality: `${valid.length}/${top5.length} valid`,
      });
    });

    // ── Rank sectors ───────────────────────────────────────────────────────
    sectors.sort((a, b) => {
      if (a.sectorScore == null && b.sectorScore == null) return 0;
      if (a.sectorScore == null) return 1;
      if (b.sectorScore == null) return -1;
      const diff = b.sectorScore - a.sectorScore;
      // Tiebreaker within 0.5%: use 3M return
      if (Math.abs(diff) <= TIE_THRESHOLD) return (b.sector3m ?? -999) - (a.sector3m ?? -999);
      return diff;
    });
    setSectorRanked(sectors);

    // ── Qualification: score > 0 AND beats STI (if STI available) ─────────
    const qualifying = sectors.filter(s => {
      if (s.sectorScore == null || s.sectorScore <= 0) return false;
      if (stiWS != null && s.sectorScore <= stiWS) return false;
      return true;
    });
    const top3 = qualifying.slice(0, TOP_SECTORS);

    // ── Generate signals ───────────────────────────────────────────────────
    const sigs = [];
    if (top3.length === 0) {
      sigs.push({ type:"CASH", message: stiWS != null
        ? `No sector beats STI (${fmtPct(stiWS)}) — go 100% cash.`
        : "All sectors ≤0% — go 100% cash." });
    } else {
      top3.forEach((s, rank) => {
        const wasIn = prevTop3?.some(p => p.sector === s.sector);
        // ONE trade per sector: top name with valid data
        sigs.push({
          type: wasIn ? "HOLD" : "BUY",
          sector: s.sector, rank: rank + 1,
          sectorScore: s.sectorScore, stock: s.tradeStock,
        });
      });
      // SELL sectors that dropped out
      if (prevTop3) {
        prevTop3.forEach(prev => {
          if (!top3.some(s => s.sector === prev.sector))
            sigs.push({ type:"SELL", sector:prev.sector,
              message:`${prev.sector} dropped out of top 3 — sell position.` });
        });
      }
    }
    setSignals(sigs);
    setPrevTop3(top3.map(s => ({ sector:s.sector })));
    setLastRefresh(new Date());
    setStatus("done");
  }, [prevTop3]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const pct        = progress.total > 0 ? Math.round(progress.done / progress.total * 100) : 0;
  const qualifying = sectorRanked.filter(s => {
    if (s.sectorScore == null || s.sectorScore <= 0) return false;
    if (stiScore != null && s.sectorScore <= stiScore) return false;
    return true;
  });
  const top3       = qualifying.slice(0, TOP_SECTORS);
  const allCash    = sectorRanked.length > 0 && top3.length === 0;

  // ── Styles ────────────────────────────────────────────────────────────────
  const th = { padding:"8px 12px", textAlign:"left", color:"#64748b",
    fontWeight:600, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase" };
  const td = (color) => ({ padding:"9px 12px", color: color || "#e2e8f0" });

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0",
      fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)",
        borderBottom:"1px solid #1e3a5f", padding:"20px 24px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:"50%",
                background: status==="done" ? "#10b981" : status==="loading" ? "#f59e0b" : "#475569",
                boxShadow: status==="done" ? "0 0 8px #10b981" : "none" }} />
              <span style={{ fontSize:11, letterSpacing:"0.12em", color:"#64748b",
                textTransform:"uppercase", fontWeight:600 }}>SGX Sector Momentum</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:700, margin:0, color:"#f1f5f9",
              letterSpacing:"-0.02em" }}>Monthly Signal Dashboard</h1>
            {lastRefresh && (
              <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>
                Last refresh: {lastRefresh.toLocaleString("en-SG",{timeZone:"Asia/Singapore"})} SGT
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {status==="loading" && (
              <button onClick={() => { abortRef.current=true; setStatus("idle"); }}
                style={{ padding:"8px 16px", background:"#1e293b", border:"1px solid #334155",
                  borderRadius:8, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>Stop</button>
            )}
            <button onClick={fetchAll} disabled={status==="loading"}
              style={{ padding:"10px 22px",
                background: status==="loading" ? "#1e3a5f" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                border:"none", borderRadius:8, color:"#fff",
                cursor: status==="loading" ? "not-allowed" : "pointer",
                fontSize:14, fontWeight:600, boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
              {status==="loading" ? `${progress.current} (${progress.done}/${progress.total})` : "↻ Refresh Data"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {status==="loading" && (
          <div style={{ marginTop:12 }}>
            <div style={{ background:"#1e293b", borderRadius:4, height:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`,
                background:"linear-gradient(90deg,#2563eb,#7c3aed)",
                transition:"width 0.3s", borderRadius:4 }} />
            </div>
            <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>
              {progress.current} ({progress.done}/{progress.total})
            </div>
          </div>
        )}

        {/* ── STI BENCHMARK STRIP ─────────────────────────────────────── */}
        {status==="done" && (
          <div style={{ marginTop:14, background:"#0f172a", border:"1px solid #1e3a5f",
            borderRadius:8, padding:"10px 18px", display:"flex", alignItems:"center",
            gap:24, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:10, color:"#475569", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.08em" }}>STI Benchmark</div>
              <div style={{ fontSize:20, fontWeight:700,
                color: stiScore == null ? "#6b7280" : stiScore > 0 ? "#10b981" : "#ef4444" }}>
                {stiScore == null ? (stiError ? "⚠ fetch error" : "—") : fmtPct(stiScore)}
              </div>
              <div style={{ fontSize:11, color:"#475569" }}>Weighted Score (^STI)</div>
            </div>
            {stiReturns && (
              <>
                {[["1W", stiReturns.w1], ["1M", stiReturns.m1],
                  ["3M", stiReturns.m3], ["6M", stiReturns.m6]].map(([label, val]) => (
                  <div key={label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:10, color:"#475569" }}>{label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:pctColor(val) }}>
                      {fmtPct(val, 1)}
                    </div>
                  </div>
                ))}
              </>
            )}
            <div style={{ marginLeft:"auto", fontSize:12, color:"#475569", maxWidth:260 }}>
              {stiScore != null
                ? `Sectors must score > ${fmtPct(stiScore)} (STI) to qualify`
                : "STI data unavailable — using >0% floor only"}
            </div>
          </div>
        )}
      </div>

      {/* ── CASH ALERT ──────────────────────────────────────────────────── */}
      {status==="done" && allCash && (
        <div style={{ background:"linear-gradient(135deg,#450a0a,#7f1d1d)",
          margin:"16px 24px 0", borderRadius:10, padding:"14px 20px",
          border:"1px solid #991b1b", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:700, color:"#fca5a5", fontSize:15 }}>
              {signals[0]?.message || "GO 100% CASH"}
            </div>
            <div style={{ fontSize:12, color:"#fca5a5", opacity:0.7, marginTop:2 }}>
              No sector beats the STI benchmark. Hold cash until conditions improve.
            </div>
          </div>
        </div>
      )}

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div style={{ padding:"16px 24px 0", borderBottom:"1px solid #1e293b" }}>
        <div style={{ display:"flex", gap:4 }}>
          {[
            ["signals",  "🎯 Trade Signals"],
            ["ranking",  "📊 Sector Ranking"],
            ["detail",   "🔍 Score Detail"],
            ["errors",   `⚠ Errors (${fetchErrors.length})`],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ padding:"8px 16px",
                background: activeTab===id ? "#1e3a5f" : "transparent",
                border: activeTab===id ? "1px solid #2563eb" : "1px solid transparent",
                borderRadius:"8px 8px 0 0",
                color: activeTab===id ? "#60a5fa" : "#475569",
                cursor:"pointer", fontSize:13, fontWeight: activeTab===id ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 24px" }}>

        {/* ── TRADE SIGNALS TAB ───────────────────────────────────────── */}
        {activeTab==="signals" && (
          <div>
            {status==="idle" && (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📈</div>
                <div style={{ fontSize:16, fontWeight:600, color:"#475569" }}>
                  Click "Refresh Data" to run the momentum analysis
                </div>
                <div style={{ fontSize:13, color:"#334155", marginTop:8 }}>
                  205 stocks · SGD ≥200M · 14 Industry Sectors · top-5 scoring · STI benchmark · Yahoo Finance data
                </div>
              </div>
            )}

            {status==="done" && (
              <div>
                {/* Summary strip */}
                <div style={{ display:"grid",
                  gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
                  gap:10, marginBottom:20 }}>
                  {[
                    { label:"Sectors > STI", value:qualifying.length,
                      color:qualifying.length>0?"#10b981":"#ef4444" },
                    { label:"BUY Signals",   value:signals.filter(s=>s.type==="BUY").length,  color:"#10b981" },
                    { label:"HOLD Signals",  value:signals.filter(s=>s.type==="HOLD").length, color:"#3b82f6" },
                    { label:"SELL Signals",  value:signals.filter(s=>s.type==="SELL").length, color:"#ef4444" },
                    { label:"Sectors < STI / ≤0%",
                      value:sectorRanked.filter(s=>s.sectorScore==null||s.sectorScore<=0||(stiScore!=null&&s.sectorScore<=stiScore)).length,
                      color:"#94a3b8" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background:"#1e293b", border:"1px solid #334155",
                      borderRadius:8, padding:"12px 16px" }}>
                      <div style={{ fontSize:24, fontWeight:700, color }}>{value}</div>
                      <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Top 3 sector cards */}
                {top3.map((s, idx) => {
                  const wasIn = prevTop3?.some(p => p.sector === s.sector);
                  const sig   = wasIn ? "HOLD" : "BUY";
                  const beat  = stiScore != null ? s.sectorScore - stiScore : null;
                  return (
                    <div key={s.sector} style={{ background:"#1e293b",
                      border:`1px solid ${idx===0?"#854d0e":"#334155"}`,
                      borderRadius:10, overflow:"hidden", marginBottom:14 }}>

                      {/* Sector header */}
                      <div style={{ padding:"14px 18px",
                        background:idx===0?"linear-gradient(90deg,rgba(245,158,11,0.08),transparent)":"transparent",
                        display:"flex", justifyContent:"space-between", alignItems:"center",
                        borderBottom:"1px solid #0f172a" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%",
                            background:rnkColor(idx+1), display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>
                            {idx+1}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:15, color:"#f1f5f9" }}>{s.sector}</div>
                            <div style={{ fontSize:11, color:"#64748b" }}>
                              {s.dataQuality} scored
                              {beat != null && (
                                <span style={{ marginLeft:8, color:"#10b981" }}>
                                  +{beat.toFixed(2)}% above STI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:20, fontWeight:700, color:pctColor(s.sectorScore) }}>
                            {fmtPct(s.sectorScore)}
                          </div>
                          <div style={{ fontSize:11, color:"#475569" }}>
                            Sector Score · 3M: {fmtPct(s.sector3m)}
                          </div>
                        </div>
                      </div>

                      {/* Score breakdown table (all 5 names) */}
                      <div style={{ padding:"10px 18px", borderBottom:"1px solid #0f172a",
                        overflowX:"auto" }}>
                        <div style={{ fontSize:10, color:"#475569", fontWeight:600,
                          letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>
                          Sector Score Calculation — Top {Math.min(SCORE_NAMES, s.scored.length)} by Mkt Cap
                        </div>
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                          <thead>
                            <tr>
                              {["Role","Stock","Code","Mkt Cap","1W","1M","3M","6M","Score"].map(h => (
                                <th key={h} style={{ ...th, padding:"4px 8px" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {s.scored.map((st, i) => (
                              <tr key={st.code}
                                style={{ borderTop:"1px solid #0f172a",
                                  background: st.ticker===s.tradeStock.ticker ? "rgba(37,99,235,0.08)" : "transparent" }}>
                                <td style={{ padding:"5px 8px" }}>
                                  <span style={{ fontSize:10, fontWeight:700,
                                    color: st.ticker===s.tradeStock.ticker ? "#10b981" : "#64748b" }}>
                                    {st.ticker===s.tradeStock.ticker ? "TRADE" : "SCORE"}
                                  </span>
                                </td>
                                <td style={{ padding:"5px 8px", color:"#e2e8f0",
                                  fontWeight: i===0 ? 700 : 400 }}>{st.name}</td>
                                <td style={{ padding:"5px 8px", color:"#64748b",
                                  fontFamily:"monospace" }}>{st.code}</td>
                                <td style={{ padding:"5px 8px", color:"#94a3b8" }}>
                                  SGD {fmtCap(st.mktCapM)}
                                </td>
                                <td style={{ padding:"5px 8px", color:pctColor(st.returns?.w1) }}>
                                  {fmtPct(st.returns?.w1, 1)}
                                </td>
                                <td style={{ padding:"5px 8px", color:pctColor(st.returns?.m1) }}>
                                  {fmtPct(st.returns?.m1, 1)}
                                </td>
                                <td style={{ padding:"5px 8px", color:pctColor(st.returns?.m3),
                                  fontWeight:600 }}>{fmtPct(st.returns?.m3, 1)}</td>
                                <td style={{ padding:"5px 8px", color:pctColor(st.returns?.m6) }}>
                                  {fmtPct(st.returns?.m6, 1)}
                                </td>
                                <td style={{ padding:"5px 8px", color:pctColor(st.score),
                                  fontWeight:700 }}>{fmtPct(st.score)}</td>
                              </tr>
                            ))}
                            {/* Sector average row */}
                            <tr style={{ borderTop:"2px solid #334155",
                              background:"rgba(37,99,235,0.08)" }}>
                              <td colSpan={8} style={{ padding:"5px 8px", color:"#94a3b8",
                                fontSize:11, fontWeight:600 }}>
                                SECTOR SCORE — avg of {s.validCount} valid scores
                                (need ≥{MIN_VALID})
                              </td>
                              <td style={{ padding:"5px 8px", color:pctColor(s.sectorScore),
                                fontWeight:700, fontSize:14 }}>{fmtPct(s.sectorScore)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Trade action — 1 stock only (highest mkt cap with data) */}
                      <div style={{ padding:"12px 18px" }}>
                        <div style={{ fontSize:10, color:"#475569", fontWeight:600,
                          letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>
                          Trade Action
                        </div>
                        <div style={{ background:"#0f172a", borderRadius:8, padding:"14px 16px",
                          border:`1px solid ${sigColor(sig)}33`, maxWidth:500 }}>
                          <div style={{ display:"flex", justifyContent:"space-between",
                            alignItems:"flex-start", marginBottom:10 }}>
                            <div>
                              <div style={{ fontWeight:700, fontSize:15, color:"#f1f5f9" }}>
                                {s.tradeStock.name}
                              </div>
                              <div style={{ fontSize:12, color:"#64748b" }}>
                                {s.tradeStock.code} · SGD {fmtCap(s.tradeStock.mktCapM)} · best momentum score
                              </div>
                            </div>
                            <span style={{ background:sigColor(sig)+"22", color:sigColor(sig),
                              padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700,
                              border:`1px solid ${sigColor(sig)}44`, whiteSpace:"nowrap" }}>
                              {sig}
                            </span>
                          </div>
                          {s.tradeStock.returns ? (
                            <>
                              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                                {[["1W", s.tradeStock.returns.w1],
                                  ["1M", s.tradeStock.returns.m1],
                                  ["3M", s.tradeStock.returns.m3],
                                  ["6M", s.tradeStock.returns.m6]].map(([label, val]) => (
                                  <div key={label} style={{ textAlign:"center", background:"#1e293b",
                                    borderRadius:6, padding:"4px 10px", minWidth:48 }}>
                                    <div style={{ fontSize:10, color:"#475569" }}>{label}</div>
                                    <div style={{ fontSize:12, fontWeight:600, color:pctColor(val) }}>
                                      {fmtPct(val, 1)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ fontSize:12, color:"#64748b" }}>
                                Momentum score:{" "}
                                <span style={{ color:pctColor(s.tradeStock.score), fontWeight:700 }}>
                                  {fmtPct(s.tradeStock.score)}
                                </span>
                                {stiScore != null && s.tradeStock.score != null && (
                                  <span style={{ marginLeft:8, color:"#475569" }}>
                                    vs STI {fmtPct(stiScore)}
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize:12, color:"#ef4444" }}>
                              ⚠ No price data for this stock — check Errors tab
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* SELL signals */}
                {signals.filter(s => s.type==="SELL").map((s, i) => (
                  <div key={i} style={{ background:"#1e293b", border:"1px solid #7f1d1d",
                    borderRadius:10, padding:"14px 18px", marginBottom:10,
                    display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ background:"#ef444422", color:"#ef4444", padding:"4px 12px",
                      borderRadius:20, fontSize:12, fontWeight:700 }}>SELL</span>
                    <div style={{ fontSize:14, color:"#fca5a5" }}>{s.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECTOR RANKING TAB ────────────────────────────────────────── */}
        {activeTab==="ranking" && (
          <div>
            {sectorRanked.length===0 && (
              <div style={{ color:"#475569", textAlign:"center", padding:40 }}>
                Run refresh to see sector rankings.
              </div>
            )}
            {sectorRanked.length > 0 && (
              <>
                <div style={{ marginBottom:12, fontSize:13, color:"#475569" }}>
                  Score = 1W×10% + 1M×35% + 3M×35% + 6M×15%, avg of top 5 by mkt cap (min {MIN_VALID} valid).
                  {stiScore != null && ` Qualify: score > 0% AND > STI (${fmtPct(stiScore)}). Tiebreaker: 3M return within 0.5%.`}
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #334155" }}>
                        {["Rank","Sector","Score","vs STI","1W","1M","3M","6M","Qualifies","Data"].map(h => (
                          <th key={h} style={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sectorRanked.map((s, i) => {
                        const inTop3 = i < TOP_SECTORS && s.sectorScore != null
                          && s.sectorScore > 0
                          && (stiScore == null || s.sectorScore > stiScore);
                        const vsSTI  = stiScore != null && s.sectorScore != null
                          ? s.sectorScore - stiScore : null;
                        const avg = f => {
                          const vals = s.scored.filter(x => x.returns?.[f] != null).map(x => x.returns[f]);
                          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
                        };
                        const qualifies = s.sectorScore != null && s.sectorScore > 0
                          && (stiScore == null || s.sectorScore > stiScore);
                        return (
                          <tr key={s.sector}
                            style={{ borderBottom:"1px solid #1e293b",
                              background: inTop3 ? "rgba(37,99,235,0.07)" : "transparent" }}>
                            <td style={td(inTop3 ? rnkColor(i+1) : "#475569")}>
                              <strong>#{i+1}</strong>
                            </td>
                            <td style={td(inTop3 ? "#f1f5f9" : "#94a3b8")}>
                              {inTop3 && <span style={{ marginRight:6 }}>✦</span>}{s.sector}
                            </td>
                            <td style={td(pctColor(s.sectorScore))}>
                              <strong>{fmtPct(s.sectorScore)}</strong>
                            </td>
                            <td style={td(pctColor(vsSTI))}>
                              {vsSTI != null ? `${vsSTI >= 0 ? "+" : ""}${vsSTI.toFixed(2)}%` : "—"}
                            </td>
                            <td style={td(pctColor(avg("w1")))}>{fmtPct(avg("w1"), 1)}</td>
                            <td style={td(pctColor(avg("m1")))}>{fmtPct(avg("m1"), 1)}</td>
                            <td style={{ ...td(pctColor(avg("m3"))), fontWeight:600 }}>
                              {fmtPct(avg("m3"), 1)}
                            </td>
                            <td style={td(pctColor(avg("m6")))}>{fmtPct(avg("m6"), 1)}</td>
                            <td style={td()}>
                              <span style={{ color: qualifies ? "#10b981" : "#ef4444",
                                fontWeight:600, fontSize:12 }}>
                                {s.sectorScore == null ? "No data"
                                  : !qualifies ? "✗ No" : "✓ Yes"}
                              </span>
                            </td>
                            <td style={td("#475569")}>{s.dataQuality}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* STI row at bottom */}
                    {stiScore != null && (
                      <tfoot>
                        <tr style={{ borderTop:"2px solid #334155",
                          background:"rgba(255,255,255,0.03)" }}>
                          <td style={td("#64748b")}>—</td>
                          <td style={{ ...td("#94a3b8"), fontWeight:600 }}>
                            📊 STI Benchmark (^STI)
                          </td>
                          <td style={td(pctColor(stiScore))}>
                            <strong>{fmtPct(stiScore)}</strong>
                          </td>
                          <td style={td("#64748b")}>benchmark</td>
                          <td style={td(pctColor(stiReturns?.w1))}>{fmtPct(stiReturns?.w1, 1)}</td>
                          <td style={td(pctColor(stiReturns?.m1))}>{fmtPct(stiReturns?.m1, 1)}</td>
                          <td style={{ ...td(pctColor(stiReturns?.m3)), fontWeight:600 }}>
                            {fmtPct(stiReturns?.m3, 1)}
                          </td>
                          <td style={td(pctColor(stiReturns?.m6))}>{fmtPct(stiReturns?.m6, 1)}</td>
                          <td style={td("#64748b")}>—</td>
                          <td style={td("#64748b")}>—</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SCORE DETAIL TAB ─────────────────────────────────────────── */}
        {activeTab==="detail" && (
          <div>
            {sectorRanked.length===0 && (
              <div style={{ color:"#475569", textAlign:"center", padding:40 }}>
                Run refresh to see detail.
              </div>
            )}
            <div style={{ marginBottom:12, fontSize:13, color:"#475569" }}>
              All 5 stocks used for sector scoring. TRADE = highest momentum score.
              Sector scored only if ≥{MIN_VALID}/5 names have data.
            </div>
            {sectorRanked.map(s => (
              <div key={s.sector} style={{ marginBottom:10 }}>
                <div onClick={() => setExpanded(expanded===s.sector ? null : s.sector)}
                  style={{ background:"#1e293b", borderRadius:expanded===s.sector?"8px 8px 0 0":8,
                    padding:"12px 16px", cursor:"pointer",
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    border:"1px solid #334155" }}>
                  <div style={{ fontWeight:600, color:"#f1f5f9" }}>
                    {s.sector}
                    <span style={{ fontSize:11, color:"#475569", fontWeight:400,
                      marginLeft:8 }}>({s.dataQuality})</span>
                  </div>
                  <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                    <span style={{ color:pctColor(s.sectorScore), fontWeight:700 }}>
                      {fmtPct(s.sectorScore)}
                    </span>
                    {stiScore != null && s.sectorScore != null && (
                      <span style={{ fontSize:11,
                        color: s.sectorScore > stiScore ? "#10b981" : "#ef4444" }}>
                        {s.sectorScore > stiScore ? "✓ beats STI" : "✗ below STI"}
                      </span>
                    )}
                    <span style={{ color:"#475569", fontSize:12 }}>
                      {expanded===s.sector ? "▲" : "▼"}
                    </span>
                  </div>
                </div>
                {expanded===s.sector && (
                  <div style={{ background:"#0f172a", border:"1px solid #1e293b",
                    borderTop:"none", borderRadius:"0 0 8px 8px", overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                      <thead>
                        <tr style={{ borderBottom:"1px solid #1e293b" }}>
                          {["Role","Stock","Code","Mkt Cap","1W","1M","3M","6M","Score"].map(h => (
                            <th key={h} style={{ ...th, padding:"7px 12px" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.scored.map((st, i) => (
                          <tr key={st.code} style={{ borderBottom:"1px solid #1e293b",
                            background: st.ticker===s.tradeStock.ticker ? "rgba(37,99,235,0.06)" : "transparent" }}>
                            <td style={{ padding:"7px 12px" }}>
                              <span style={{ fontSize:10, fontWeight:700,
                                color: st.ticker===s.tradeStock.ticker ? "#10b981" : "#64748b" }}>
                                {st.ticker===s.tradeStock.ticker ? "TRADE" : "SCORE"}
                              </span>
                            </td>
                            <td style={{ padding:"7px 12px", color:"#e2e8f0",
                              fontWeight: i===0 ? 700 : 400 }}>{st.name}</td>
                            <td style={{ padding:"7px 12px", color:"#64748b",
                              fontFamily:"monospace" }}>{st.code}</td>
                            <td style={{ padding:"7px 12px", color:"#94a3b8" }}>
                              SGD {fmtCap(st.mktCapM)}
                            </td>
                            <td style={{ padding:"7px 12px", color:pctColor(st.returns?.w1) }}>
                              {fmtPct(st.returns?.w1, 1)}
                            </td>
                            <td style={{ padding:"7px 12px", color:pctColor(st.returns?.m1) }}>
                              {fmtPct(st.returns?.m1, 1)}
                            </td>
                            <td style={{ padding:"7px 12px", color:pctColor(st.returns?.m3),
                              fontWeight:600 }}>{fmtPct(st.returns?.m3, 1)}</td>
                            <td style={{ padding:"7px 12px", color:pctColor(st.returns?.m6) }}>
                              {fmtPct(st.returns?.m6, 1)}
                            </td>
                            <td style={{ padding:"7px 12px", color:pctColor(st.score),
                              fontWeight:700 }}>{fmtPct(st.score)}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop:"2px solid #334155",
                          background:"rgba(37,99,235,0.06)" }}>
                          <td colSpan={8} style={{ padding:"7px 12px", color:"#94a3b8",
                            fontSize:11, fontWeight:600 }}>
                            SECTOR SCORE — avg of {s.validCount} valid · min {MIN_VALID} required ·
                            formula: 1W×10% + 1M×35% + 3M×35% + 6M×15%
                          </td>
                          <td style={{ padding:"7px 12px", color:pctColor(s.sectorScore),
                            fontWeight:700, fontSize:14 }}>{fmtPct(s.sectorScore)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ERRORS TAB ──────────────────────────────────────────────── */}
        {activeTab==="errors" && (
          <div>
            {fetchErrors.length===0 && status==="done" && (
              <div style={{ color:"#10b981", textAlign:"center", padding:40 }}>
                ✓ No errors — all tickers fetched successfully.
              </div>
            )}
            {fetchErrors.length===0 && status!=="done" && (
              <div style={{ color:"#475569", textAlign:"center", padding:40 }}>
                Run refresh to see error log.
              </div>
            )}
            {fetchErrors.length > 0 && (
              <>
                <div style={{ marginBottom:12, color:"#f59e0b", fontSize:13 }}>
                  ⚠ {fetchErrors.length} tickers failed. Their sector still scores if ≥{MIN_VALID} other names have data.
                </div>
                <div style={{ background:"#1e293b", borderRadius:8, overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #334155" }}>
                        <th style={th}>Ticker</th><th style={th}>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchErrors.map(({ ticker, error }) => (
                        <tr key={ticker} style={{ borderBottom:"1px solid #0f172a" }}>
                          <td style={{ padding:"8px 14px", color:"#f87171",
                            fontFamily:"monospace" }}>{ticker}</td>
                          <td style={{ padding:"8px 14px", color:"#94a3b8" }}>{error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LEGEND ──────────────────────────────────────────────────── */}
        <div style={{ marginTop:32, borderTop:"1px solid #1e293b", paddingTop:16,
          display:"flex", flexWrap:"wrap", gap:20, fontSize:11, color:"#334155" }}>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Universe:</span> 205 stocks · SGD ≥200M · 16 sectors</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Score formula:</span> 1W×10% + 1M×35% + 3M×35% + 6M×15%</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Sector score:</span> avg of top 5 by mkt cap (min 3 valid)</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Qualify:</span> score &gt;0% AND &gt; STI benchmark</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Trade:</span> highest momentum score per qualifying sector</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Positions:</span> max {TOP_SECTORS} (one per sector)</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Tiebreaker:</span> 3M return when gap ≤0.5%</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Cash:</span> no sector beats STI / all ≤0%</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Data:</span> /api/prices → yahoo-finance2 server-side · no CORS</div>
        </div>
      </div>
    </div>
  );
}
