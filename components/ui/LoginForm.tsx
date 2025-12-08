"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = (messages: { required: string }) =>
  z.object({
    identifier: z.string().min(1, messages.required),
    password: z.string().min(1, messages.required),
  });

type LoginInput = z.infer<ReturnType<typeof formSchema>>;

export function LoginForm() {
  const tLogin = useTranslations("Auth.Login");
  const tErrors = useTranslations("Auth.Errors");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || `/${locale}`;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schema = useMemo(() => formSchema({ required: tErrors("required") }), [tErrors]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        ...data,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(tErrors("failed"));
        return;
      }

      router.push(result?.url || callbackUrl);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {tLogin("identifier")}
        </label>
        <input
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
          autoComplete="username"
          {...register("identifier")}
        />
        {errors.identifier && <p className="text-sm text-red-600">{errors.identifier.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {tLogin("password")}
        </label>
        <input
          type="password"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
          autoComplete="current-password"
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
        {isSubmitting || isPending ? tCommon("loading") : tLogin("submit")}
      </button>
    </form>
  );
}
