import { NextResponse } from "next/server";
import { verifyTelegramInitData } from "@/lib/telegram";
import { supabaseAdmin } from "@/lib/supabase";

const REFERRAL_REWARD = 0.01;
const TASK_UNLOCK_REFERRALS = 20;

export async function POST(request) {
  try {
    const body = await request.json();
    const initData = body?.initData;

    if (!initData) {
      return NextResponse.json(
        { error: "Telegram initData is required" },
        { status: 400 }
      );
    }

    const telegramUser = verifyTelegramInitData(initData);

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Invalid Telegram authentication" },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const referralCode = `FTL${user.telegram_id}`;

    return NextResponse.json({
      ok: true,
      referralCode,
      referrals: user.referrals || 0,
      rewardPerReferral: REFERRAL_REWARD,
      tasksUnlockAt: TASK_UNLOCK_REFERRALS,
      tasksUnlocked:
        Number(user.referrals || 0) >= TASK_UNLOCK_REFERRALS
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
      }
