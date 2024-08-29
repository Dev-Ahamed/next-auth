import * as z from "zod";

import { ResetSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const validatedFields = ResetSchema.safeParse(await req.json());

  if (!validatedFields.success) {
    return NextResponse.json({ success: "Invalid email!" });
  }

  const { email } = validatedFields.data;

  const existinguser = await getUserByEmail(email);

  if (!existinguser) {
    return NextResponse.json({ error: "Email not found!" });
  }

  // generate token and send email

  const passwordResetToken = await generatePasswordResetToken(email);

  const result = await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return NextResponse.json({ success: "Reset email sent!" });
}
