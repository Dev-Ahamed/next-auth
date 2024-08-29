import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/email-verification?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Next-Auth <onboarding@resend.dev>",
      to: email,
      subject: "Next auth confirmation email",
      html: `<p>Click <a href=${confirmLink}>here</a> to confirm email.</p>`,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/new-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Next-Auth <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href=${resetLink}>here</a> to your password.</p>`,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Next-Auth <onboarding@resend.dev>",
      to: email,
      subject: "Two-Factor Verification Code",
      html: `<p>Your 2FA code: ${token}</p>`,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
};
