import { NextResponse } from "next/server";
import { submitDataRightsRequest } from "@/app/actions/data-rights";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, requestType, details, hp_field } = body;

    // Anti-Bot Honeypot Protection: Automated bots fill out hidden fields
    if (hp_field) {
      // Return synthetic success response to trap and silently drop bot submissions
      return NextResponse.json({
        success: true,
        message: "Data rights request submitted successfully.",
      });
    }

    if (!name || !email || !requestType) {
      return NextResponse.json(
        { error: "Name, email, and requestType are required fields." },
        { status: 400 }
      );
    }

    const res = await submitDataRightsRequest({
      name,
      email,
      requestType,
      details,
    });

    if ("error" in res && res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Data rights request submitted successfully. Resolution SLA is 30 days under DPDP §13.",
    });
  } catch (error: unknown) {
    console.error("Failed to process API data rights request:", error);
    return NextResponse.json(
      { error: "Internal server error processing data rights request." },
      { status: 500 }
    );
  }
}
