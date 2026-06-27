import { useState, useEffect, useCallback, useRef } from "react";

// ─── HARDCODED UNIVERSE (SGX CSV as at 27 Jun 2025, filtered SGD ≥100M) ──────
const STOCK_UNIVERSE = [{"name":"Kep Infra Tr","code":"A7RU","ticker":"A7RU.SI","sector":"Basic Materials","mktCapM":3317.06},{"name":"BRC Asia","code":"BEC","ticker":"BEC.SI","sector":"Basic Materials","mktCapM":1198.91},{"name":"Sri Trang Gloves","code":"STG","ticker":"STG.SI","sector":"Basic Materials","mktCapM":1071.0},{"name":"Sri Trang Agro","code":"NC2","ticker":"NC2.SI","sector":"Basic Materials","mktCapM":988.7},{"name":"PanUnited","code":"P52","ticker":"P52.SI","sector":"Basic Materials","mktCapM":945.51},{"name":"Straits Trading","code":"S20","ticker":"S20.SI","sector":"Basic Materials","mktCapM":754.9},{"name":"Halcyon Agri","code":"5VJ","ticker":"5VJ.SI","sector":"Basic Materials","mktCapM":653.96},{"name":"ChinaSunsine","code":"QES","ticker":"QES.SI","sector":"Basic Materials","mktCapM":643.53},{"name":"MSC","code":"NPW","ticker":"NPW.SI","sector":"Basic Materials","mktCapM":494.92},{"name":"CNMC Goldmine","code":"5TP","ticker":"5TP.SI","sector":"Basic Materials","mktCapM":449.87},{"name":"Intl Cement","code":"KUO","ticker":"KUO.SI","sector":"Basic Materials","mktCapM":344.08},{"name":"NSL","code":"N02","ticker":"N02.SI","sector":"Basic Materials","mktCapM":325.0},{"name":"SouthernAlliance","code":"QNS","ticker":"QNS.SI","sector":"Basic Materials","mktCapM":273.8},{"name":"HG Metal","code":"BTG","ticker":"BTG.SI","sector":"Basic Materials","mktCapM":133.25},{"name":"FortressMinerals","code":"OAJ","ticker":"OAJ.SI","sector":"Basic Materials","mktCapM":130.83},{"name":"EnGro","code":"S44","ticker":"S44.SI","sector":"Basic Materials","mktCapM":129.39},{"name":"Infinity Dev","code":"ZBA","ticker":"ZBA.SI","sector":"Basic Materials","mktCapM":123.24},{"name":"Alita Resources","code":"40F","ticker":"40F.SI","sector":"Basic Materials","mktCapM":115.16},{"name":"Singtel","code":"Z74","ticker":"Z74.SI","sector":"Communication Services","mktCapM":72514.34},{"name":"NetLink NBN Tr","code":"CJLU","ticker":"CJLU.SI","sector":"Communication Services","mktCapM":3799.55},{"name":"StarHub","code":"CC3","ticker":"CC3.SI","sector":"Communication Services","mktCapM":1795.03},{"name":"Asian Pay Tv Tr","code":"S7OU","ticker":"S7OU.SI","sector":"Communication Services","mktCapM":153.54},{"name":"TeleChoice Intl","code":"T41","ticker":"T41.SI","sector":"Communication Services","mktCapM":104.52},{"name":"WinkingStudios","code":"WKS","ticker":"WKS.SI","sector":"Communication Services","mktCapM":101.69},{"name":"Genting Sing","code":"G13","ticker":"G13.SI","sector":"Consumer Cyclical","mktCapM":7313.28},{"name":"HPL","code":"H15","ticker":"H15.SI","sector":"Consumer Cyclical","mktCapM":2430.95},{"name":"Hong Leong Asia","code":"H22","ticker":"H22.SI","sector":"Consumer Cyclical","mktCapM":2202.87},{"name":"TheHourGlass","code":"AGS","ticker":"AGS.SI","sector":"Consumer Cyclical","mktCapM":1675.34},{"name":"Centurion","code":"OU8","ticker":"OU8.SI","sector":"Consumer Cyclical","mktCapM":1219.13},{"name":"ValueMax","code":"T6I","ticker":"T6I.SI","sector":"Consumer Cyclical","mktCapM":847.52},{"name":"Aspial Lifestyle","code":"5UF","ticker":"5UF.SI","sector":"Consumer Cyclical","mktCapM":730.32},{"name":"MoneyMax Fin","code":"5WJ","ticker":"5WJ.SI","sector":"Consumer Cyclical","mktCapM":726.13},{"name":"Stamford Land","code":"H07","ticker":"H07.SI","sector":"Consumer Cyclical","mktCapM":719.55},{"name":"VICOM Ltd","code":"WJP","ticker":"WJP.SI","sector":"Consumer Cyclical","mktCapM":634.68},{"name":"Cortina","code":"C41","ticker":"C41.SI","sector":"Consumer Cyclical","mktCapM":596.08},{"name":"Hotel Grand","code":"H18","ticker":"H18.SI","sector":"Consumer Cyclical","mktCapM":532.39},{"name":"Kimly","code":"1D0","ticker":"1D0.SI","sector":"Consumer Cyclical","mktCapM":485.51},{"name":"Banyan Tree","code":"B58","ticker":"B58.SI","sector":"Consumer Cyclical","mktCapM":477.2},{"name":"Bonvests","code":"B28","ticker":"B28.SI","sector":"Consumer Cyclical","mktCapM":385.46},{"name":"Metro","code":"M01","ticker":"M01.SI","sector":"Consumer Cyclical","mktCapM":385.04},{"name":"Helens","code":"HLS","ticker":"HLS.SI","sector":"Consumer Cyclical","mktCapM":358.03},{"name":"Aspial Corp","code":"A30","ticker":"A30.SI","sector":"Consumer Cyclical","mktCapM":326.08},{"name":"Hiap Hoe","code":"5JK","ticker":"5JK.SI","sector":"Consumer Cyclical","mktCapM":305.86},{"name":"Straco","code":"S85","ticker":"S85.SI","sector":"Consumer Cyclical","mktCapM":299.32},{"name":"Thakral","code":"AWI","ticker":"AWI.SI","sector":"Consumer Cyclical","mktCapM":272.24},{"name":"Hotel Royal","code":"H12","ticker":"H12.SI","sector":"Consumer Cyclical","mktCapM":254.02},{"name":"PSC Corporation","code":"DM0","ticker":"DM0.SI","sector":"Consumer Cyclical","mktCapM":231.75},{"name":"Tat Seng Pkg","code":"T12","ticker":"T12.SI","sector":"Consumer Cyclical","mktCapM":156.41},{"name":"Old Chang Kee","code":"5ML","ticker":"5ML.SI","sector":"Consumer Cyclical","mktCapM":142.01},{"name":"Grand Banks","code":"G50","ticker":"G50.SI","sector":"Consumer Cyclical","mktCapM":131.54},{"name":"Union Gas","code":"1F2","ticker":"1F2.SI","sector":"Consumer Cyclical","mktCapM":122.25},{"name":"YHI Intl","code":"BPF","ticker":"BPF.SI","sector":"Consumer Cyclical","mktCapM":115.28},{"name":"Heeton","code":"5DP","ticker":"5DP.SI","sector":"Consumer Cyclical","mktCapM":114.5},{"name":"Taka Jewellery","code":"42L","ticker":"42L.SI","sector":"Consumer Cyclical","mktCapM":110.2},{"name":"ProsperCap","code":"PPC","ticker":"PPC.SI","sector":"Consumer Cyclical","mktCapM":105.99},{"name":"Wilmar Intl","code":"F34","ticker":"F34.SI","sector":"Consumer Defensive","mktCapM":22849.01},{"name":"ThaiBev","code":"Y92","ticker":"Y92.SI","sector":"Consumer Defensive","mktCapM":11057.94},{"name":"Emperador Inc.","code":"EMI","ticker":"EMI.SI","sector":"Consumer Defensive","mktCapM":5064.88},{"name":"Sheng Siong","code":"OV8","ticker":"OV8.SI","sector":"Consumer Defensive","mktCapM":4841.39},{"name":"First Resources","code":"EB5","ticker":"EB5.SI","sector":"Consumer Defensive","mktCapM":4829.89},{"name":"Olam Group","code":"VC2","ticker":"VC2.SI","sector":"Consumer Defensive","mktCapM":4563.09},{"name":"Golden Agri-Res","code":"E5H","ticker":"E5H.SI","sector":"Consumer Defensive","mktCapM":3424.05},{"name":"Bumitama Agri","code":"P8Z","ticker":"P8Z.SI","sector":"Consumer Defensive","mktCapM":2826.66},{"name":"F & N","code":"F99","ticker":"F99.SI","sector":"Consumer Defensive","mktCapM":2066.51},{"name":"Food Empire","code":"F03","ticker":"F03.SI","sector":"Consumer Defensive","mktCapM":1539.61},{"name":"QAF","code":"Q01","ticker":"Q01.SI","sector":"Consumer Defensive","mktCapM":560.89},{"name":"Delfi","code":"P34","ticker":"P34.SI","sector":"Consumer Defensive","mktCapM":543.93},{"name":"Indofood Agri","code":"5JS","ticker":"5JS.SI","sector":"Consumer Defensive","mktCapM":502.53},{"name":"TSH Resources","code":"TSH","ticker":"TSH.SI","sector":"Consumer Defensive","mktCapM":455.38},{"name":"Mewah Intl","code":"MV4","ticker":"MV4.SI","sector":"Consumer Defensive","mktCapM":427.69},{"name":"Yeo Hiap Seng","code":"Y03","ticker":"Y03.SI","sector":"Consumer Defensive","mktCapM":363.77},{"name":"China Fishery","code":"B0Z","ticker":"B0Z.SI","sector":"Consumer Defensive","mktCapM":279.94},{"name":"JB Foods","code":"BEW","ticker":"BEW.SI","sector":"Consumer Defensive","mktCapM":246.03},{"name":"Raffles Edu","code":"NR7","ticker":"NR7.SI","sector":"Consumer Defensive","mktCapM":214.46},{"name":"Pacific Andes","code":"P11","ticker":"P11.SI","sector":"Consumer Defensive","mktCapM":189.72},{"name":"Del Monte Pac","code":"D03","ticker":"D03.SI","sector":"Consumer Defensive","mktCapM":159.41},{"name":"Kencana Agri","code":"BNE","ticker":"BNE.SI","sector":"Consumer Defensive","mktCapM":123.42},{"name":"Seatrium Ltd","code":"5E2","ticker":"5E2.SI","sector":"Energy","mktCapM":6608.04},{"name":"China Aviation","code":"G92","ticker":"G92.SI","sector":"Energy","mktCapM":1556.93},{"name":"Geo Energy Res","code":"RE4","ticker":"RE4.SI","sector":"Energy","mktCapM":792.74},{"name":"Mermaid Maritime","code":"DU4","ticker":"DU4.SI","sector":"Energy","mktCapM":181.51},{"name":"Beng Kuang","code":"BEZ","ticker":"BEZ.SI","sector":"Energy","mktCapM":134.95},{"name":"RH PetroGas","code":"T13","ticker":"T13.SI","sector":"Energy","mktCapM":119.85},{"name":"DBS","code":"D05","ticker":"D05.SI","sector":"Financial Services","mktCapM":185666.44},{"name":"OCBC Bank","code":"O39","ticker":"O39.SI","sector":"Financial Services","mktCapM":111614.04},{"name":"UOB","code":"U11","ticker":"U11.SI","sector":"Financial Services","mktCapM":65735.63},{"name":"Nomura Yen1k","code":"N33","ticker":"N33.SI","sector":"Financial Services","mktCapM":33137.59},{"name":"SGX","code":"S68","ticker":"S68.SI","sector":"Financial Services","mktCapM":25856.95},{"name":"Great Eastern","code":"G07","ticker":"G07.SI","sector":"Financial Services","mktCapM":15288.21},{"name":"UOB Kay Hian","code":"U10","ticker":"U10.SI","sector":"Financial Services","mktCapM":3582.45},{"name":"YZJ Maritime","code":"8YZ","ticker":"8YZ.SI","sector":"Financial Services","mktCapM":2058.56},{"name":"AMTD IDEA OV","code":"HKB","ticker":"HKB.SI","sector":"Financial Services","mktCapM":1987.42},{"name":"Pacific Century","code":"P15","ticker":"P15.SI","sector":"Financial Services","mktCapM":1230.64},{"name":"Hong Leong Fin","code":"S41","ticker":"S41.SI","sector":"Financial Services","mktCapM":1115.75},{"name":"YZJ Fin Hldg","code":"YF8","ticker":"YF8.SI","sector":"Financial Services","mktCapM":748.3},{"name":"UOI","code":"U13","ticker":"U13.SI","sector":"Financial Services","mktCapM":510.64},{"name":"Sing Inv & Fin","code":"S35","ticker":"S35.SI","sector":"Financial Services","mktCapM":366.48},{"name":"CreditBureauAsia","code":"TCU","ticker":"TCU.SI","sector":"Financial Services","mktCapM":263.86},{"name":"Global Inv","code":"B73","ticker":"B73.SI","sector":"Financial Services","mktCapM":210.21},{"name":"Hotung Inv","code":"BLS","ticker":"BLS.SI","sector":"Financial Services","mktCapM":154.99},{"name":"Spura Finance","code":"S23","ticker":"S23.SI","sector":"Financial Services","mktCapM":128.54},{"name":"Lonza","code":"O6Z","ticker":"O6Z.SI","sector":"Healthcare","mktCapM":59903.63},{"name":"IHH","code":"Q0F","ticker":"Q0F.SI","sector":"Healthcare","mktCapM":23732.32},{"name":"CMS","code":"8A8","ticker":"8A8.SI","sector":"Healthcare","mktCapM":4075.46},{"name":"Haw Par","code":"H02","ticker":"H02.SI","sector":"Healthcare","mktCapM":3506.47},{"name":"Top Glove","code":"BVA","ticker":"BVA.SI","sector":"Healthcare","mktCapM":1759.0},{"name":"Raffles Medical","code":"BSL","ticker":"BSL.SI","sector":"Healthcare","mktCapM":1692.98},{"name":"Thomson Medical","code":"A50","ticker":"A50.SI","sector":"Healthcare","mktCapM":1401.51},{"name":"Riverstone","code":"AP4","ticker":"AP4.SI","sector":"Healthcare","mktCapM":1230.2},{"name":"Q&M Dental","code":"QC7","ticker":"QC7.SI","sector":"Healthcare","mktCapM":530.71},{"name":"IX Biopharma","code":"42C","ticker":"42C.SI","sector":"Healthcare","mktCapM":376.8},{"name":"Aoxin Q & M","code":"1D4","ticker":"1D4.SI","sector":"Healthcare","mktCapM":266.12},{"name":"ISEC","code":"40T","ticker":"40T.SI","sector":"Healthcare","mktCapM":181.35},{"name":"OUE Healthcare","code":"5WA","ticker":"5WA.SI","sector":"Healthcare","mktCapM":168.84},{"name":"Hyphens Pharma","code":"1J5","ticker":"1J5.SI","sector":"Healthcare","mktCapM":108.12},{"name":"ST Engineering","code":"S63","ticker":"S63.SI","sector":"Ind: Aviation & Aerospace","mktCapM":32477.17},{"name":"SIA","code":"C6L","ticker":"C6L.SI","sector":"Ind: Aviation & Aerospace","mktCapM":24104.26},{"name":"SATS","code":"S58","ticker":"S58.SI","sector":"Ind: Aviation & Aerospace","mktCapM":6632.18},{"name":"SIA Engineering","code":"S59","ticker":"S59.SI","sector":"Ind: Aviation & Aerospace","mktCapM":3905.44},{"name":"Keppel","code":"BN4","ticker":"BN4.SI","sector":"Ind: Construction & Infra","mktCapM":19931.93},{"name":"Civmec","code":"P9D","ticker":"P9D.SI","sector":"Ind: Construction & Infra","mktCapM":882.36},{"name":"Wee Hur","code":"E3B","ticker":"E3B.SI","sector":"Ind: Construction & Infra","mktCapM":597.51},{"name":"SoilbuildConstr","code":"ZQM","ticker":"ZQM.SI","sector":"Ind: Construction & Infra","mktCapM":453.38},{"name":"OKP","code":"5CF","ticker":"5CF.SI","sector":"Ind: Construction & Infra","mktCapM":410.94},{"name":"Koh Eco","code":"5HV","ticker":"5HV.SI","sector":"Ind: Construction & Infra","mktCapM":377.64},{"name":"Lum Chang Creat","code":"LCC","ticker":"LCC.SI","sector":"Ind: Construction & Infra","mktCapM":242.55},{"name":"Lum Chang","code":"L19","ticker":"L19.SI","sector":"Ind: Construction & Infra","mktCapM":187.31},{"name":"Hock Lian Seng","code":"J2T","ticker":"J2T.SI","sector":"Ind: Construction & Infra","mktCapM":183.58},{"name":"KSH","code":"ER0","ticker":"ER0.SI","sector":"Ind: Construction & Infra","mktCapM":179.47},{"name":"Ley Choon","code":"Q0X","ticker":"Q0X.SI","sector":"Ind: Construction & Infra","mktCapM":138.53},{"name":"Koh Bros","code":"K75","ticker":"K75.SI","sector":"Ind: Construction & Infra","mktCapM":138.17},{"name":"Huationg Global","code":"41B","ticker":"41B.SI","sector":"Ind: Construction & Infra","mktCapM":127.6},{"name":"Oiltek","code":"HQU","ticker":"HQU.SI","sector":"Ind: Environmental Svcs","mktCapM":639.21},{"name":"GSH","code":"BDX","ticker":"BDX.SI","sector":"Ind: Environmental Svcs","mktCapM":409.08},{"name":"ComfortDelGro","code":"C52","ticker":"C52.SI","sector":"Ind: Logistics & Transport","mktCapM":2882.69},{"name":"HPH Trust SGD","code":"P7VU","ticker":"P7VU.SI","sector":"Ind: Logistics & Transport","mktCapM":2102.34},{"name":"SBS Transit","code":"S61","ticker":"S61.SI","sector":"Ind: Logistics & Transport","mktCapM":1161.73},{"name":"SingPost","code":"S08","ticker":"S08.SI","sector":"Ind: Logistics & Transport","mktCapM":754.56},{"name":"Jardine C&C","code":"C07","ticker":"C07.SI","sector":"Ind: Manufacturing","mktCapM":10568.62},{"name":"Boustead","code":"F9D","ticker":"F9D.SI","sector":"Ind: Manufacturing","mktCapM":1009.45},{"name":"HRnetGroup","code":"CHZ","ticker":"CHZ.SI","sector":"Ind: Manufacturing","mktCapM":738.66},{"name":"Ever Glory","code":"ZKX","ticker":"ZKX.SI","sector":"Ind: Manufacturing","mktCapM":391.66},{"name":"ISDN","code":"I07","ticker":"I07.SI","sector":"Ind: Manufacturing","mktCapM":306.05},{"name":"GP Industries","code":"G20","ticker":"G20.SI","sector":"Ind: Manufacturing","mktCapM":278.69},{"name":"Avarga Ltd","code":"X5N","ticker":"X5N.SI","sector":"Ind: Manufacturing","mktCapM":276.0},{"name":"XMH","code":"BQF","ticker":"BQF.SI","sector":"Ind: Manufacturing","mktCapM":252.18},{"name":"Tai Sin Electric","code":"500","ticker":"500.SI","sector":"Ind: Manufacturing","mktCapM":248.54},{"name":"JEP","code":"1J4","ticker":"1J4.SI","sector":"Ind: Manufacturing","mktCapM":241.62},{"name":"Tiong Woon","code":"BQM","ticker":"BQM.SI","sector":"Ind: Manufacturing","mktCapM":236.47},{"name":"Hafary","code":"5VS","ticker":"5VS.SI","sector":"Ind: Manufacturing","mktCapM":213.12},{"name":"Yoma Strategic","code":"Z59","ticker":"Z59.SI","sector":"Ind: Manufacturing","mktCapM":186.3},{"name":"InnoTek","code":"M14","ticker":"M14.SI","sector":"Ind: Manufacturing","mktCapM":170.2},{"name":"Nam Lee Metal","code":"G0I","ticker":"G0I.SI","sector":"Ind: Manufacturing","mktCapM":164.6},{"name":"KingsmenCreative","code":"5MZ","ticker":"5MZ.SI","sector":"Ind: Manufacturing","mktCapM":107.31},{"name":"YZJ Shipbldg SGD","code":"BS6","ticker":"BS6.SI","sector":"Ind: Shipping & Marine","mktCapM":13774.56},{"name":"MarcoPolo Marine","code":"5LY","ticker":"5LY.SI","sector":"Ind: Shipping & Marine","mktCapM":524.5},{"name":"SamuderaShipping","code":"S56","ticker":"S56.SI","sector":"Ind: Shipping & Marine","mktCapM":511.14},{"name":"COSCO SHP SG","code":"F83","ticker":"F83.SI","sector":"Ind: Shipping & Marine","mktCapM":501.59},{"name":"NamCheong","code":"1MZ","ticker":"1MZ.SI","sector":"Ind: Shipping & Marine","mktCapM":441.22},{"name":"Penguin Intl","code":"BTM","ticker":"BTM.SI","sector":"Ind: Shipping & Marine","mktCapM":332.46},{"name":"ASL Marine","code":"A04","ticker":"A04.SI","sector":"Ind: Shipping & Marine","mktCapM":298.42},{"name":"Nordic","code":"MR7","ticker":"MR7.SI","sector":"Ind: Shipping & Marine","mktCapM":210.96},{"name":"SingShipping","code":"S19","ticker":"S19.SI","sector":"Ind: Shipping & Marine","mktCapM":122.18},{"name":"PacificRadiance","code":"RXS","ticker":"RXS.SI","sector":"Ind: Shipping & Marine","mktCapM":102.16},{"name":"CapLand IntCom T","code":"C38U","ticker":"C38U.SI","sector":"Real Estate","mktCapM":18911.4},{"name":"CapLand Ascendas REIT","code":"A17U","ticker":"A17U.SI","sector":"Real Estate","mktCapM":12687.84},{"name":"CapitaLandInvest","code":"9CI","ticker":"9CI.SI","sector":"Real Estate","mktCapM":12583.7},{"name":"UOL","code":"U14","ticker":"U14.SI","sector":"Real Estate","mktCapM":8127.31},{"name":"CityDev","code":"C09","ticker":"C09.SI","sector":"Real Estate","mktCapM":7022.14},{"name":"Mapletree PanAsia Com Tr","code":"N2IU","ticker":"N2IU.SI","sector":"Real Estate","mktCapM":6869.68},{"name":"Mapletree Log Tr","code":"M44U","ticker":"M44U.SI","sector":"Real Estate","mktCapM":6297.47},{"name":"Mapletree Ind Tr","code":"ME8U","ticker":"ME8U.SI","sector":"Real Estate","mktCapM":5538.71},{"name":"Keppel DC Reit","code":"AJBU","ticker":"AJBU.SI","sector":"Real Estate","mktCapM":5503.89},{"name":"Frasers Cpt Tr","code":"J69U","ticker":"J69U.SI","sector":"Real Estate","mktCapM":4666.62},{"name":"SingaporeLandGrp","code":"U06","ticker":"U06.SI","sector":"Real Estate","mktCapM":4585.16},{"name":"Keppel Reit","code":"K71U","ticker":"K71U.SI","sector":"Real Estate","mktCapM":4321.59},{"name":"Suntec Reit","code":"T82U","ticker":"T82U.SI","sector":"Real Estate","mktCapM":4315.09},{"name":"Frasers Property","code":"TQ5","ticker":"TQ5.SI","sector":"Real Estate","mktCapM":4279.39},{"name":"Frasers L&C Tr","code":"BUOU","ticker":"BUOU.SI","sector":"Real Estate","mktCapM":3706.23},{"name":"CapLand Ascott T","code":"HMN","ticker":"HMN.SI","sector":"Real Estate","mktCapM":3442.49},{"name":"ParkwayLife Reit","code":"C2PU","ticker":"C2PU.SI","sector":"Real Estate","mktCapM":2669.35},{"name":"GuocoLand","code":"F17","ticker":"F17.SI","sector":"Real Estate","mktCapM":2393.13},{"name":"OUEREIT","code":"TS0U","ticker":"TS0U.SI","sector":"Real Estate","mktCapM":1963.15},{"name":"ESR REIT","code":"9A4U","ticker":"9A4U.SI","sector":"Real Estate","mktCapM":1915.98},{"name":"Lendlease Reit","code":"JYEU","ticker":"JYEU.SI","sector":"Real Estate","mktCapM":1913.04},{"name":"Cent Accom REIT","code":"8C8U","ticker":"8C8U.SI","sector":"Real Estate","mktCapM":1862.96},{"name":"CapLand India T","code":"CY6U","ticker":"CY6U.SI","sector":"Real Estate","mktCapM":1546.39},{"name":"PropNex","code":"OYY","ticker":"OYY.SI","sector":"Real Estate","mktCapM":1376.4},{"name":"Ho Bee Land","code":"H13","ticker":"H13.SI","sector":"Real Estate","mktCapM":1354.59},{"name":"AIMS APAC Reit","code":"O5RU","ticker":"O5RU.SI","sector":"Real Estate","mktCapM":1312.9},{"name":"Tosei","code":"S2D","ticker":"S2D.SI","sector":"Real Estate","mktCapM":1295.72},{"name":"StarhillGbl Reit","code":"P40U","ticker":"P40U.SI","sector":"Real Estate","mktCapM":1264.95},{"name":"Stoneweg EUTrust SGD","code":"SEB","ticker":"SEB.SI","sector":"Real Estate","mktCapM":1263.39},{"name":"Bukit Sembawang","code":"B61","ticker":"B61.SI","sector":"Real Estate","mktCapM":1222.06},{"name":"Wing Tai","code":"W05","ticker":"W05.SI","sector":"Real Estate","mktCapM":1184.03},{"name":"Yanlord Land","code":"Z25","ticker":"Z25.SI","sector":"Real Estate","mktCapM":1178.24},{"name":"Far East HTrust","code":"Q5T","ticker":"Q5T.SI","sector":"Real Estate","mktCapM":1170.3},{"name":"First Sponsor","code":"ADN","ticker":"ADN.SI","sector":"Real Estate","mktCapM":1140.56},{"name":"CapLand China T","code":"AU8U","ticker":"AU8U.SI","sector":"Real Estate","mktCapM":1115.79},{"name":"UOA","code":"EH5","ticker":"EH5.SI","sector":"Real Estate","mktCapM":1113.5},{"name":"UIBREIT","code":"UIBU","ticker":"UIBU.SI","sector":"Real Estate","mktCapM":1106.36},{"name":"CDL HTrust","code":"J85","ticker":"J85.SI","sector":"Real Estate","mktCapM":986.58},{"name":"Sasseur Reit","code":"CRPU","ticker":"CRPU.SI","sector":"Real Estate","mktCapM":860.0},{"name":"Hong Fok","code":"H30","ticker":"H30.SI","sector":"Real Estate","mktCapM":759.96},{"name":"OUE","code":"LJ3","ticker":"LJ3.SI","sector":"Real Estate","mktCapM":758.6},{"name":"Far East Orchard","code":"O10","ticker":"O10.SI","sector":"Real Estate","mktCapM":544.94},{"name":"Alpha Integrated REIT","code":"M1GU","ticker":"M1GU.SI","sector":"Real Estate","mktCapM":528.78},{"name":"First Reit","code":"AW9U","ticker":"AW9U.SI","sector":"Real Estate","mktCapM":466.23},{"name":"Tuan Sing","code":"T24","ticker":"T24.SI","sector":"Real Estate","mktCapM":399.81},{"name":"GRC","code":"S3N","ticker":"S3N.SI","sector":"Real Estate","mktCapM":392.76},{"name":"Daiwa Hse Log Tr","code":"DHLU","ticker":"DHLU.SI","sector":"Real Estate","mktCapM":336.56},{"name":"Oxley","code":"5UX","ticker":"5UX.SI","sector":"Real Estate","mktCapM":315.84},{"name":"Bund Center","code":"BTE","ticker":"BTE.SI","sector":"Real Estate","mktCapM":295.92},{"name":"IREIT Global SGD","code":"UD1U","ticker":"UD1U.SI","sector":"Real Estate","mktCapM":282.42},{"name":"JustCo","code":"JCO","ticker":"JCO.SI","sector":"Real Estate","mktCapM":264.19},{"name":"LHN","code":"41O","ticker":"41O.SI","sector":"Real Estate","mktCapM":250.47},{"name":"SingHoldings","code":"5IC","ticker":"5IC.SI","sector":"Real Estate","mktCapM":240.6},{"name":"BHG Retail Reit","code":"BMGU","ticker":"BMGU.SI","sector":"Real Estate","mktCapM":239.02},{"name":"APAC Realty","code":"CLN","ticker":"CLN.SI","sector":"Real Estate","mktCapM":232.76},{"name":"Coliwoo Hldgs","code":"W8W","ticker":"W8W.SI","sector":"Real Estate","mktCapM":230.78},{"name":"EC World Reit","code":"BWCU","ticker":"BWCU.SI","sector":"Real Estate","mktCapM":226.75},{"name":"Chuan Hup","code":"C33","ticker":"C33.SI","sector":"Real Estate","mktCapM":207.09},{"name":"Soon Hock","code":"SHE","ticker":"SHE.SI","sector":"Real Estate","mktCapM":191.08},{"name":"Landmark REIT","code":"D5IU","ticker":"D5IU.SI","sector":"Real Estate","mktCapM":119.17},{"name":"Venture","code":"V03","ticker":"V03.SI","sector":"Technology","mktCapM":4916.76},{"name":"AEM SGD","code":"AWX","ticker":"AWX.SI","sector":"Technology","mktCapM":3137.07},{"name":"AvePoint","code":"AVP","ticker":"AVP.SI","sector":"Technology","mktCapM":2847.27},{"name":"IFAST","code":"AIY","ticker":"AIY.SI","sector":"Technology","mktCapM":2708.64},{"name":"UMS","code":"558","ticker":"558.SI","sector":"Technology","mktCapM":2227.63},{"name":"Frencken","code":"E28","ticker":"E28.SI","sector":"Technology","mktCapM":1273.92},{"name":"PC Partner","code":"PCT","ticker":"PCT.SI","sector":"Technology","mktCapM":1066.68},{"name":"CSE Global","code":"544","ticker":"544.SI","sector":"Technology","mktCapM":955.31},{"name":"Nanofilm","code":"MZH","ticker":"MZH.SI","sector":"Technology","mktCapM":756.76},{"name":"Aztech Gbl","code":"8AZ","ticker":"8AZ.SI","sector":"Technology","mktCapM":656.02},{"name":"Comba","code":"STC","ticker":"STC.SI","sector":"Technology","mktCapM":530.15},{"name":"Addvalue Tech","code":"A31","ticker":"A31.SI","sector":"Technology","mktCapM":500.94},{"name":"Valuetronics","code":"BN2","ticker":"BN2.SI","sector":"Technology","mktCapM":438.51},{"name":"Micro-Mechanics","code":"5DD","ticker":"5DD.SI","sector":"Technology","mktCapM":397.63},{"name":"Multi-Chem","code":"AWZ","ticker":"AWZ.SI","sector":"Technology","mktCapM":329.75},{"name":"Azeus","code":"BBW","ticker":"BBW.SI","sector":"Technology","mktCapM":310.5},{"name":"Info-Tech","code":"ITS","ticker":"ITS.SI","sector":"Technology","mktCapM":229.62},{"name":"METAOPTICS LTD","code":"9MT","ticker":"9MT.SI","sector":"Technology","mktCapM":175.92},{"name":"Powermatic Data","code":"BCY","ticker":"BCY.SI","sector":"Technology","mktCapM":126.3},{"name":"Toku Ltd","code":"TKU","ticker":"TKU.SI","sector":"Technology","mktCapM":111.2},{"name":"Sembcorp Ind","code":"U96","ticker":"U96.SI","sector":"Utilities","mktCapM":11500.03},{"name":"Zheneng Jinjiang","code":"BWM","ticker":"BWM.SI","sector":"Utilities","mktCapM":803.11},{"name":"China Everbright","code":"U9E","ticker":"U9E.SI","sector":"Utilities","mktCapM":629.39},{"name":"CONCORD NE","code":"SEG","ticker":"SEG.SI","sector":"Utilities","mktCapM":523.2},{"name":"SIIC Environment","code":"BHK","ticker":"BHK.SI","sector":"Utilities","mktCapM":424.99},{"name":"Sunpower","code":"5GD","ticker":"5GD.SI","sector":"Utilities","mktCapM":406.6},{"name":"Gallant Venture","code":"5IG","ticker":"5IG.SI","sector":"Utilities","mktCapM":305.94},{"name":"Hyflux","code":"600","ticker":"600.SI","sector":"Utilities","mktCapM":164.91},{"name":"Metis Energy","code":"L02","ticker":"L02.SI","sector":"Utilities","mktCapM":118.3}];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const WEIGHTS = { w1: 0.10, m1: 0.35, m3: 0.35, m6: 0.15 };
const TRADING_DAYS = { w1: 5, m1: 21, m3: 63, m6: 126 };
const TIE_THRESHOLD = 0.5; // % — within this gap, use 3M as tiebreaker
const TOP_SECTORS = 3;
const NAMES_PER_SECTOR = 2;
const SCORE_NAMES = 3;    // names used to compute sector score
const PROXY_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

// ─── YAHOO FINANCE FETCH via CORS proxy ───────────────────────────────────────
async function fetchPriceHistory(ticker) {
  // Use allorigins CORS proxy to fetch Yahoo Finance data from browser
  const url = `${PROXY_BASE}${ticker}?interval=1d&range=1y`;
  const proxied = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const outer = await res.json();
  const data = JSON.parse(outer.contents);
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error("No data");
  const closes = result.indicators?.quote?.[0]?.close;
  const timestamps = result.timestamp;
  if (!closes || !timestamps) throw new Error("No close prices");
  // Filter nulls
  const valid = timestamps.map((t, i) => ({ t, c: closes[i] })).filter(x => x.c != null);
  return valid;
}

function computeReturns(history) {
  if (!history || history.length < 5) return null;
  const last = history[history.length - 1].c;
  const getReturn = (days) => {
    if (history.length <= days) return null;
    const base = history[history.length - 1 - days].c;
    return base ? ((last - base) / base) * 100 : null;
  };
  return {
    w1: getReturn(TRADING_DAYS.w1),
    m1: getReturn(TRADING_DAYS.m1),
    m3: getReturn(TRADING_DAYS.m3),
    m6: getReturn(TRADING_DAYS.m6),
    latest: last,
  };
}

function weightedScore(returns) {
  if (!returns) return null;
  const { w1, m1, m3, m6 } = returns;
  const available = [
    w1 != null ? WEIGHTS.w1 : 0,
    m1 != null ? WEIGHTS.m1 : 0,
    m3 != null ? WEIGHTS.m3 : 0,
    m6 != null ? WEIGHTS.m6 : 0,
  ];
  const totalWeight = available.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return null;
  const raw =
    (w1 ?? 0) * WEIGHTS.w1 +
    (m1 ?? 0) * WEIGHTS.m1 +
    (m3 ?? 0) * WEIGHTS.m3 +
    (m6 ?? 0) * WEIGHTS.m6;
  return raw / totalWeight * (w1 != null ? 1 : 1); // normalise if any period missing
}

// ─── GROUP STOCKS BY SECTOR ────────────────────────────────────────────────────
function groupBySector(universe) {
  const map = {};
  universe.forEach(s => {
    if (!map[s.sector]) map[s.sector] = [];
    map[s.sector].push(s);
  });
  // Sort each sector by mktCapM desc (already sorted but ensure)
  Object.values(map).forEach(arr => arr.sort((a, b) => b.mktCapM - a.mktCapM));
  return map;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function SGXMomentum() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "" });
  const [stockData, setStockData] = useState({});   // ticker -> { returns, error }
  const [sectorResults, setSectorResults] = useState([]);
  const [signals, setSignals] = useState([]);
  const [prevTop3, setPrevTop3] = useState(null);   // persisted month-over-month
  const [lastRefresh, setLastRefresh] = useState(null);
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState("signals");
  const [expandedSector, setExpandedSector] = useState(null);
  const abortRef = useRef(false);

  // ── Fetch all stocks needed for scoring (top-3 per sector) ──────────────────
  const fetchAll = useCallback(async () => {
    abortRef.current = false;
    setStatus("loading");
    setErrors([]);
    setStockData({});
    setSectorResults([]);
    setSignals([]);

    const sectorMap = groupBySector(STOCK_UNIVERSE);
    // Collect unique tickers: top SCORE_NAMES per sector
    const tickersNeeded = new Set();
    Object.values(sectorMap).forEach(stocks => {
      stocks.slice(0, SCORE_NAMES).forEach(s => tickersNeeded.add(s.ticker));
    });
    const tickerList = [...tickersNeeded];
    setProgress({ done: 0, total: tickerList.length, current: "" });

    const results = {};
    const fetchErrors = [];

    // Batch with small delay to avoid rate limiting
    for (let i = 0; i < tickerList.length; i++) {
      if (abortRef.current) break;
      const ticker = tickerList[i];
      setProgress({ done: i, total: tickerList.length, current: ticker });
      try {
        const history = await fetchPriceHistory(ticker);
        const returns = computeReturns(history);
        results[ticker] = { returns, error: null };
      } catch (e) {
        results[ticker] = { returns: null, error: e.message };
        fetchErrors.push({ ticker, error: e.message });
      }
      // Small throttle
      if (i < tickerList.length - 1) await new Promise(r => setTimeout(r, 120));
    }

    setProgress({ done: tickerList.length, total: tickerList.length, current: "" });
    setStockData(results);
    setErrors(fetchErrors);

    // ── Compute sector scores ────────────────────────────────────────────────
    const sectors = [];
    Object.entries(sectorMap).forEach(([sector, stocks]) => {
      const top3 = stocks.slice(0, SCORE_NAMES);
      const top2 = stocks.slice(0, NAMES_PER_SECTOR);
      const stockScores = top3.map(s => {
        const d = results[s.ticker];
        const score = d?.returns ? weightedScore(d.returns) : null;
        return { ...s, returns: d?.returns ?? null, score, error: d?.error ?? null };
      });
      const validScores = stockScores.filter(s => s.score != null);
      const sectorScore = validScores.length > 0
        ? validScores.reduce((a, b) => a + b.score, 0) / validScores.length
        : null;
      // 3M return for tiebreaker (average of valid top-3)
      const valid3m = stockScores.filter(s => s.returns?.m3 != null);
      const sector3m = valid3m.length > 0
        ? valid3m.reduce((a, b) => a + b.returns.m3, 0) / valid3m.length
        : null;

      sectors.push({
        sector,
        sectorScore,
        sector3m,
        stockScores,
        tradeNames: top2,
        dataQuality: `${validScores.length}/${top3.length} stocks with data`,
      });
    });

    // ── Rank sectors ─────────────────────────────────────────────────────────
    sectors.sort((a, b) => {
      if (a.sectorScore == null && b.sectorScore == null) return 0;
      if (a.sectorScore == null) return 1;
      if (b.sectorScore == null) return -1;
      const diff = b.sectorScore - a.sectorScore;
      // Tiebreaker: if scores within 0.5%, use 3M
      if (Math.abs(diff) <= TIE_THRESHOLD) {
        const a3m = a.sector3m ?? -999;
        const b3m = b.sector3m ?? -999;
        return b3m - a3m;
      }
      return diff;
    });

    setSectorResults(sectors);

    // ── Generate signals ──────────────────────────────────────────────────────
    const qualifying = sectors.filter(s => s.sectorScore != null && s.sectorScore > 0);
    const top3Sectors = qualifying.slice(0, TOP_SECTORS);

    const newSignals = [];
    if (top3Sectors.length === 0) {
      newSignals.push({
        type: "CASH",
        message: "All sectors negative — go 100% cash.",
        positions: [],
      });
    } else {
      top3Sectors.forEach((s, rank) => {
        s.tradeNames.forEach(stock => {
          const prevInTop3 = prevTop3?.some(p => p.sector === s.sector);
          newSignals.push({
            type: prevInTop3 ? "HOLD" : "BUY",
            sector: s.sector,
            rank: rank + 1,
            sectorScore: s.sectorScore,
            stock,
          });
        });
      });
      // Check for sectors that were in prevTop3 but dropped out → SELL
      if (prevTop3) {
        prevTop3.forEach(prev => {
          const stillIn = top3Sectors.some(s => s.sector === prev.sector);
          if (!stillIn) {
            newSignals.push({
              type: "SELL",
              sector: prev.sector,
              message: `${prev.sector} dropped out of top 3 — sell positions.`,
            });
          }
        });
      }
    }

    setSignals(newSignals);
    // Save top3 for next month comparison
    setPrevTop3(top3Sectors.map(s => ({ sector: s.sector })));
    setLastRefresh(new Date());
    setStatus("done");
  }, [prevTop3]);

  const stopFetch = () => { abortRef.current = true; setStatus("idle"); };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const fmtPct = (v, decimals = 2) => v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
  const pctColor = (v) => v == null ? "#6b7280" : v > 0 ? "#10b981" : "#ef4444";
  const rankColor = (rank) => rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : "#b45309";
  const signalColor = (t) => ({ BUY:"#10b981", SELL:"#ef4444", HOLD:"#3b82f6", CASH:"#f59e0b" }[t] || "#6b7280");

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const qualifying = sectorResults.filter(s => s.sectorScore != null && s.sectorScore > 0);
  const top3 = qualifying.slice(0, TOP_SECTORS);
  const allNegative = sectorResults.length > 0 && qualifying.length === 0;

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", padding: "0" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderBottom: "1px solid #1e3a5f", padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === "done" ? "#10b981" : status === "loading" ? "#f59e0b" : "#475569", boxShadow: status === "done" ? "0 0 8px #10b981" : "none" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>SGX Sector Momentum</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Monthly Signal Dashboard</h1>
            {lastRefresh && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Last refresh: {lastRefresh.toLocaleString("en-SG", { timeZone: "Asia/Singapore" })} SGT</div>}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {status === "loading" && (
              <button onClick={stopFetch} style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>
                Stop
              </button>
            )}
            <button
              onClick={fetchAll}
              disabled={status === "loading"}
              style={{ padding: "10px 20px", background: status === "loading" ? "#1e3a5f" : "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", borderRadius: 8, color: "#fff", cursor: status === "loading" ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
              {status === "loading" ? `Fetching… ${pct}%` : "↻ Refresh Data"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {status === "loading" && (
          <div style={{ marginTop: 12 }}>
            <div style={{ background: "#1e293b", borderRadius: 4, height: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #2563eb, #7c3aed)", transition: "width 0.3s ease", borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{progress.current} ({progress.done}/{progress.total})</div>
          </div>
        )}
      </div>

      {/* MARKET SENTIMENT BANNER */}
      {status === "done" && allNegative && (
        <div style={{ background: "linear-gradient(135deg, #450a0a, #7f1d1d)", margin: "16px 24px 0", borderRadius: 10, padding: "14px 20px", border: "1px solid #991b1b", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: 15 }}>ALL SECTORS NEGATIVE — GO 100% CASH</div>
            <div style={{ fontSize: 12, color: "#fca5a5", opacity: 0.7, marginTop: 2 }}>No sectors qualify (score &gt; 0%). Hold cash until market sentiment improves.</div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ padding: "16px 24px 0", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["signals", "ranking", "detail", "errors"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "8px 16px", background: activeTab === tab ? "#1e3a5f" : "transparent", border: activeTab === tab ? "1px solid #2563eb" : "1px solid transparent", borderRadius: "8px 8px 0 0", color: activeTab === tab ? "#60a5fa" : "#475569", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, transition: "all 0.15s" }}>
              {tab === "signals" ? "🎯 Trade Signals" : tab === "ranking" ? "📊 Sector Ranking" : tab === "detail" ? "🔍 Stock Detail" : `⚠ Errors (${errors.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* ── SIGNALS TAB ──────────────────────────────────────────────────── */}
        {activeTab === "signals" && (
          <div>
            {status === "idle" && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>Click "Refresh Data" to run the momentum analysis</div>
                <div style={{ fontSize: 13, color: "#334155", marginTop: 8 }}>Fetches 1Y price history for {STOCK_UNIVERSE.length} SGX stocks across 16 sector groups</div>
              </div>
            )}

            {status === "done" && signals.length > 0 && (
              <div>
                <div style={{ marginBottom: 16, fontSize: 13, color: "#475569" }}>
                  Strategy: Top {TOP_SECTORS} sectors × {NAMES_PER_SECTOR} names = max {TOP_SECTORS * NAMES_PER_SECTOR} positions &nbsp;|&nbsp; Sector score uses top-3 by market cap, trades top-2 &nbsp;|&nbsp; Floor: sector score &gt; 0%
                </div>

                {/* Summary strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Qualifying Sectors", value: qualifying.length, color: qualifying.length > 0 ? "#10b981" : "#ef4444" },
                    { label: "BUY Signals", value: signals.filter(s => s.type === "BUY").length, color: "#10b981" },
                    { label: "HOLD Signals", value: signals.filter(s => s.type === "HOLD").length, color: "#3b82f6" },
                    { label: "SELL Signals", value: signals.filter(s => s.type === "SELL").length, color: "#ef4444" },
                    { label: "Sectors Negative", value: sectorResults.filter(s => s.sectorScore != null && s.sectorScore <= 0).length, color: "#94a3b8" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "12px 16px" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Signal cards */}
                {top3.map((s, idx) => (
                  <div key={s.sector} style={{ background: "#1e293b", border: `1px solid ${idx === 0 ? "#854d0e" : idx === 1 ? "#334155" : "#1e293b"}`, borderRadius: 10, marginBottom: 14, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", background: idx < 1 ? "linear-gradient(90deg, rgba(245,158,11,0.08), transparent)" : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #0f172a" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: rankColor(idx + 1), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{s.sector}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{s.dataQuality}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: pctColor(s.sectorScore) }}>{fmtPct(s.sectorScore)}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>Weighted Score &nbsp;|&nbsp; 3M: {fmtPct(s.sector3m)}</div>
                      </div>
                    </div>
                    <div style={{ padding: "12px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {s.tradeNames.map(stock => {
                        const d = stockData[stock.ticker];
                        const sig = prevTop3?.some(p => p.sector === s.sector) ? "HOLD" : "BUY";
                        return (
                          <div key={stock.code} style={{ background: "#0f172a", borderRadius: 8, padding: "12px 14px", border: `1px solid ${signalColor(sig)}22` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{stock.name}</div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>{stock.code} &nbsp;·&nbsp; SGD {stock.mktCapM >= 1000 ? (stock.mktCapM / 1000).toFixed(1) + "B" : stock.mktCapM.toFixed(0) + "M"}</div>
                              </div>
                              <span style={{ background: signalColor(sig) + "22", color: signalColor(sig), padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${signalColor(sig)}44` }}>{sig}</span>
                            </div>
                            {d?.returns && (
                              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                                {[["1W", d.returns.w1], ["1M", d.returns.m1], ["3M", d.returns.m3], ["6M", d.returns.m6]].map(([label, val]) => (
                                  <div key={label} style={{ textAlign: "center", background: "#1e293b", borderRadius: 6, padding: "4px 8px", minWidth: 44 }}>
                                    <div style={{ fontSize: 10, color: "#475569" }}>{label}</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: pctColor(val) }}>{fmtPct(val, 1)}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {d?.error && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 8 }}>⚠ {d.error}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* SELL signals */}
                {signals.filter(s => s.type === "SELL").map((s, i) => (
                  <div key={i} style={{ background: "#1e293b", border: "1px solid #7f1d1d", borderRadius: 10, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ background: "#ef444422", color: "#ef4444", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>SELL</span>
                    <div style={{ fontSize: 14, color: "#fca5a5" }}>{s.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECTOR RANKING TAB ──────────────────────────────────────────── */}
        {activeTab === "ranking" && (
          <div>
            {sectorResults.length === 0 && <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>Run refresh to see sector rankings.</div>}
            {sectorResults.length > 0 && (
              <div>
                <div style={{ marginBottom: 12, fontSize: 13, color: "#475569" }}>
                  Ranked by weighted score (1W×10% + 1M×35% + 3M×35% + 6M×15%). Tiebreaker within 0.5%: 3M return.
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        {["Rank","Sector","Score","1W","1M","3M","6M","Qualifies","Data"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sectorResults.map((s, i) => {
                        const inTop3 = i < TOP_SECTORS && s.sectorScore != null && s.sectorScore > 0;
                        const avgReturns = (field) => {
                          const vals = s.stockScores.filter(x => x.returns?.[field] != null).map(x => x.returns[field]);
                          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
                        };
                        return (
                          <tr key={s.sector}
                            onClick={() => { setExpandedSector(expandedSector === s.sector ? null : s.sector); setActiveTab("ranking"); }}
                            style={{ borderBottom: "1px solid #1e293b", background: inTop3 ? "rgba(37,99,235,0.07)" : "transparent", cursor: "pointer", transition: "background 0.15s" }}>
                            <td style={{ padding: "10px 12px", color: inTop3 ? rankColor(i + 1) : "#475569", fontWeight: 700 }}>#{i + 1}</td>
                            <td style={{ padding: "10px 12px", color: "#e2e8f0", fontWeight: inTop3 ? 600 : 400 }}>
                              {inTop3 && <span style={{ marginRight: 6, fontSize: 10 }}>✦</span>}{s.sector}
                            </td>
                            <td style={{ padding: "10px 12px", color: pctColor(s.sectorScore), fontWeight: 700 }}>{fmtPct(s.sectorScore)}</td>
                            <td style={{ padding: "10px 12px", color: pctColor(avgReturns("w1")) }}>{fmtPct(avgReturns("w1"), 1)}</td>
                            <td style={{ padding: "10px 12px", color: pctColor(avgReturns("m1")) }}>{fmtPct(avgReturns("m1"), 1)}</td>
                            <td style={{ padding: "10px 12px", color: pctColor(avgReturns("m3")), fontWeight: 600 }}>{fmtPct(avgReturns("m3"), 1)}</td>
                            <td style={{ padding: "10px 12px", color: pctColor(avgReturns("m6")) }}>{fmtPct(avgReturns("m6"), 1)}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ color: s.sectorScore != null && s.sectorScore > 0 ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: 12 }}>
                                {s.sectorScore == null ? "No data" : s.sectorScore > 0 ? "✓ Yes" : "✗ No"}
                              </span>
                            </td>
                            <td style={{ padding: "10px 12px", color: "#475569", fontSize: 11 }}>{s.dataQuality}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STOCK DETAIL TAB ─────────────────────────────────────────────── */}
        {activeTab === "detail" && (
          <div>
            {sectorResults.length === 0 && <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>Run refresh to see stock detail.</div>}
            {sectorResults.map(sector => (
              <div key={sector.sector} style={{ marginBottom: 16 }}>
                <div
                  onClick={() => setExpandedSector(expandedSector === sector.sector ? null : sector.sector)}
                  style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #334155" }}>
                  <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{sector.sector}</div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ color: pctColor(sector.sectorScore), fontWeight: 700 }}>{fmtPct(sector.sectorScore)}</span>
                    <span style={{ color: "#475569", fontSize: 12 }}>{expandedSector === sector.sector ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expandedSector === sector.sector && (
                  <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1e293b" }}>
                          {["Role","Stock","Code","Mkt Cap","Score","1W","1M","3M","6M"].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 10, letterSpacing: "0.05em" }}>{h.toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sector.stockScores.map((s, i) => (
                          <tr key={s.code} style={{ borderBottom: "1px solid #1e293b", background: i < NAMES_PER_SECTOR ? "rgba(37,99,235,0.04)" : "transparent" }}>
                            <td style={{ padding: "8px 12px" }}>
                              <span style={{ fontSize: 10, color: i < NAMES_PER_SECTOR ? "#10b981" : "#64748b", fontWeight: 600 }}>
                                {i < NAMES_PER_SECTOR ? "SCORE+TRADE" : "SCORE ONLY"}
                              </span>
                            </td>
                            <td style={{ padding: "8px 12px", color: "#e2e8f0", fontWeight: 500 }}>{s.name}</td>
                            <td style={{ padding: "8px 12px", color: "#64748b" }}>{s.code}</td>
                            <td style={{ padding: "8px 12px", color: "#94a3b8" }}>SGD {s.mktCapM >= 1000 ? (s.mktCapM / 1000).toFixed(1) + "B" : s.mktCapM.toFixed(0) + "M"}</td>
                            <td style={{ padding: "8px 12px", color: pctColor(s.score), fontWeight: 700 }}>{fmtPct(s.score)}</td>
                            <td style={{ padding: "8px 12px", color: pctColor(s.returns?.w1) }}>{fmtPct(s.returns?.w1, 1)}</td>
                            <td style={{ padding: "8px 12px", color: pctColor(s.returns?.m1) }}>{fmtPct(s.returns?.m1, 1)}</td>
                            <td style={{ padding: "8px 12px", color: pctColor(s.returns?.m3), fontWeight: 600 }}>{fmtPct(s.returns?.m3, 1)}</td>
                            <td style={{ padding: "8px 12px", color: pctColor(s.returns?.m6) }}>{fmtPct(s.returns?.m6, 1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ERRORS TAB ──────────────────────────────────────────────────── */}
        {activeTab === "errors" && (
          <div>
            {errors.length === 0 && status === "done" && <div style={{ color: "#10b981", textAlign: "center", padding: 40, fontSize: 14 }}>✓ No errors — all data fetched successfully.</div>}
            {errors.length === 0 && status !== "done" && <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>Run refresh to see error log.</div>}
            {errors.length > 0 && (
              <div>
                <div style={{ marginBottom: 12, color: "#f59e0b", fontSize: 13 }}>⚠ {errors.length} tickers failed to fetch. These stocks are excluded from sector scoring.</div>
                <div style={{ background: "#1e293b", borderRadius: 8, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        {["Ticker","Error"].map(h => (
                          <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {errors.map(({ ticker, error }) => (
                        <tr key={ticker} style={{ borderBottom: "1px solid #0f172a" }}>
                          <td style={{ padding: "8px 14px", color: "#f87171", fontFamily: "monospace" }}>{ticker}</td>
                          <td style={{ padding: "8px 14px", color: "#94a3b8" }}>{error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STRATEGY LEGEND */}
        <div style={{ marginTop: 32, borderTop: "1px solid #1e293b", paddingTop: 16, display: "flex", flexWrap: "wrap", gap: 20, fontSize: 11, color: "#334155" }}>
          <div><span style={{ color: "#475569", fontWeight: 600 }}>Score formula:</span> 1W×10% + 1M×35% + 3M×35% + 6M×15%</div>
          <div><span style={{ color: "#475569", fontWeight: 600 }}>Tiebreaker:</span> 3M return when gap ≤0.5%</div>
          <div><span style={{ color: "#475569", fontWeight: 600 }}>Universe:</span> {STOCK_UNIVERSE.length} stocks, SGD ≥100M, 16 sectors</div>
          <div><span style={{ color: "#475569", fontWeight: 600 }}>Positions:</span> Top {TOP_SECTORS} sectors × {NAMES_PER_SECTOR} names = max {TOP_SECTORS * NAMES_PER_SECTOR}</div>
          <div><span style={{ color: "#475569", fontWeight: 600 }}>Floor:</span> Sector score &gt;0% to qualify</div>
          <div><span style={{ color: "#475569", fontWeight: 600 }}>Cash:</span> All sectors ≤0%</div>
        </div>
      </div>
    </div>
  );
}
