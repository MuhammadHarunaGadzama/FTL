import { NextResponse } from "next/server";
import { verifyTelegramInitData } from "@/lib/telegram";
import { supabaseAdmin } from "@/lib/supabase";

const MINING_REWARD = 0.005;
const COOLDOWN_MS = 12 * 60 * 60 * 1000;

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

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Open the app again." },
        { status: 404 }
      );
    }

    if (user.last_mined_at) {
      const lastMined = new Date(user.last_mined_at).getTime();
      const nextMine = lastMined + COOLDOWN_MS;
      const now = Date.now();

      if (now < nextMine) {
        const remainingMs = nextMine - now;

        return NextResponse.json(
          {
            error: "Mining is still on cooldown",
            remainingMs,
            nextMineAt: new Date(nextMine).toISOString()
          },
          { status: 429 }
        );
      }
    }

    const newBalance =
      Number(user.balance || 0) + MINING_REWARD;

    const { data: updatedUser, error: updateError } =
      await supabaseAdmin
        .from("users")
        .update({
          balance: newBalance,
          last_mined_at: new Date().toISOString()
        })
        .eq("id", user.id)
        .select("*")
        .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("mining_events")
      .insert({
        user_id: user.id,
        reward: MINING_REWARD
      });

    return NextResponse.json({
      ok: true,
      reward: MINING_REWARD,
      balance: Number(updatedUser.balance),
      nextMineAt: new Date(
        Date.now() + COOLDOWN_MS
      ).toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
          }
