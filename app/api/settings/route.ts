import bcrypt from "bcryptjs";

import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { SettingsSchema } from "@/schemas";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const validatedFields = SettingsSchema.safeParse(await req.json());
  const values = validatedFields.data;

  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthrized" });
  }

  const existingUser = await getUserById(user.id);

  if (!existingUser) {
    return NextResponse.json({ error: "Unauthrized" });
  }

  if (user.isOAuth) {
    if (values) {
      values.email = undefined;
      values.password = undefined;
      values.newPassword = undefined;
      values.isTwoFactorEnabled = undefined;
    }
  }

  if (values?.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: "Email already in use!" });
    }

    const verificationToken = await generateVerificationToken(values.email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return NextResponse.json({ success: "Verification email sent!" });
  }

  if (values?.password && values.newPassword && existingUser.password) {
    const passwordMatch = await bcrypt.compare(
      values.password,
      existingUser.password
    );

    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password!" });
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);

    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      ...values,
    },
  });

  return NextResponse.json({ success: "Updated" });
}
