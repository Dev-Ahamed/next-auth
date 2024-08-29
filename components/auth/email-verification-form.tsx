"use client";
import { useCallback, useEffect, useState } from "react";
import { CardWrapper } from "./card-wrapper";

import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";

export const EmailVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setloading] = useState(true);

  const onSubmit = useCallback(async () => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    const res = await fetch(`/api/auth/email-verification`, {
      method: "POST",
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const result = await res.json();

    if (result?.error) {
      setError(result?.error);
    } else if (result?.success) {
      setSuccess(result?.success);
    }
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader loading={loading} />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
