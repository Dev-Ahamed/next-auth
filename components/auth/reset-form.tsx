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
import { ResetSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

import ResendLink from "./resend-link";
import Link from "next/link";

export const ResetForm = () => {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [resendBtn, setResendBtn] = useState(false);
  const [sendAt, setSendAt] = useState(String);

  // Define your form
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submit
  const onSubmit = async (values: z.infer<typeof ResetSchema>) => {
    // clear the success and error
    setSuccess("");
    setError("");
    setResendBtn(false);

    startTransition(async () => {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (result?.success) {
        setSuccess(result?.success);
      } else if (result?.error) {
        setError(result?.error);
      } else if (result?.timeError) {
        setError(result?.timeError);
        setSendAt(result?.sendAt);
        setResendBtn(true);
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
      headerLabel="Forgot your password?"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Email */}
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
          </div>
          {/* Show error */}
          <FormError message={error} />
          {/* Show Success */}
          <FormSuccess message={success} />
          {/* Resend Link */}
          {resendBtn && <ResendLink sendAt={sendAt} onClick={handleResend} />}
          {/* Submit btn */}
          <Button type="submit" disabled={isPending} className="w-full">
            Send reset email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
