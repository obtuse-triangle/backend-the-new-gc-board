"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerUser } from "@/lib/api/auth";

const formSchema = (messages: { required: string; invalidEmail: string }) =>
  z.object({
    username: z.string().min(1, messages.required),
    email: z.string().email(messages.invalidEmail),
    password: z.string().min(6, messages.required),
  });

type RegisterInput = z.infer<ReturnType<typeof formSchema>>;

export function RegisterForm() {
  const tRegister = useTranslations("Auth.Register");
  const tErrors = useTranslations("Auth.Errors");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schema = useMemo(
    () => formSchema({ required: tErrors("required"), invalidEmail: tErrors("invalidEmail") }),
    [tErrors],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await registerUser(data.username, data.email, data.password);
        if (!result?.jwt) {
          setError(tErrors("registrationFailed"));
          return;
        }

        await signIn("credentials", {
          identifier: data.email,
          password: data.password,
          callbackUrl: `/${locale}`,
        });
      } catch {
        setError(tErrors("registrationFailed"));
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {tRegister("username")}
        </label>
        <input
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
          autoComplete="username"
          {...register("username")}
        />
        {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {tRegister("email")}
        </label>
        <input
          type="email"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {tRegister("password")}
        </label>
        <input
          type="password"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isPending}
        className="w-full rounded bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        {isSubmitting || isPending ? tCommon("loading") : tRegister("submit")}
      </button>
    </form>
  );
}
