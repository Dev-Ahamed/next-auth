import bcrypt from "bcryptjs";
import { LoginSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { z } from "zod";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export async function POST(req: Request) {
  const validatedFields = LoginSchema.safeParse(await req.json());

  if (!validatedFields.success) {
    return NextResponse.json({ status: 400, message: "Invalid fields!" });
  }

  const { email, password, code } = validatedFields.data;

  const existinguser = await getUserByEmail(email);

  if (!existinguser || !existinguser.email || !existinguser.password) {
    return NextResponse.json({
      status: 500,
      error: "Email does not exist",
    });
  }

  const passwordMatch = await bcrypt.compare(password, existinguser.password);

  if (!passwordMatch) {
    return NextResponse.json({
      status: 500,
      error: "Invalid credentials!",
    });
  }

  if (!existinguser.emailVerified) {
    const existingToken = await getVerificationTokenByEmail(existinguser.email);

    if (existingToken) {
      const hasExpired = new Date(existingToken.expires) < new Date();

      if (!hasExpired) {
        return NextResponse.json({
          status: 500,
          timeError: "Confirmation email already sent!",
          sendAt: existingToken.sendAt,
        });
      }
    }

    const verificationToken = await generateVerificationToken(
      existinguser?.email
    );

    const result = await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return NextResponse.json({
      status: 200,
      success: "Confirmation email sent!",
    });
  }

  if (existinguser.isTwoFactorEnabled && existinguser.email) {
    if (code) {
      // Verify 2FA code
      const twoFactorToken = await getTwoFactorTokenByEmail(existinguser.email);

      if (!twoFactorToken) {
        return NextResponse.json({
          error: "Invalid code!",
        });
      }

      if (twoFactorToken.token !== code) {
        return NextResponse.json({
          error: "Invalid code!",
        });
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return NextResponse.json({
          error: "Code expired!",
        });
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existinguser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existinguser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existinguser.email);

      const result = await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token
      );

      return NextResponse.json({
        twoFactor: true,
      });
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
      // redirectTo: DEFAULT_LOGIN_REDIRECT
    });

    return NextResponse.json({
      status: 200,
      successLogin: "Successfully logged in",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return NextResponse.json({
            status: 500,
            error: "Invalid credentials",
          });
        default:
          return NextResponse.json({
            status: 500,
            error: "Something went wrong!",
          });
      }
    }

    throw error;
  }

  // return NextResponse.json({ status: 200, message: "Email sent!" });
}
