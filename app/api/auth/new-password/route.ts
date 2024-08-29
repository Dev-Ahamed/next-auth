import bcrypt from "bcryptjs";
import { getPasswordresetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { db } from "@/lib/db";
import { NewPasswordSchema } from "@/schemas";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const validatedFields = NewPasswordSchema.safeParse(data.values);
  const password = validatedFields.data?.password;
  const token = await data.token;

  if (!token) {
    return NextResponse.json({ error: "Missing token!" });
  }

  try {
    const existingToken = await getPasswordresetTokenByToken(token);

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid token!" });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired!" });
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return NextResponse.json({ error: "Email does not exist!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  } catch (error) {}
  return NextResponse.json({ success: "Password updated!" });

  //   try {
  //     const existingToken = await getVerificationTokenByToken(token);

  //     if (!existingToken) {
  //       return NextResponse.json({ error: "Token does not exist!" });
  //     }

  //     const hasExpired = new Date(existingToken.expires) < new Date();

  //     if (hasExpired) {
  //       return NextResponse.json({ error: "Token has expired!" });
  //     }

  //     const existingUser = await getUserByEmail(existingToken.email);

  //     if (!existingUser) {
  //       return NextResponse.json({ error: "User does not exist!" });
  //     }

  //     const updatedUser = await db.user.update({
  //       where: { id: existingUser.id },
  //       data: {
  //         emailVerified: new Date(),
  //         email: existingToken.email,
  //       },
  //     });

  //     const deletedVerificationtoken = await db.verificationToken.delete({
  //       where: { id: existingToken.id },
  //     });

  //     return NextResponse.json({ success: "Email verified" });
  //   } catch (error) {
  //     return NextResponse.json({ error: "Something went wrong" });
  //   }
}
