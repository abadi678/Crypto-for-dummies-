import { useState, useEffect, useCallback } from "react";

const C = {
  bg:"#08090D", surface:"#0F1017", border:"#1C1D26",
  gold:"#F5C842", goldBg:"rgba(245,200,66,0.08)", goldBorder:"rgba(245,200,66,0.2)",
  orange:"#FF6B1A", orangeBg:"rgba(255,107,26,0.1)", orangeBorder:"rgba(255,107,26,0.25)",
  red:"#E8354A", redBg:"rgba(232,53,74,0.1)", redBorder:"rgba(232,53,74,0.25)",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)", greenBorder:"rgba(34,197,94,0.25)",
  text:"#ECEEF5", muted:"#4A4D60", subtle:"#252736",
};

const COIN_LIST = [
  { cgId:"bitcoin",     symbol:"BTC",  chain:"BTC",  riskScore:9, riskFlags:[] },
  { cgId:"ethereum",    symbol:"ETH",  chain:"ETH",  riskScore:8, riskFlags:[] },
  { cgId:"solana",      symbol:"SOL",  chain:"SOL",  riskScore:7, riskFlags:[] },
  { cgId:"binancecoin", symbol:"BNB",  chain:"BNB",  riskScore:7, riskFlags:[] },
  { cgId:"ripple",      symbol:"XRP",  chain:"XRP",  riskScore:7, riskFlags:[] },
  { cgId:"cardano",     symbol:"ADA",  chain:"ADA",  riskScore:7, riskFlags:[] },
  { cgId:"avalanche-2", symbol:"AVAX", chain:"AVAX", riskScore:7, riskFlags:[] },
  { cgId:"chainlink",   symbol:"LINK", chain:"ETH",  riskScore:7, riskFlags:[] },
  { cgId:"polkadot",    symbol:"DOT",  chain:"DOT",  riskScore:6, riskFlags:[] },
  { cgId:"pepe",        symbol:"PEPE", chain:"ETH",  riskScore:3, riskFlags:["Meme coin","Sudden volume spikes","High holder concentration"] },
  { cgId:"dogecoin",    symbol:"DOGE", chain:"DOGE", riskScore:4, riskFlags:["Meme coin — sentiment driven"] },
  { cgId:"shiba-inu",   symbol:"SHIB", chain:"ETH",  riskScore:3, riskFlags:["Meme coin — high risk","Low holder diversity"] },
];

const MOCK = [
  { cgId:"bitcoin",     name:"Bitcoin",   price:65420,      change:2.4,   ath:73750,      atl:67.81,          mcap:1280000000000, volume:42100000000,  sparkline:[60000,61000,63000,62000,64000,65000,65420] },
  { cgId:"ethereum",    name:"Ethereum",  price:3480,       change:1.8,   ath:4878,       atl:0.43,           mcap:418000000000,  volume:18300000000,  sparkline:[3200,3300,3400,3350,3420,3460,3480] },
  { cgId:"solana",      name:"Solana",    price:172,        change:-0.9,  ath:260,        atl:0.5,            mcap:79000000000,   volume:4200000000,   sparkline:[180,178,175,172,170,171,172] },
  { cgId:"binancecoin", name:"BNB",       price:608,        change:0.5,   ath:686,        atl:0.1,            mcap:88000000000,   volume:1900000000,   sparkline:[595,600,605,603,607,608,608] },
  { cgId:"ripple",      name:"XRP",       price:0.52,       change:-1.1,  ath:3.84,       atl:0.002802,       mcap:28000000000,   volume:1200000000,   sparkline:[0.54,0.53,0.52,0.51,0.52,0.52,0.52] },
  { cgId:"cardano",     name:"Cardano",   price:0.44,       change:0.3,   ath:3.09,       atl:0.01735,        mcap:15000000000,   volume:400000000,    sparkline:[0.42,0.43,0.44,0.43,0.44,0.44,0.44] },
  { cgId:"avalanche-2", name:"Avalanche", price:38.4,       change:-1.2,  ath:146.2,      atl:2.8,            mcap:16000000000,   volume:890000000,    sparkline:[40,39,38,37,38,38,38.4] },
  { cgId:"chainlink",   name:"Chainlink", price:14.82,      change:0.6,   ath:52.7,       atl:0.15,           mcap:8900000000,    volume:612000000,    sparkline:[14,14.2,14.5,14.6,14.7,14.8,14.82] },
  { cgId:"polkadot",    name:"Polkadot",  price:7.1,        change:-0.4,  ath:54.98,      atl:2.7,            mcap:9200000000,    volume:310000000,    sparkline:[7.3,7.2,7.1,7.0,7.1,7.1,7.1] },
  { cgId:"pepe",        name:"Pepe",      price:0.0000142,  change:18.4,  ath:0.0000173,  atl:0.0000000062,   mcap:5900000000,    volume:892000000,    sparkline:[0.000009,0.00001,0.000011,0.000012,0.000013,0.000014,0.0000142] },
  { cgId:"dogecoin",    name:"Dogecoin",  price:0.162,      change:1.2,   ath:0.7376,     atl:0.0000869,      mcap:23000000000,   volume:1100000000,   sparkline:[0.155,0.157,0.159,0.16,0.161,0.162,0.162] },
  { cgId:"shiba-inu",   name:"Shiba Inu", price:0.0000248,  change:3.1,   ath:0.00008845, atl:0.000000000056, mcap:14600000000,   volume:620000000,    sparkline:[0.000022,0.000023,0.000024,0.000024,0.000024,0.000025,0.0000248] },
];

const formatPrice = (p) => {
  if (!p && p !== 0) return "—";
  if (p < 0.0001) return `$${p.toExponential(4)}`;
  if (p < 1) return `$${p.toFixed(6)}`;
  return `$${p.toLocaleString(undefined,{maximumFractionDigits:2})}`;
};

const getRisk = (score) => {
  if (score >= 7) return { label:"TRUSTED", color:C.green,  bg:C.greenBg,  border:C.greenBorder,  dot:C.green  };
  if (score >= 4) return { label:"CAUTION",  color:C.orange, bg:C.orangeBg, border:C.orangeBorder, dot:C.orange };
  return             { label:"AVOID",    color:C.red,    bg:C.redBg,    border:C.redBorder,    dot:C.red    };
};

const calcRSI = (prices) => {
  if (!prices || prices.length < 14) return null;
  const changes = prices.slice(-14).map((p,i,arr) => i===0 ? 0 : p-arr[i-1]);
  const gains  = changes.filter(c=>c>0);
  const losses = changes.filter(c=>c<0).map(Math.abs);
  const avgGain = gains.reduce((a,b)=>a+b,0)/14;
  const avgLoss = losses.reduce((a,b)=>a+b,0)/14;
  if (avgLoss===0) return 100;
  return Math.round(100-(100/(1+(avgGain/avgLoss))));
};

const getSignalScore = (coin) => {
  let score = 0;
  const { rsi, riskScore, price, ath, volume, mcap, sparkline } = coin;
  if (rsi !== null && rsi < 40) score++;
  if (riskScore >= 6) score++;
  if (ath && price && ((price-ath)/ath)*100 < -40) score++;
  if (sparkline && sparkline.length >= 2 && sparkline[sparkline.length-1] > sparkline[0]) score++;
  if (volume && mcap && (volume/mcap) > 0.02) score++;
  return score;
};

const getVerdict = (score) => {
  if (score >= 4) return { label:"BUY NOW", emoji:"🔥", color:C.green,  bg:C.greenBg,  border:C.greenBorder };
  if (score === 3) return { label:"WATCH",  emoji:"👀", color:C.orange, bg:C.orangeBg, border:C.orangeBorder };
  return                  { label:"WAIT",   emoji:"⏳", color:C.muted,  bg:C.subtle,   border:C.border };
};

const buildCoin = (d, meta) => {
  const sparkline = d.sparkline_in_7d?.price || d.sparkline || [];
  const rsi = calcRSI(sparkline);
  const coin = {
    id: d.id || d.cgId,
    cgId: d.id || d.cgId,
    name: d.name,
    symbol: meta?.symbol || (d.symbol||"").toUpperCase(),
    price: d.current_price ?? d.price,
    change: d.price_change_percentage_24h ?? d.change,
    ath: d.ath, atl: d.atl,
    mcap: d.market_cap ?? d.mcap,
    volume: d.total_volume ?? d.volume ?? 0,
    image: d.image || null,
    chain: meta?.chain || "—",
    riskScore: meta?.riskScore || 5,
    riskFlags: meta?.riskFlags || [],
    sparkline, rsi,
  };
  coin.signalScore = getSignalScore(coin);
  coin.verdict = getVerdict(coin.signalScore);
  coin.buySignal = coin.signalScore >= 4;
  return coin;
};

const getPortfolioAdvice = (coin, buyPrice) => {
  const pnlPct = ((coin.price - buyPrice) / buyPrice) * 100;
  if (coin.riskScore < 4)                return { action:"SELL NOW",    emoji:"🚨", color:C.red,    bg:C.redBg,    reason:"Scam signals active — exit now" };
  if (pnlPct > 50 && coin.rsi > 65)     return { action:"TAKE PROFIT", emoji:"💰", color:C.orange, bg:C.orangeBg, reason:`Up ${pnlPct.toFixed(0)}% — lock in gains` };
  if (pnlPct > 20 && coin.riskScore>=7) return { action:"HOLD TIGHT",  emoji:"💎", color:C.gold,   bg:C.goldBg,   reason:`Up ${pnlPct.toFixed(0)}% and still strong` };
  if (pnlPct < -20 && coin.buySignal)   return { action:"BUY MORE",    emoji:"📈", color:C.green,  bg:C.greenBg,  reason:`Down ${Math.abs(pnlPct).toFixed(0)}% but solid — average down` };
  if (pnlPct < -30 && coin.riskScore<6) return { action:"SELL NOW",    emoji:"⛔", color:C.red,    bg:C.redBg,    reason:`Down ${Math.abs(pnlPct).toFixed(0)}% on weak coin — cut losses` };
  if (coin.buySignal)                    return { action:"HOLD",         emoji:"🤝", color:C.green,  bg:C.greenBg,  reason:"Looking good — stay patient" };
  return                                        { action:"WATCH",         emoji:"⏳", color:C.gold,   bg:C.goldBg,   reason:"No strong signal yet — monitor it" };
};

export default function App() {
  const [coins, setCoins]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [liveData, setLiveData]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tab, setTab]             = useState("market");
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("ALL");
  const [search, setSearch]       = useState("");
  const [portfolio, setPortfolio] = useState([
    { id:1, cgId:"bitcoin",  buyPrice:58000, amount:0.05 },
    { id:2, cgId:"ethereum", buyPrice:2800,  amount:1.2  },
    { id:3, cgId:"solana",   buyPrice:210,   amount:8    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [addForm, setAddForm]     = useState({ cgId:"", buyPrice:"", amount:"" });

  const loadMock = useCallback(() => {
    setCoins(MOCK.map(d => buildCoin(d, COIN_LIST.find(c=>c.cgId===d.cgId))));
    setLoading(false); setLiveData(false);
  }, []);

  const fetchCoins = useCallback(async () => {
    try {
      const ids = COIN_LIST.map(c=>c.cgId).join(",");
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`;
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error();
      const merged = data.map(d => buildCoin(d, COIN_LIST.find(c=>c.cgId===d.id)));
      merged.sort((a,b)=>(b.mcap||0)-(a.mcap||0));
      setCoins(merged); setLiveData(true); setLastUpdated(new Date());
    } catch { loadMock(); }
    finally { setLoading(false); }
  }, [loadMock]);

  useEffect(() => {
    fetchCoins();
    const t = setInterval(fetchCoins, 60000);
    return () => clearInterval(t);
  }, [fetchCoins]);

  const coin = selected ? coins.find(c=>c.id===selected) : null;
  const filtered = coins.filter(c => {
    const m = c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase());
    if (filter==="TRUSTED") return m && c.riskScore>=7;
    if (filter==="CAUTION") return m && c.riskScore>=4 && c.riskScore<7;
    if (filter==="AVOID")   return m && c.riskScore<4;
    return m;
  });

  const totalValue  = portfolio.reduce((s,p)=>{ const c=coins.find(x=>x.cgId===p.cgId); return s+(c?c.price*p.amount:0); },0);
  const totalCost   = portfolio.reduce((s,p)=>s+p.buyPrice*p.amount,0);
  const totalPnl    = totalValue-totalCost;
  const totalPnlPct = totalCost>0?(totalPnl/totalCost)*100:0;
  const isFav = (cgId) => portfolio.some(p=>p.cgId===cgId);

  const addToPortfolio = () => {
    if (!addForm.cgId||!addForm.buyPrice||!addForm.amount) return;
    setPortfolio([...portfolio,{id:Date.now(),cgId:addForm.cgId,buyPrice:parseFloat(addForm.buyPrice),amount:parseFloat(addForm.amount)}]);
    setAddForm({cgId:"",buyPrice:"",amount:""}); setShowModal(false);
  };

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg};}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        .row:hover{background:rgba(245,200,66,0.03)!important;cursor:pointer;}
        .btn:hover{opacity:0.85;cursor:pointer;}
        .tab:hover{color:${C.text}!important;}
        .remove:hover{color:${C.red}!important;border-color:${C.red}!important;}
        .pulse{animation:pulse 2.5s infinite ease-in-out;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .shimmer{background:linear-gradient(90deg,${C.surface} 25%,${C.subtle} 50%,${C.surface} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:200;display:flex;align-items:center;justify-content:center;}
        input::placeholder{color:${C.muted};} select option{background:${C.surface};}
        input,select{font-family:'Inter',sans-serif;}
      `}</style>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.surface}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:8,background:`linear-gradient(135deg,${C.gold},${C.orange})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💎</div>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Crypto for Dummies</div>
            <div style={{fontSize:10,color:C.muted}}>No experience needed — we tell you exactly what to do</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:liveData?C.green:C.gold}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:liveData?C.green:C.gold}} className="pulse"/>
            {liveData?`Live · ${lastUpdated?.toLocaleTimeString()}`:"Demo data"}
          </div>
          <button className="btn" onClick={fetchCoins} style={{background:C.subtle,border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,padding:"5px 12px",fontSize:11}}>↻ Refresh</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"0 28px",display:"flex",background:C.surface}}>
        {[["market","📊 Market"],["portfolio","💼 My Portfolio"]].map(([k,l])=>(
          <button key={k} className="tab" onClick={()=>setTab(k)}
            style={{padding:"13px 18px",background:"none",border:"none",fontSize:13,fontWeight:600,color:tab===k?C.text:C.muted,borderBottom:tab===k?`2px solid ${C.gold}`:"2px solid transparent",transition:"color 0.15s",marginBottom:-1,cursor:"pointer"}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"24px 20px"}}>

        {/* MARKET TAB */}
        {tab==="market"&&(<>
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <input placeholder="🔍  Search coin..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{flex:1,minWidth:160,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,outline:"none"}}/>
            {["ALL","TRUSTED","CAUTION","AVOID"].map(f=>{
              const col=f==="TRUSTED"?C.green:f==="CAUTION"?C.orange:f==="AVOID"?C.red:C.text;
              return <button key={f} className="btn" onClick={()=>setFilter(f)}
                style={{padding:"10px 16px",borderRadius:8,border:`1px solid ${filter===f?col:C.border}`,fontSize:12,fontWeight:600,background:filter===f?`${col}18`:C.surface,color:filter===f?col:C.muted}}>
                {f}
              </button>;
            })}
          </div>

          <div style={{display:"flex",gap:18,marginBottom:14,fontSize:11,color:C.muted}}>
            {[[C.green,"Trusted"],[C.orange,"Caution"],[C.red,"Avoid"]].map(([col,label])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:col}}/>{label}
              </div>
            ))}
          </div>

          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
            {loading ? Array(8).fill(0).map((_,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:`1px solid #0D0E16`}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div className="shimmer" style={{width:10,height:10,borderRadius:"50%"}}/>
                  <div className="shimmer" style={{width:40,height:40,borderRadius:"50%"}}/>
                  <div><div className="shimmer" style={{width:100,height:13,marginBottom:6,borderRadius:4}}/><div className="shimmer" style={{width:50,height:10,borderRadius:4}}/></div>
                </div>
                <div className="shimmer" style={{width:100,height:34,borderRadius:24}}/>
              </div>
            )) : filtered.map((c,i)=>{
              const risk=getRisk(c.riskScore);
              return (
                <div key={c.id} className="row" onClick={()=>setSelected(c.id)}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderBottom:i<filtered.length-1?`1px solid #0D0E16`:"none",transition:"background 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:risk.dot,flexShrink:0,boxShadow:`0 0 6px ${risk.dot}99`}}/>
                    {c.image
                      ?<img src={c.image} alt={c.symbol} style={{width:40,height:40,borderRadius:"50%"}}/>
                      :<div style={{width:40,height:40,borderRadius:"50%",background:`${risk.dot}22`,border:`1px solid ${risk.dot}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:risk.dot}}>{c.symbol.slice(0,2)}</div>
                    }
                    <div>
                      <div style={{fontSize:15,fontWeight:600}}>
                        {c.name}
                        {isFav(c.cgId)&&<span style={{fontSize:9,color:C.gold,background:C.goldBg,padding:"1px 7px",borderRadius:8,border:`1px solid ${C.goldBorder}`,marginLeft:8}}>WATCHING</span>}
                      </div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.symbol}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{c.signalScore}/5 signals</div>
                    <span style={{background:c.verdict.bg,color:c.verdict.color,border:`1px solid ${c.verdict.border}`,fontSize:13,fontWeight:700,padding:"7px 18px",borderRadius:24}}>
                      {c.verdict.emoji} {c.verdict.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {/* PORTFOLIO TAB */}
        {tab==="portfolio"&&(<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
            {[
              {label:"Total Value",   val:loading?"—":`$${totalValue.toLocaleString(undefined,{maximumFractionDigits:2})}`, col:C.text},
              {label:"Invested",      val:`$${totalCost.toLocaleString(undefined,{maximumFractionDigits:2})}`,              col:C.muted},
              {label:"Profit / Loss", val:loading?"—":`${totalPnl>=0?"+":""}$${Math.abs(totalPnl).toLocaleString(undefined,{maximumFractionDigits:2})} (${totalPnlPct.toFixed(1)}%)`, col:totalPnl>=0?C.green:C.red},
            ].map(s=>(
              <div key={s.label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px"}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>{s.label.toUpperCase()}</div>
                <div style={{fontSize:17,fontWeight:700,color:s.col}}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,color:C.muted}}>{portfolio.length} coin{portfolio.length!==1?"s":""} tracked</div>
            <button className="btn" onClick={()=>setShowModal(true)}
              style={{background:`linear-gradient(135deg,${C.gold},${C.orange})`,color:"#000",border:"none",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:700}}>
              + Add Coin
            </button>
          </div>

          {portfolio.length===0?(
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>💼</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>No coins yet</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Add a coin you bought — we'll tell you when to sell</div>
              <button className="btn" onClick={()=>setShowModal(true)}
                style={{background:`linear-gradient(135deg,${C.gold},${C.orange})`,color:"#000",border:"none",borderRadius:8,padding:"12px 28px",fontSize:13,fontWeight:700}}>
                + Add your first coin
              </button>
            </div>
          ):portfolio.map(p=>{
            const c=coins.find(x=>x.cgId===p.cgId);
            if(!c) return null;
            const risk=getRisk(c.riskScore);
            const val=c.price*p.amount, cost=p.buyPrice*p.amount;
            const pnl=val-cost, pnlPct=(pnl/cost)*100;
            const advice=getPortfolioAdvice(c,p.buyPrice);
            return (
              <div key={p.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
                <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:risk.dot,boxShadow:`0 0 5px ${risk.dot}99`}}/>
                    {c.image?<img src={c.image} alt={c.symbol} style={{width:40,height:40,borderRadius:"50%"}}/>
                      :<div style={{width:40,height:40,borderRadius:"50%",background:`${risk.dot}22`,border:`1px solid ${risk.dot}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:risk.dot}}>{c.symbol.slice(0,2)}</div>
                    }
                    <div>
                      <div style={{fontSize:15,fontWeight:700}}>{c.name} <span style={{fontSize:11,color:C.muted}}>({p.amount} {c.symbol})</span></div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2}}>Bought @ {formatPrice(p.buyPrice)} · Now {formatPrice(c.price)}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:16,fontWeight:700}}>${val.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                    <div style={{fontSize:12,fontWeight:600,color:pnl>=0?C.green:C.red,marginTop:2}}>{pnl>=0?"▲":"▼"} {Math.abs(pnlPct).toFixed(1)}%</div>
                  </div>
                </div>
                <div style={{background:advice.bg,borderTop:`1px solid ${C.border}`,padding:"11px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{advice.emoji}</span>
                    <span style={{fontSize:13,fontWeight:700,color:advice.color}}>{advice.action}</span>
                    <span style={{fontSize:12,color:C.muted}}>— {advice.reason}</span>
                  </div>
                  <button className="remove btn" onClick={()=>setPortfolio(portfolio.filter(x=>x.id!==p.id))}
                    style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,padding:"4px 12px",fontSize:11,transition:"all 0.15s"}}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </>)}
      </div>

      {/* DETAIL PANEL */}
      {coin&&(()=>{
        const risk=getRisk(coin.riskScore);
        const pctATH=coin.ath?(((coin.price-coin.ath)/coin.ath)*100).toFixed(1):null;
        const pctATL=coin.atl?(((coin.price-coin.atl)/coin.atl)*100).toFixed(0):null;
        const up=(coin.change||0)>=0;
        const rsiColor=coin.rsi<35?C.green:coin.rsi>70?C.red:C.orange;
        return (
          <div style={{position:"fixed",top:0,right:0,height:"100vh",width:380,background:C.surface,borderLeft:`1px solid ${C.border}`,padding:24,overflowY:"auto",zIndex:100,boxShadow:"-8px 0 40px rgba(0,0,0,0.6)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {coin.image&&<img src={coin.image} alt={coin.symbol} style={{width:42,height:42,borderRadius:"50%"}}/>}
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700}}>{coin.name}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{coin.symbol} · {coin.chain}</div>
                </div>
              </div>
              <button className="btn" onClick={()=>setSelected(null)}
                style={{background:C.subtle,border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,width:32,height:32,fontSize:16}}>×</button>
            </div>

            {/* Verdict */}
            <div style={{background:coin.verdict.bg,border:`1px solid ${coin.verdict.border}`,borderRadius:12,padding:"20px",marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:8}}>{coin.verdict.emoji}</div>
              <div style={{fontSize:20,fontWeight:700,color:coin.verdict.color,marginBottom:4}}>{coin.verdict.label}</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:14}}>{coin.signalScore} out of 5 signals agree</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {[1,2,3,4,5].map(i=>(
                  <div key={i} style={{flex:1,height:6,borderRadius:3,background:i<=coin.signalScore?coin.verdict.color:C.subtle}}/>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px",marginBottom:12}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>CURRENT PRICE</div>
              <div style={{fontSize:28,fontWeight:700}}>{formatPrice(coin.price)}</div>
              <div style={{fontSize:13,color:up?C.green:C.red,marginTop:4,fontWeight:600}}>{up?"▲":"▼"} {Math.abs(coin.change||0).toFixed(2)}% today</div>
            </div>

            {/* Chart */}
            {coin.sparkline?.length>2&&(()=>{
              const prices=coin.sparkline,min=Math.min(...prices),max=Math.max(...prices),range=max-min||1;
              const w=320,h=60;
              const pts=prices.map((p,i)=>`${(i/(prices.length-1))*w},${h-((p-min)/range)*h}`).join(" ");
              return (
                <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:12}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:10}}>7-DAY CHART</div>
                  <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
                    <polyline points={pts} fill="none" stroke={up?C.green:C.red} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                  </svg>
                </div>
              );
            })()}

            {/* ATH / ATL */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[
                {label:"ALL TIME HIGH",val:formatPrice(coin.ath),color:C.green,sub:pctATH?`${pctATH}% away`:""},
                {label:"ALL TIME LOW", val:formatPrice(coin.atl),color:C.red,  sub:pctATL?`+${Number(pctATL).toLocaleString()}% up`:""},
              ].map(s=>(
                <div key={s.label} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px"}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>{s.label}</div>
                  <div style={{fontSize:14,fontWeight:700,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:3}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* RSI */}
            {coin.rsi!==null&&(
              <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:10}}>RSI (14-DAY)</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:24,fontWeight:700,color:rsiColor}}>{coin.rsi}</span>
                  <span style={{fontSize:11,color:C.muted}}>{coin.rsi<35?"Oversold — good entry":coin.rsi>70?"Overbought — be careful":"Neutral"}</span>
                </div>
                <div style={{height:5,background:C.subtle,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${coin.rsi}%`,background:`linear-gradient(90deg,${C.green},${C.orange},${C.red})`,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
                  <span>Buy zone</span><span>Sell zone</span>
                </div>
              </div>
            )}

            {/* Add to portfolio */}
            {!isFav(coin.cgId)&&(
              <button className="btn" onClick={()=>{ setShowModal(true); setAddForm(f=>({...f,cgId:coin.cgId})); setSelected(null); setTab("portfolio"); }}
                style={{width:"100%",background:`linear-gradient(135deg,${C.gold},${C.orange})`,border:"none",borderRadius:10,color:"#000",padding:"13px",fontSize:13,fontWeight:700,marginBottom:14}}>
                + Add to My Portfolio
              </button>
            )}

            {/* Risk flags */}
            {coin.riskFlags.length>0&&(
              <div style={{background:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:10}}>⚠ SCAM SIGNALS DETECTED</div>
                {coin.riskFlags.map((f,i)=>(
                  <div key={i} style={{fontSize:12,color:"#C0404A",marginBottom:6,display:"flex",gap:8}}><span>•</span><span>{f}</span></div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ADD COIN MODAL */}
      {showModal&&(
        <div className="overlay" onClick={()=>setShowModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:28,width:360,maxWidth:"90vw"}}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Add a coin</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:24}}>Tell us what you bought — we'll track it</div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>WHICH COIN?</div>
              <select value={addForm.cgId} onChange={e=>setAddForm(f=>({...f,cgId:e.target.value}))}
                style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:addForm.cgId?C.text:C.muted,fontSize:13,outline:"none"}}>
                <option value="">Select a coin...</option>
                {COIN_LIST.map(c=><option key={c.cgId} value={c.cgId}>{c.symbol} — {c.cgId}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>WHAT DID YOU PAY PER COIN? ($)</div>
              <input type="number" placeholder="e.g. 58000" value={addForm.buyPrice} onChange={e=>setAddForm(f=>({...f,buyPrice:e.target.value}))}
                style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,outline:"none"}}/>
            </div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>HOW MANY DID YOU BUY?</div>
              <input type="number" placeholder="e.g. 0.5" value={addForm.amount} onChange={e=>setAddForm(f=>({...f,amount:e.target.value}))}
                style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,outline:"none"}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn" onClick={()=>setShowModal(false)}
                style={{flex:1,background:C.subtle,border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"12px",fontSize:13,fontWeight:600}}>
                Cancel
              </button>
              <button className="btn" onClick={addToPortfolio}
                style={{flex:2,background:`linear-gradient(135deg,${C.gold},${C.orange})`,border:"none",borderRadius:8,color:"#000",padding:"12px",fontSize:13,fontWeight:700}}>
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
