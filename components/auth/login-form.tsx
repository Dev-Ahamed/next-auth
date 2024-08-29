"use client";
import { useState, useTransition } from "react";
import { CardWrapper } from "./card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

import { useSearchParams } from "next/navigation";
import ResendLink from "./resend-link";
import Link from "next/link";

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider"
      : "";

  const [isPending, startTransition] = useTransition();

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [resendBtn, setResendBtn] = useState(false);
  const [sendAt, setSendAt] = useState(String);

  // Define your form
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  // Handle form submit
  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    // clear the success and error
    setSuccess("");
    setError("");
    setResendBtn(false);

    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (result?.successLogin) {
        setSuccess(result?.successLogin);
        form.reset();
        window.location.href = callbackUrl || "/settings";
      } else if (result?.success) {
        setSuccess(result?.success);
      } else if (result?.error) {
        setError(result?.error);
      } else if (result?.timeError) {
        setError(result?.timeError);
        setSendAt(result?.sendAt);
        setResendBtn(true);
      } else if (result?.twoFactor) {
        setShowTwoFactor(true);
      }
    });
  };

  const handleResend: () => void = async () => {
    setSuccess("");
    setError("");

    const { getValues } = form;
    const { email } = getValues();

    const res = await fetch(`/api/auth/resend`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const result = await res.json();

    if (result?.success) {
      setResendBtn(false);
      setSuccess(result?.success);
    } else if (result?.error) {
      setError(result?.error);
    }
  };
  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              // 2FA code field
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Email */}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="example@email.com"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="******"
                          type="password"
                        />
                      </FormControl>
                      {/* Forgot Password Btn */}
                      <Button
                        size="sm"
                        variant="link"
                        asChild
                        className="px-0 font-normal w-full flex justify-end"
                      >
                        <Link href="/auth/reset">Forgot password?</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          {/* Show error */}
          <FormError message={error || urlError} />
          {/* Show Success */}
          <FormSuccess message={success} />
          {/* Resend Link */}
          {resendBtn && <ResendLink sendAt={sendAt} onClick={handleResend} />}
          {/* Submit btn */}
          <Button type="submit" disabled={isPending} className="w-full">
            {showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
