import crypto from "crypto";
export function validateTelegramInitData(initData){
 if(!initData||!process.env.TELEGRAM_BOT_TOKEN)return null;
 const p=new URLSearchParams(initData),hash=p.get("hash"),authDate=Number(p.get("auth_date"));
 if(!hash||!authDate||Math.floor(Date.now()/1000)-authDate>86400)return null;
 const check=[...p.entries()].filter(([k])=>k!=="hash").sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+"="+v).join("\n");
 const secret=crypto.createHmac("sha256","WebAppData").update(process.env.TELEGRAM_BOT_TOKEN).digest();
 const expected=crypto.createHmac("sha256",secret).update(check).digest("hex");
 if(expected.length!==hash.length||!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(hash)))return null;
 try{return JSON.parse(p.get("user")||"null")}catch{return null}
}