import { RegisterSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const validatedFields = RegisterSchema.safeParse(await req.json());

  if (!validatedFields.success) {
    return NextResponse.json({ status: 500, message: "Invalid fields!" });
  }

  const { email, password, name } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existinguser = await getUserByEmail(email);

  if (existinguser) {
    return NextResponse.json({ status: 500, message: "Email already in use!" });
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Send verification token email

  const verificationToken = await generateVerificationToken(user?.email);

  const result = await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token
  );

  return NextResponse.json({
    status: 200,
    message: "Confirmation email sent!",
  });
}
