import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const verificationToken = await generateVerificationToken(email);
    const result = await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return NextResponse.json({
      success: "Confirmation email sent!",
    });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong!" });
  }
}
