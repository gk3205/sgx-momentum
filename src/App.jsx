import { useState, useCallback, useRef } from "react";

// ─── HARDCODED UNIVERSE: SGD-only, ≥200M mkt cap, 207 stocks (27 Jun 2026) ──
const STOCK_UNIVERSE = [{"name":"Kep Infra Tr","code":"A7RU","ticker":"A7RU.SI","sector":"Basic Materials","mktCapM":3317.06},{"name":"BRC Asia","code":"BEC","ticker":"BEC.SI","sector":"Basic Materials","mktCapM":1198.91},{"name":"Sri Trang Gloves","code":"STG","ticker":"STG.SI","sector":"Basic Materials","mktCapM":1071.0},{"name":"Sri Trang Agro","code":"NC2","ticker":"NC2.SI","sector":"Basic Materials","mktCapM":988.7},{"name":"PanUnited","code":"P52","ticker":"P52.SI","sector":"Basic Materials","mktCapM":945.51},{"name":"Straits Trading","code":"S20","ticker":"S20.SI","sector":"Basic Materials","mktCapM":754.9},{"name":"Halcyon Agri","code":"5VJ","ticker":"5VJ.SI","sector":"Basic Materials","mktCapM":653.96},{"name":"ChinaSunsine","code":"QES","ticker":"QES.SI","sector":"Basic Materials","mktCapM":643.53},{"name":"MSC","code":"NPW","ticker":"NPW.SI","sector":"Basic Materials","mktCapM":494.92},{"name":"CNMC Goldmine","code":"5TP","ticker":"5TP.SI","sector":"Basic Materials","mktCapM":449.87},{"name":"Intl Cement","code":"KUO","ticker":"KUO.SI","sector":"Basic Materials","mktCapM":344.08},{"name":"NSL","code":"N02","ticker":"N02.SI","sector":"Basic Materials","mktCapM":325.0},{"name":"SouthernAlliance","code":"QNS","ticker":"QNS.SI","sector":"Basic Materials","mktCapM":273.8},{"name":"Singtel","code":"Z74","ticker":"Z74.SI","sector":"Communication Services","mktCapM":72514.34},{"name":"NetLink NBN Tr","code":"CJLU","ticker":"CJLU.SI","sector":"Communication Services","mktCapM":3799.55},{"name":"StarHub","code":"CC3","ticker":"CC3.SI","sector":"Communication Services","mktCapM":1795.03},{"name":"Genting Sing","code":"G13","ticker":"G13.SI","sector":"Consumer Cyclical","mktCapM":7313.28},{"name":"HPL","code":"H15","ticker":"H15.SI","sector":"Consumer Cyclical","mktCapM":2430.95},{"name":"Hong Leong Asia","code":"H22","ticker":"H22.SI","sector":"Consumer Cyclical","mktCapM":2202.87},{"name":"TheHourGlass","code":"AGS","ticker":"AGS.SI","sector":"Consumer Cyclical","mktCapM":1675.34},{"name":"Centurion","code":"OU8","ticker":"OU8.SI","sector":"Consumer Cyclical","mktCapM":1219.13},{"name":"ValueMax","code":"T6I","ticker":"T6I.SI","sector":"Consumer Cyclical","mktCapM":847.52},{"name":"Aspial Lifestyle","code":"5UF","ticker":"5UF.SI","sector":"Consumer Cyclical","mktCapM":730.32},{"name":"MoneyMax Fin","code":"5WJ","ticker":"5WJ.SI","sector":"Consumer Cyclical","mktCapM":726.13},{"name":"Stamford Land","code":"H07","ticker":"H07.SI","sector":"Consumer Cyclical","mktCapM":719.55},{"name":"VICOM Ltd","code":"WJP","ticker":"WJP.SI","sector":"Consumer Cyclical","mktCapM":634.68},{"name":"Cortina","code":"C41","ticker":"C41.SI","sector":"Consumer Cyclical","mktCapM":596.08},{"name":"Hotel Grand","code":"H18","ticker":"H18.SI","sector":"Consumer Cyclical","mktCapM":532.39},{"name":"Kimly","code":"1D0","ticker":"1D0.SI","sector":"Consumer Cyclical","mktCapM":485.51},{"name":"Banyan Tree","code":"B58","ticker":"B58.SI","sector":"Consumer Cyclical","mktCapM":477.2},{"name":"Bonvests","code":"B28","ticker":"B28.SI","sector":"Consumer Cyclical","mktCapM":385.46},{"name":"Metro","code":"M01","ticker":"M01.SI","sector":"Consumer Cyclical","mktCapM":385.04},{"name":"Helens","code":"HLS","ticker":"HLS.SI","sector":"Consumer Cyclical","mktCapM":358.03},{"name":"Aspial Corp","code":"A30","ticker":"A30.SI","sector":"Consumer Cyclical","mktCapM":326.08},{"name":"Hiap Hoe","code":"5JK","ticker":"5JK.SI","sector":"Consumer Cyclical","mktCapM":305.86},{"name":"Straco","code":"S85","ticker":"S85.SI","sector":"Consumer Cyclical","mktCapM":299.32},{"name":"Thakral","code":"AWI","ticker":"AWI.SI","sector":"Consumer Cyclical","mktCapM":272.24},{"name":"Hotel Royal","code":"H12","ticker":"H12.SI","sector":"Consumer Cyclical","mktCapM":254.02},{"name":"PSC Corporation","code":"DM0","ticker":"DM0.SI","sector":"Consumer Cyclical","mktCapM":231.75},{"name":"Wilmar Intl","code":"F34","ticker":"F34.SI","sector":"Consumer Defensive","mktCapM":22849.01},{"name":"ThaiBev","code":"Y92","ticker":"Y92.SI","sector":"Consumer Defensive","mktCapM":11057.94},{"name":"Emperador Inc.","code":"EMI","ticker":"EMI.SI","sector":"Consumer Defensive","mktCapM":5064.88},{"name":"Sheng Siong","code":"OV8","ticker":"OV8.SI","sector":"Consumer Defensive","mktCapM":4841.39},{"name":"First Resources","code":"EB5","ticker":"EB5.SI","sector":"Consumer Defensive","mktCapM":4829.89},{"name":"Olam Group","code":"VC2","ticker":"VC2.SI","sector":"Consumer Defensive","mktCapM":4563.09},{"name":"Golden Agri-Res","code":"E5H","ticker":"E5H.SI","sector":"Consumer Defensive","mktCapM":3424.05},{"name":"Bumitama Agri","code":"P8Z","ticker":"P8Z.SI","sector":"Consumer Defensive","mktCapM":2826.66},{"name":"F & N","code":"F99","ticker":"F99.SI","sector":"Consumer Defensive","mktCapM":2066.51},{"name":"Food Empire","code":"F03","ticker":"F03.SI","sector":"Consumer Defensive","mktCapM":1539.61},{"name":"QAF","code":"Q01","ticker":"Q01.SI","sector":"Consumer Defensive","mktCapM":560.89},{"name":"Delfi","code":"P34","ticker":"P34.SI","sector":"Consumer Defensive","mktCapM":543.93},{"name":"Indofood Agri","code":"5JS","ticker":"5JS.SI","sector":"Consumer Defensive","mktCapM":502.53},{"name":"TSH Resources","code":"TSH","ticker":"TSH.SI","sector":"Consumer Defensive","mktCapM":455.38},{"name":"Mewah Intl","code":"MV4","ticker":"MV4.SI","sector":"Consumer Defensive","mktCapM":427.69},{"name":"Yeo Hiap Seng","code":"Y03","ticker":"Y03.SI","sector":"Consumer Defensive","mktCapM":363.77},{"name":"China Fishery","code":"B0Z","ticker":"B0Z.SI","sector":"Consumer Defensive","mktCapM":279.94},{"name":"JB Foods","code":"BEW","ticker":"BEW.SI","sector":"Consumer Defensive","mktCapM":246.03},{"name":"Raffles Edu","code":"NR7","ticker":"NR7.SI","sector":"Consumer Defensive","mktCapM":214.46},{"name":"Seatrium Ltd","code":"5E2","ticker":"5E2.SI","sector":"Energy","mktCapM":6608.04},{"name":"China Aviation","code":"G92","ticker":"G92.SI","sector":"Energy","mktCapM":1556.93},{"name":"Geo Energy Res","code":"RE4","ticker":"RE4.SI","sector":"Energy","mktCapM":792.74},{"name":"DBS","code":"D05","ticker":"D05.SI","sector":"Financial Services","mktCapM":185666.44},{"name":"OCBC Bank","code":"O39","ticker":"O39.SI","sector":"Financial Services","mktCapM":111614.04},{"name":"UOB","code":"U11","ticker":"U11.SI","sector":"Financial Services","mktCapM":65735.63},{"name":"Nomura Yen1k","code":"N33","ticker":"N33.SI","sector":"Financial Services","mktCapM":33137.59},{"name":"SGX","code":"S68","ticker":"S68.SI","sector":"Financial Services","mktCapM":25856.95},{"name":"Great Eastern","code":"G07","ticker":"G07.SI","sector":"Financial Services","mktCapM":15288.21},{"name":"UOB Kay Hian","code":"U10","ticker":"U10.SI","sector":"Financial Services","mktCapM":3582.45},{"name":"YZJ Maritime","code":"8YZ","ticker":"8YZ.SI","sector":"Financial Services","mktCapM":2058.56},{"name":"AMTD IDEA OV","code":"HKB","ticker":"HKB.SI","sector":"Financial Services","mktCapM":1987.42},{"name":"Pacific Century","code":"P15","ticker":"P15.SI","sector":"Financial Services","mktCapM":1230.65},{"name":"Hong Leong Fin","code":"S41","ticker":"S41.SI","sector":"Financial Services","mktCapM":1115.75},{"name":"YZJ Fin Hldg","code":"YF8","ticker":"YF8.SI","sector":"Financial Services","mktCapM":748.3},{"name":"UOI","code":"U13","ticker":"U13.SI","sector":"Financial Services","mktCapM":510.64},{"name":"Sing Inv & Fin","code":"S35","ticker":"S35.SI","sector":"Financial Services","mktCapM":366.48},{"name":"CreditBureauAsia","code":"TCU","ticker":"TCU.SI","sector":"Financial Services","mktCapM":263.86},{"name":"Global Inv","code":"B73","ticker":"B73.SI","sector":"Financial Services","mktCapM":210.21},{"name":"Lonza","code":"O6Z","ticker":"O6Z.SI","sector":"Healthcare","mktCapM":59903.63},{"name":"IHH","code":"Q0F","ticker":"Q0F.SI","sector":"Healthcare","mktCapM":23732.32},{"name":"CMS","code":"8A8","ticker":"8A8.SI","sector":"Healthcare","mktCapM":4075.46},{"name":"Haw Par","code":"H02","ticker":"H02.SI","sector":"Healthcare","mktCapM":3506.47},{"name":"Top Glove","code":"BVA","ticker":"BVA.SI","sector":"Healthcare","mktCapM":1759.0},{"name":"Raffles Medical","code":"BSL","ticker":"BSL.SI","sector":"Healthcare","mktCapM":1692.98},{"name":"Thomson Medical","code":"A50","ticker":"A50.SI","sector":"Healthcare","mktCapM":1401.51},{"name":"Riverstone","code":"AP4","ticker":"AP4.SI","sector":"Healthcare","mktCapM":1230.2},{"name":"Q&M Dental","code":"QC7","ticker":"QC7.SI","sector":"Healthcare","mktCapM":530.71},{"name":"IX Biopharma","code":"42C","ticker":"42C.SI","sector":"Healthcare","mktCapM":376.8},{"name":"Aoxin Q & M","code":"1D4","ticker":"1D4.SI","sector":"Healthcare","mktCapM":266.12},{"name":"ST Engineering","code":"S63","ticker":"S63.SI","sector":"Ind: Aviation & Aerospace","mktCapM":32477.17},{"name":"SIA","code":"C6L","ticker":"C6L.SI","sector":"Ind: Aviation & Aerospace","mktCapM":24104.27},{"name":"SATS","code":"S58","ticker":"S58.SI","sector":"Ind: Aviation & Aerospace","mktCapM":6632.18},{"name":"SIA Engineering","code":"S59","ticker":"S59.SI","sector":"Ind: Aviation & Aerospace","mktCapM":3905.44},{"name":"Keppel","code":"BN4","ticker":"BN4.SI","sector":"Ind: Construction & Infra","mktCapM":19931.93},{"name":"Civmec","code":"P9D","ticker":"P9D.SI","sector":"Ind: Construction & Infra","mktCapM":882.36},{"name":"Wee Hur","code":"E3B","ticker":"E3B.SI","sector":"Ind: Construction & Infra","mktCapM":597.51},{"name":"SoilbuildConstr","code":"ZQM","ticker":"ZQM.SI","sector":"Ind: Construction & Infra","mktCapM":453.38},{"name":"OKP","code":"5CF","ticker":"5CF.SI","sector":"Ind: Construction & Infra","mktCapM":410.94},{"name":"Koh Eco","code":"5HV","ticker":"5HV.SI","sector":"Ind: Construction & Infra","mktCapM":377.64},{"name":"Lum Chang Creat","code":"LCC","ticker":"LCC.SI","sector":"Ind: Construction & Infra","mktCapM":242.55},{"name":"Oiltek","code":"HQU","ticker":"HQU.SI","sector":"Ind: Environmental Svcs","mktCapM":639.21},{"name":"GSH","code":"BDX","ticker":"BDX.SI","sector":"Ind: Environmental Svcs","mktCapM":409.08},{"name":"ComfortDelGro","code":"C52","ticker":"C52.SI","sector":"Ind: Logistics & Transport","mktCapM":2882.69},{"name":"HPH Trust SGD","code":"P7VU","ticker":"P7VU.SI","sector":"Ind: Logistics & Transport","mktCapM":2102.34},{"name":"SBS Transit","code":"S61","ticker":"S61.SI","sector":"Ind: Logistics & Transport","mktCapM":1161.73},{"name":"SingPost","code":"S08","ticker":"S08.SI","sector":"Ind: Logistics & Transport","mktCapM":754.56},{"name":"Jardine C&C","code":"C07","ticker":"C07.SI","sector":"Ind: Manufacturing","mktCapM":10568.62},{"name":"Boustead","code":"F9D","ticker":"F9D.SI","sector":"Ind: Manufacturing","mktCapM":1009.45},{"name":"HRnetGroup","code":"CHZ","ticker":"CHZ.SI","sector":"Ind: Manufacturing","mktCapM":738.66},{"name":"Ever Glory","code":"ZKX","ticker":"ZKX.SI","sector":"Ind: Manufacturing","mktCapM":391.66},{"name":"ISDN","code":"I07","ticker":"I07.SI","sector":"Ind: Manufacturing","mktCapM":306.05},{"name":"GP Industries","code":"G20","ticker":"G20.SI","sector":"Ind: Manufacturing","mktCapM":278.69},{"name":"Avarga Ltd","code":"X5N","ticker":"X5N.SI","sector":"Ind: Manufacturing","mktCapM":276.0},{"name":"XMH","code":"BQF","ticker":"BQF.SI","sector":"Ind: Manufacturing","mktCapM":252.18},{"name":"Tai Sin Electric","code":"500","ticker":"500.SI","sector":"Ind: Manufacturing","mktCapM":248.54},{"name":"JEP","code":"1J4","ticker":"1J4.SI","sector":"Ind: Manufacturing","mktCapM":241.62},{"name":"Tiong Woon","code":"BQM","ticker":"BQM.SI","sector":"Ind: Manufacturing","mktCapM":236.47},{"name":"Hafary","code":"5VS","ticker":"5VS.SI","sector":"Ind: Manufacturing","mktCapM":213.12},{"name":"YZJ Shipbldg SGD","code":"BS6","ticker":"BS6.SI","sector":"Ind: Shipping & Marine","mktCapM":13774.56},{"name":"MarcoPolo Marine","code":"5LY","ticker":"5LY.SI","sector":"Ind: Shipping & Marine","mktCapM":524.5},{"name":"SamuderaShipping","code":"S56","ticker":"S56.SI","sector":"Ind: Shipping & Marine","mktCapM":511.14},{"name":"COSCO SHP SG","code":"F83","ticker":"F83.SI","sector":"Ind: Shipping & Marine","mktCapM":501.59},{"name":"NamCheong","code":"1MZ","ticker":"1MZ.SI","sector":"Ind: Shipping & Marine","mktCapM":441.22},{"name":"Penguin Intl","code":"BTM","ticker":"BTM.SI","sector":"Ind: Shipping & Marine","mktCapM":332.46},{"name":"ASL Marine","code":"A04","ticker":"A04.SI","sector":"Ind: Shipping & Marine","mktCapM":298.42},{"name":"Nordic","code":"MR7","ticker":"MR7.SI","sector":"Ind: Shipping & Marine","mktCapM":210.96},{"name":"CapLand IntCom T","code":"C38U","ticker":"C38U.SI","sector":"Real Estate","mktCapM":18911.4},{"name":"CapLand Ascendas REIT","code":"A17U","ticker":"A17U.SI","sector":"Real Estate","mktCapM":12687.85},{"name":"CapitaLandInvest","code":"9CI","ticker":"9CI.SI","sector":"Real Estate","mktCapM":12583.7},{"name":"UOL","code":"U14","ticker":"U14.SI","sector":"Real Estate","mktCapM":8127.31},{"name":"CityDev","code":"C09","ticker":"C09.SI","sector":"Real Estate","mktCapM":7022.14},{"name":"Mapletree PanAsia Com Tr","code":"N2IU","ticker":"N2IU.SI","sector":"Real Estate","mktCapM":6869.68},{"name":"Mapletree Log Tr","code":"M44U","ticker":"M44U.SI","sector":"Real Estate","mktCapM":6297.47},{"name":"Mapletree Ind Tr","code":"ME8U","ticker":"ME8U.SI","sector":"Real Estate","mktCapM":5538.71},{"name":"Keppel DC Reit","code":"AJBU","ticker":"AJBU.SI","sector":"Real Estate","mktCapM":5503.89},{"name":"Frasers Cpt Tr","code":"J69U","ticker":"J69U.SI","sector":"Real Estate","mktCapM":4666.62},{"name":"SingaporeLandGrp","code":"U06","ticker":"U06.SI","sector":"Real Estate","mktCapM":4585.16},{"name":"Keppel Reit","code":"K71U","ticker":"K71U.SI","sector":"Real Estate","mktCapM":4321.59},{"name":"Suntec Reit","code":"T82U","ticker":"T82U.SI","sector":"Real Estate","mktCapM":4315.09},{"name":"Frasers Property","code":"TQ5","ticker":"TQ5.SI","sector":"Real Estate","mktCapM":4279.39},{"name":"Frasers L&C Tr","code":"BUOU","ticker":"BUOU.SI","sector":"Real Estate","mktCapM":3706.23},{"name":"CapLand Ascott T","code":"HMN","ticker":"HMN.SI","sector":"Real Estate","mktCapM":3442.49},{"name":"ParkwayLife Reit","code":"C2PU","ticker":"C2PU.SI","sector":"Real Estate","mktCapM":2669.35},{"name":"GuocoLand","code":"F17","ticker":"F17.SI","sector":"Real Estate","mktCapM":2393.13},{"name":"OUEREIT","code":"TS0U","ticker":"TS0U.SI","sector":"Real Estate","mktCapM":1963.15},{"name":"ESR REIT","code":"9A4U","ticker":"9A4U.SI","sector":"Real Estate","mktCapM":1915.98},{"name":"Lendlease Reit","code":"JYEU","ticker":"JYEU.SI","sector":"Real Estate","mktCapM":1913.04},{"name":"Cent Accom REIT","code":"8C8U","ticker":"8C8U.SI","sector":"Real Estate","mktCapM":1862.96},{"name":"CapLand India T","code":"CY6U","ticker":"CY6U.SI","sector":"Real Estate","mktCapM":1546.39},{"name":"PropNex","code":"OYY","ticker":"OYY.SI","sector":"Real Estate","mktCapM":1376.4},{"name":"Ho Bee Land","code":"H13","ticker":"H13.SI","sector":"Real Estate","mktCapM":1354.59},{"name":"AIMS APAC Reit","code":"O5RU","ticker":"O5RU.SI","sector":"Real Estate","mktCapM":1312.9},{"name":"Tosei","code":"S2D","ticker":"S2D.SI","sector":"Real Estate","mktCapM":1295.72},{"name":"StarhillGbl Reit","code":"P40U","ticker":"P40U.SI","sector":"Real Estate","mktCapM":1264.95},{"name":"Stoneweg EUTrust SGD","code":"SEB","ticker":"SEB.SI","sector":"Real Estate","mktCapM":1263.39},{"name":"Bukit Sembawang","code":"B61","ticker":"B61.SI","sector":"Real Estate","mktCapM":1222.06},{"name":"Wing Tai","code":"W05","ticker":"W05.SI","sector":"Real Estate","mktCapM":1184.03},{"name":"Yanlord Land","code":"Z25","ticker":"Z25.SI","sector":"Real Estate","mktCapM":1178.24},{"name":"Far East HTrust","code":"Q5T","ticker":"Q5T.SI","sector":"Real Estate","mktCapM":1170.3},{"name":"First Sponsor","code":"ADN","ticker":"ADN.SI","sector":"Real Estate","mktCapM":1140.56},{"name":"CapLand China T","code":"AU8U","ticker":"AU8U.SI","sector":"Real Estate","mktCapM":1115.79},{"name":"UOA","code":"EH5","ticker":"EH5.SI","sector":"Real Estate","mktCapM":1113.5},{"name":"UIBREIT","code":"UIBU","ticker":"UIBU.SI","sector":"Real Estate","mktCapM":1106.36},{"name":"CDL HTrust","code":"J85","ticker":"J85.SI","sector":"Real Estate","mktCapM":986.58},{"name":"Sasseur Reit","code":"CRPU","ticker":"CRPU.SI","sector":"Real Estate","mktCapM":860.0},{"name":"Hong Fok","code":"H30","ticker":"H30.SI","sector":"Real Estate","mktCapM":759.96},{"name":"OUE","code":"LJ3","ticker":"LJ3.SI","sector":"Real Estate","mktCapM":758.6},{"name":"Far East Orchard","code":"O10","ticker":"O10.SI","sector":"Real Estate","mktCapM":544.94},{"name":"Alpha Integrated REIT","code":"M1GU","ticker":"M1GU.SI","sector":"Real Estate","mktCapM":528.78},{"name":"First Reit","code":"AW9U","ticker":"AW9U.SI","sector":"Real Estate","mktCapM":466.23},{"name":"Tuan Sing","code":"T24","ticker":"T24.SI","sector":"Real Estate","mktCapM":399.81},{"name":"GRC","code":"S3N","ticker":"S3N.SI","sector":"Real Estate","mktCapM":392.76},{"name":"Daiwa Hse Log Tr","code":"DHLU","ticker":"DHLU.SI","sector":"Real Estate","mktCapM":336.56},{"name":"Oxley","code":"5UX","ticker":"5UX.SI","sector":"Real Estate","mktCapM":315.84},{"name":"Bund Center","code":"BTE","ticker":"BTE.SI","sector":"Real Estate","mktCapM":295.92},{"name":"IREIT Global SGD","code":"UD1U","ticker":"UD1U.SI","sector":"Real Estate","mktCapM":282.42},{"name":"JustCo","code":"JCO","ticker":"JCO.SI","sector":"Real Estate","mktCapM":264.19},{"name":"LHN","code":"41O","ticker":"41O.SI","sector":"Real Estate","mktCapM":250.47},{"name":"SingHoldings","code":"5IC","ticker":"5IC.SI","sector":"Real Estate","mktCapM":240.6},{"name":"BHG Retail Reit","code":"BMGU","ticker":"BMGU.SI","sector":"Real Estate","mktCapM":239.02},{"name":"APAC Realty","code":"CLN","ticker":"CLN.SI","sector":"Real Estate","mktCapM":232.76},{"name":"Coliwoo Hldgs","code":"W8W","ticker":"W8W.SI","sector":"Real Estate","mktCapM":230.78},{"name":"EC World Reit","code":"BWCU","ticker":"BWCU.SI","sector":"Real Estate","mktCapM":226.75},{"name":"Chuan Hup","code":"C33","ticker":"C33.SI","sector":"Real Estate","mktCapM":207.09},{"name":"Venture","code":"V03","ticker":"V03.SI","sector":"Technology","mktCapM":4916.76},{"name":"AEM SGD","code":"AWX","ticker":"AWX.SI","sector":"Technology","mktCapM":3137.08},{"name":"AvePoint","code":"AVP","ticker":"AVP.SI","sector":"Technology","mktCapM":2847.27},{"name":"IFAST","code":"AIY","ticker":"AIY.SI","sector":"Technology","mktCapM":2708.65},{"name":"UMS","code":"558","ticker":"558.SI","sector":"Technology","mktCapM":2227.63},{"name":"Frencken","code":"E28","ticker":"E28.SI","sector":"Technology","mktCapM":1273.92},{"name":"PC Partner","code":"PCT","ticker":"PCT.SI","sector":"Technology","mktCapM":1066.68},{"name":"CSE Global","code":"544","ticker":"544.SI","sector":"Technology","mktCapM":955.31},{"name":"Nanofilm","code":"MZH","ticker":"MZH.SI","sector":"Technology","mktCapM":756.76},{"name":"Aztech Gbl","code":"8AZ","ticker":"8AZ.SI","sector":"Technology","mktCapM":656.02},{"name":"Comba","code":"STC","ticker":"STC.SI","sector":"Technology","mktCapM":530.15},{"name":"Addvalue Tech","code":"A31","ticker":"A31.SI","sector":"Technology","mktCapM":500.94},{"name":"Valuetronics","code":"BN2","ticker":"BN2.SI","sector":"Technology","mktCapM":438.51},{"name":"Micro-Mechanics","code":"5DD","ticker":"5DD.SI","sector":"Technology","mktCapM":397.63},{"name":"Multi-Chem","code":"AWZ","ticker":"AWZ.SI","sector":"Technology","mktCapM":329.75},{"name":"Azeus","code":"BBW","ticker":"BBW.SI","sector":"Technology","mktCapM":310.5},{"name":"Info-Tech","code":"ITS","ticker":"ITS.SI","sector":"Technology","mktCapM":229.62},{"name":"Sembcorp Ind","code":"U96","ticker":"U96.SI","sector":"Utilities","mktCapM":11500.03},{"name":"Zheneng Jinjiang","code":"BWM","ticker":"BWM.SI","sector":"Utilities","mktCapM":803.11},{"name":"China Everbright","code":"U9E","ticker":"U9E.SI","sector":"Utilities","mktCapM":629.39},{"name":"CONCORD NE","code":"SEG","ticker":"SEG.SI","sector":"Utilities","mktCapM":523.2},{"name":"SIIC Environment","code":"BHK","ticker":"BHK.SI","sector":"Utilities","mktCapM":424.99},{"name":"Sunpower","code":"5GD","ticker":"5GD.SI","sector":"Utilities","mktCapM":406.6},{"name":"Gallant Venture","code":"5IG","ticker":"5IG.SI","sector":"Utilities","mktCapM":305.94}];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const WEIGHTS       = { w1:0.10, m1:0.35, m3:0.35, m6:0.15 };
const TRADING_DAYS  = { w1:5, m1:21, m3:63, m6:126 };
const TIE_THRESHOLD = 0.5;   // % — within this use 3M as tiebreaker
const TOP_SECTORS   = 3;     // top N qualifying sectors to trade
const SCORE_NAMES   = 5;     // names used to compute sector score
const MIN_VALID     = 3;     // minimum names with data to score a sector
const STI_TICKER    = "%5ESTI"; // ^STI encoded for URL

// ─── FETCH: Yahoo Finance via corsproxy.io ────────────────────────────────────
async function fetchYahoo(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`;
  const proxied = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error("No chart result");
  const closes = result.indicators?.quote?.[0]?.close;
  const timestamps = result.timestamp;
  if (!closes || !timestamps) throw new Error("No price data");
  // Filter null closes
  const history = timestamps
    .map((t, i) => ({ t, c: closes[i] }))
    .filter(x => x.c != null);
  if (history.length < 30) throw new Error("Insufficient history");
  return history;
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

    // Build ticker list: top SCORE_NAMES per sector + STI
    const tickersNeeded = new Set(["STI"]);
    Object.values(sectorMap).forEach(stocks =>
      stocks.slice(0, SCORE_NAMES).forEach(s => tickersNeeded.add(s.ticker))
    );
    const tickerList = [...tickersNeeded];
    setProgress({ done:0, total:tickerList.length, current:"" });

    const results  = {};
    const errors   = [];

    for (let i = 0; i < tickerList.length; i++) {
      if (abortRef.current) break;
      const t = tickerList[i];
      setProgress({ done:i, total:tickerList.length, current: t === "STI" ? "^STI (benchmark)" : t });
      try {
        // STI uses different ticker format
        const fetchTicker = t === "STI" ? STI_TICKER : t;
        const history = await fetchYahoo(fetchTicker);
        results[t] = { returns: computeReturns(history), error: null };
      } catch (e) {
        results[t] = { returns: null, error: e.message };
        if (t !== "STI") errors.push({ ticker: t, error: e.message });
        else setStiError(e.message);
      }
      // 300ms throttle between requests
      if (i < tickerList.length - 1) await new Promise(r => setTimeout(r, 300));
    }

    setProgress({ done: tickerList.length, total: tickerList.length, current: "" });
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

      // Top name by market cap with valid data = the trade candidate
      const tradeStock = scored.find(s => s.returns != null) ?? scored[0];

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
              {status==="loading" ? `Fetching… ${pct}%` : "↻ Refresh Data"}
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
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#334155" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📈</div>
                <div style={{ fontSize:16, fontWeight:600, color:"#475569" }}>
                  Click "Refresh Data" to run the momentum analysis
                </div>
                <div style={{ fontSize:13, color:"#334155", marginTop:8 }}>
                  207 stocks · SGD ≥200M · 16 sectors · Top-5 scoring · 1 trade per sector · STI benchmark
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
                                  background: i===0 ? "rgba(37,99,235,0.08)" : "transparent" }}>
                                <td style={{ padding:"5px 8px" }}>
                                  <span style={{ fontSize:10, fontWeight:700,
                                    color: i===0 ? "#10b981" : "#64748b" }}>
                                    {i===0 ? "TRADE" : "SCORE"}
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
                                {s.tradeStock.code} · SGD {fmtCap(s.tradeStock.mktCapM)} · #1 by mkt cap with data
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
              All 5 stocks used for sector scoring. TRADE = #1 by mkt cap with valid data.
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
                            background: i===0 ? "rgba(37,99,235,0.06)" : "transparent" }}>
                            <td style={{ padding:"7px 12px" }}>
                              <span style={{ fontSize:10, fontWeight:700,
                                color: i===0 ? "#10b981" : "#64748b" }}>
                                {i===0 ? "TRADE" : "SCORE"}
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
          <div><span style={{ color:"#475569", fontWeight:600 }}>Universe:</span> 207 stocks · SGD ≥200M · 16 sectors</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Score formula:</span> 1W×10% + 1M×35% + 3M×35% + 6M×15%</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Sector score:</span> avg of top 5 by mkt cap (min 3 valid)</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Qualify:</span> score &gt;0% AND &gt; STI benchmark</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Trade:</span> #1 name by mkt cap with data per qualifying sector</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Positions:</span> max {TOP_SECTORS} (one per sector)</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Tiebreaker:</span> 3M return when gap ≤0.5%</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Cash:</span> no sector beats STI / all ≤0%</div>
          <div><span style={{ color:"#475569", fontWeight:600 }}>Proxy:</span> corsproxy.io · 300ms throttle</div>
        </div>
      </div>
    </div>
  );
}
