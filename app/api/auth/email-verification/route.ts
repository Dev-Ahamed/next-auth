import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
      return NextResponse.json({ error: "Token does not exist!" });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired!" });
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return NextResponse.json({ error: "User does not exist!" });
    }

    const updatedUser = await db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      },
    });

    const deletedVerificationtoken = await db.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ success: "Email verified" });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" });
  }
}
