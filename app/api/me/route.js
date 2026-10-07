import { NextResponse } from "next/server";
import { verifyTelegramInitData } from "@/lib/telegram";
import { supabaseAdmin } from "@/lib/supabase";

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

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({
        ok: true,
        user: existingUser
      });
    }

    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        balance: 0,
        referrals: 0,
        streak: 0
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: newUser
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
       }
