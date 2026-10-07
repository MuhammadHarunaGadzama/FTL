import {NextResponse} from "next/server";
import {validateTelegramInitData} from "@/lib/telegram";
export async function POST(req){
 const {initData}=await req.json(),tg=validateTelegramInitData(initData);
 if(!tg)return NextResponse.json({error:"Invalid Telegram session"},{status:401});
 return NextResponse.json({ok:true,referralCode:String(tg.id),reward:.01,unlockAt:20});
}