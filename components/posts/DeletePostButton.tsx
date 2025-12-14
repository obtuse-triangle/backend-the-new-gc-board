"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deletePost } from "../../lib/api/posts";

interface DeletePostButtonProps {
  documentId: string;
  locale: string;
  authToken?: string | null;
}

export default function DeletePostButton({ documentId, locale, authToken }: DeletePostButtonProps) {
  const t = useTranslations("Posts");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    if (!authToken) {
      setError(t("deleteErrorAuth"));
      return;
    }
    const ok = typeof window === "undefined" ? true : window.confirm(t("deleteConfirm"));
    if (!ok) return;

    startTransition(async () => {
      try {
        await deletePost(documentId, authToken);
        router.push(`/${locale}/posts`);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(t("deleteErrorFailed"));
      }
    });
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:shadow disabled:opacity-60 dark:border-red-700/50 dark:bg-red-900/30 dark:text-red-200"
      >
        {isPending ? t("deleting") : t("deleteButton")}
      </button>
    </div>
  );
}
