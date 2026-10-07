"use client";
import {useEffect,useState} from "react";

const nav=[["Home","⌂"],["Mining","⛏"],["Tasks","✦"],["Referrals","↗"],["Wallet","◈"]];

export default function Home(){
 const [tab,setTab]=useState("Home");
 const [balance,setBalance]=useState(0);
 const [mining,setMining]=useState(false);
 const [seconds,setSeconds]=useState(0);
 const [notice,setNotice]=useState("");
 const [user,setUser]=useState(null);

 useEffect(()=>{
   const tg=window.Telegram?.WebApp;
   if(tg){tg.ready();tg.expand();setUser(tg.initDataUnsafe?.user||null)}
 },[]);

 useEffect(()=>{
   if(!mining||seconds<=0)return;
   const timer=setInterval(()=>setSeconds(s=>s-1),1000);
   return()=>clearInterval(timer);
 },[mining,seconds]);

 useEffect(()=>{if(mining&&seconds===0)setMining(false)},[mining,seconds]);

 const mine=()=>{
   if(mining||seconds>0)return;
   setBalance(v=>+(v+0.005).toFixed(3));
   setMining(true);setSeconds(43200);
   setNotice("+0.005 FTL added");
   setTimeout(()=>setNotice(""),2500);
 };

 const time=s=>[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(v=>String(v).padStart(2,"0")).join(":");

 return <main className="app">
   <header className="topbar">
    <div className="brand"><div className="coin">F</div><div><b>FTL <span>COINS</span></b><small>Earn • Build • Grow</small></div></div>
    <button className="bell">⌁</button>
   </header>

   {tab==="Home" && <>
    <section className="hero">
      <div className="hero-light"/>
      <div className="hero-row"><div><label>FTL MINI APP</label><h1>Mine FTL.<br/><em>Build your balance.</em></h1></div><strong className="live">● LIVE</strong></div>
      <p>Free mining with a simple 12-hour cycle. Build your FTL balance and unlock more earning opportunities.</p>
      <small className="label">AVAILABLE BALANCE</small>
      <div className="balance">{balance.toFixed(3)} <i>FTL</i></div>
      <div className="value">≈ ${(balance*0.10).toFixed(2)} USD <span>• 1 FTL = $0.10</span></div>
      <div className="actions"><button className="mineBtn" onClick={mine} disabled={mining||seconds>0}>⛏ {mining?"MINING ACTIVE":seconds>0?"MINING LOCKED":"MINE FTL"}</button><button className="inviteBtn" onClick={()=>setTab("Referrals")}>↗ INVITE</button></div>
    </section>

    <section className="cycle">
      <div className="cycleIcon">⛏</div><div className="cycleInfo">
       <div className="cycleTitle">FTL Mining Cycle <span className={mining?"green":""}>{mining?"ACTIVE":"READY"}</span></div>
       <b>+0.005 FTL <small>/ 12-hour cycle</small></b>
       <div className="bar"><i style={{width:mining?"18%":"0%"}}/></div>
       <small>{mining?"Next claim in "+time(seconds):"Ready for your next mining cycle"}</small>
      </div>
    </section>

    <div className="stats">
      {[
        ["MINING REWARD","0.005 FTL","Every 12 hours"],
        ["DAILY STREAK","0.010 FTL","Every 24 hours"],
        ["TASKS","0 / 20","Referral unlock"],
        ["WITHDRAWAL","10 FTL","Minimum"]
      ].map(x=><div className="stat" key={x[0]}><small>{x[0]}</small><b>{x[1]}</b><span>{x[2]}</span></div>)}
    </div>

    <section className="quick"><div className="sectionHead"><h2>Quick actions</h2><small>START NOW</small></div>
      <div className="quickGrid">
       <button onClick={()=>setTab("Tasks")}><b>🎯</b><strong>Bonus Tasks</strong><small>Unlock with referrals</small></button>
       <button onClick={()=>setTab("Referrals")}><b>👥</b><strong>Invite Friends</strong><small>Grow your FTL rewards</small></button>
       <button onClick={()=>setTab("Wallet")}><b>💰</b><strong>Wallet</strong><small>Balance & history</small></button>
      </div>
    </section>
   </>}

   {tab!=="Home" && <section className="inner">
     <label>FTL COINS</label><h1>{tab}</h1>
     {tab==="Mining"&&<><p>Your mining engine is free to use. Each successful cycle earns <b>0.005 FTL</b> and the next cycle unlocks after 12 hours.</p><div className="big">{balance.toFixed(3)} <i>FTL</i></div><button className="mineBtn full" onClick={mine} disabled={mining||seconds>0}>{mining?"MINING ACTIVE":seconds>0?time(seconds):"MINE FTL"}</button></>}
     {tab==="Tasks"&&<><p>Complete available tasks to unlock bonus earning opportunities. Referral progress: <b>0 / 20</b>.</p><div className="empty">🎯<b>Tasks coming next</b><span>The task engine is ready for integration.</span></div></>}
     {tab==="Referrals"&&<><p>Invite friends with your personal referral link. Referrals unlock the task section; mining remains free.</p><div className="empty">👥<b>Referral system</b><span>Your Telegram referral link will appear here.</span></div></>}
     {tab==="Wallet"&&<><p>Your FTL balance and future transaction history.</p><div className="big">{balance.toFixed(3)} <i>FTL</i></div><div className="empty">💳<b>Wallet & withdrawals</b><span>Withdrawal infrastructure will connect to the backend.</span></div></>}
   </section>}

   {notice&&<div className="toast">{notice}</div>}

   <nav>{nav.map(([name,icon])=><button key={name} className={tab===name?"active":""} onClick={()=>setTab(name)}><b>{icon}</b><span>{name}</span></button>)}</nav>
 </main>
}