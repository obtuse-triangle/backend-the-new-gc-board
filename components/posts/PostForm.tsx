"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ImageUploader, { ExistingImage } from "./ImageUploader";
import { uploadFiles } from "../../lib/api/upload";
import { createPost, updatePost } from "../../lib/api/posts";
import type { NormalizedPost } from "../../lib/posts/normalize";
import type { StrapiSingleResponse } from "../../types/strapi";
import type { PostWithLocalizations } from "../../types/post";

const schema = (messages: { required: string }) =>
  z.object({
    title: z.string().min(1, messages.required),
    content: z.string().min(1, messages.required),
  });

export interface PostFormProps {
  locale: string;
  mode: "create" | "edit";
  post?: NormalizedPost | null;
  authToken?: string | null;
}

export function PostForm({ locale, mode, post, authToken }: PostFormProps) {
  const tForm = useTranslations("PostForm");
  const tPosts = useTranslations("Posts");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(() =>
    (post?.images || []).slice(0, 1)
  );
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const formSchema = useMemo(() => schema({ required: tForm("validation.required") }), [tForm]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ title: string; content: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: post?.title || "", content: post?.content || "" },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    if (!authToken) {
      setError(tPosts("authRequired"));
      return;
    }

    if (existingImages.length + pendingFiles.length === 0) {
      setError(tForm("validation.images"));
      return;
    }

    startTransition(async () => {
      try {
        const uploadResults = pendingFiles.length ? await uploadFiles(pendingFiles, authToken) : [];
        const uploadedIds = Array.isArray(uploadResults)
          ? uploadResults
              .map((item: { id?: number }) => item.id)
              .filter((id): id is number => typeof id === "number")
          : [];

        const existingId = existingImages.find((img) => typeof img.id === "number")?.id;
        const imageIds = [existingId, uploadedIds[0]].filter(
          (id): id is number => typeof id === "number"
        );

        const payload = { ...values, locale: post?.locale || locale, imageIds };
        const result: StrapiSingleResponse<PostWithLocalizations> =
          mode === "create"
            ? await createPost(payload, authToken)
            : await updatePost(post?.id || "", payload, authToken);

        const createdId =
          (result?.data as { documentId?: string })?.documentId ||
          (result?.data as { attributes?: { documentId?: string } })?.attributes?.documentId ||
          (mode === "edit" ? post?.id : undefined);

        if (!createdId) {
          setError(tForm("unknownError"));
          return;
        }

        router.push(`/${locale}/posts/${createdId}`);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(tForm("unknownError"));
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
          {tForm("title")}
        </label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
          {...register("title")}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
          {tForm("content")}
        </label>
        <textarea
          rows={6}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
          {...register("content")}
        />
        {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
      </div>

      <ImageUploader
        existingImages={existingImages}
        pendingFiles={pendingFiles}
        onAddFiles={(files) => setPendingFiles(files.slice(0, 1))}
        onRemoveExisting={(url) =>
          setExistingImages((prev) => prev.filter((img) => img.url !== url))
        }
        onRemovePending={(fileName) =>
          setPendingFiles((prev) => prev.filter((f) => f.name !== fileName))
        }
        disabled={isSubmitting || isPending}
        hint={tForm("uploadHint")}
        title={tForm("images")}
        removeLabel={tForm("remove")}
        existingLabel={tForm("existing")}
        newLabel={tForm("new")}
        processingLabel={tForm("processing")}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isPending}
        className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 dark:bg-white dark:text-black"
      >
        {isSubmitting || isPending
          ? tForm("saving")
          : mode === "create"
          ? tForm("submitCreate")
          : tForm("submitUpdate")}
      </button>
    </form>
  );
}

export default PostForm;
