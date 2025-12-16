"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createComment, deleteComment, listComments, updateComment } from "../../lib/api/comments";
import type { Comment } from "../../types/comment";

const SOFT_DELETE_PLACEHOLDER = "[deleted]";

interface CommentsSectionProps {
  relation: string;
  locale: string;
  authToken?: string | null;
  currentUserId?: number | null;
}

function formatTimestamp(value?: string, locale?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale || "en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function CommentsSection({
  relation,
  locale,
  authToken,
  currentUserId,
}: CommentsSectionProps) {
  const t = useTranslations("Comments");
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [replyFor, setReplyFor] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const pageSize = 10;

  const isSoftDeleted = useCallback((comment: Comment) => {
    return (
      !!comment &&
      (comment.deleted === true ||
        comment.removed === true ||
        comment.content === SOFT_DELETE_PLACEHOLDER)
    );
  }, []);

  const normalizeComment = useCallback((comment: Comment): Comment => {
    const parsedId = typeof comment.id === "string" ? Number(comment.id) : comment.id;
    const id = Number.isFinite(parsedId) ? parsedId : comment.id;

    const threadOfRaw = (comment as { threadOf?: number | string | null }).threadOf;
    let threadOf: number | null = null;
    if (threadOfRaw !== undefined && threadOfRaw !== null) {
      const parsed = typeof threadOfRaw === "string" ? Number(threadOfRaw) : threadOfRaw;
      threadOf = Number.isFinite(parsed) ? parsed : null;
    }

    return { ...comment, id, threadOf };
  }, []);

  const flattenComments = useCallback(
    (items: Comment[], parentId: number | null = null): Comment[] => {
      // Normalize potential tree payloads into a flat list while preserving parent id
      const acc: Comment[] = [];
      const visit = (node: Comment, parent: number | null) => {
        const normalized = normalizeComment(node);
        const threadOf = normalized.threadOf ?? parent ?? null;
        acc.push({ ...normalized, threadOf, children: undefined });
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach((child) => visit(child, normalized.id));
        }
      };
      items.forEach((node) => visit(node, parentId));
      return acc;
    },
    [normalizeComment]
  );

  function buildTree(items: Comment[]) {
    const map = new Map<number, Comment & { children: Comment[] }>();
    const roots: Array<Comment & { children: Comment[] }> = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    map.forEach((node) => {
      const parentId = node.threadOf ?? null;
      if (parentId && map.has(parentId)) {
        map.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Keep original order by id desc (API sorts desc) for roots and children
    const sorter = (a: Comment, b: Comment) => b.id - a.id;
    const sortRec = (nodes: Array<Comment & { children: Comment[] }>) => {
      nodes.sort(sorter);
      nodes.forEach((n) => sortRec(n.children as Array<Comment & { children: Comment[] }>));
    };
    sortRec(roots);
    return roots;
  }

  const visibleComments = useMemo(() => {
    const childParents = new Set<number>();
    comments.forEach((c) => {
      if (c.threadOf !== null && c.threadOf !== undefined) {
        const parentId = typeof c.threadOf === "string" ? Number(c.threadOf) : c.threadOf;
        if (Number.isFinite(parentId)) childParents.add(parentId as number);
      }
    });

    return comments.filter((c) => {
      const id = typeof c.id === "string" ? Number(c.id) : c.id;
      const noChildren = !childParents.has(id as number);
      if (isSoftDeleted(c) && noChildren) return false;
      return true;
    });
  }, [comments, isSoftDeleted]);

  const tree = useMemo(() => buildTree(visibleComments), [visibleComments]);

  function upsertComments(newItems: Comment[]) {
    setComments((prev) => {
      const map = new Map<number, Comment>();
      const normalizedNew = newItems.map(normalizeComment);
      [...prev, ...normalizedNew].forEach((raw) => {
        const c = normalizeComment(raw);
        const existing = map.get(c.id) || prev.find((p) => normalizeComment(p).id === c.id);
        // Preserve threadOf if backend omits it, and do not drop it when API sends null for replies
        const threadOf =
          c.threadOf !== undefined && c.threadOf !== null ? c.threadOf : existing?.threadOf ?? null;
        map.set(c.id, { ...existing, ...c, threadOf });
      });
      return Array.from(map.values());
    });
  }

  const loadComments = useCallback(
    async (nextPage = 1, reset = false): Promise<Comment[]> => {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await listComments(relation, nextPage, pageSize, locale);
        const items = flattenComments(response?.data || []);
        const pagination = response?.meta?.pagination;

        setComments((prev) => (reset ? items : [...prev, ...items]));
        if (pagination) {
          setHasMore((pagination.page || 1) < (pagination.pageCount || 1));
        } else {
          setHasMore(items.length >= pageSize);
        }
        setPage(nextPage);
        return items;
      } catch (err) {
        console.error(err);
        setError(t("loadError"));
        return [];
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [flattenComments, locale, pageSize, relation, t]
  );

  useEffect(() => {
    loadComments(1, true);
  }, [loadComments]);

  const canSubmit = useMemo(
    () => Boolean(authToken) && content.trim().length > 0,
    [authToken, content]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!authToken) {
      setError(t("signinRequired"));
      return;
    }

    if (!content.trim()) {
      setError(t("contentRequired"));
      return;
    }

    try {
      setSubmitting(true);
      const result = await createComment(relation, { content: content.trim() }, authToken, locale);
      if (result?.data) {
        setComments((prev) => [result.data, ...prev]);
        setContent("");
      }
    } catch (err) {
      console.error(err);
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!authToken) {
      setError(t("signinRequired"));
      return;
    }
    if (!replyText.trim()) {
      setError(t("contentRequired"));
      return;
    }
    try {
      const result = await createComment(
        relation,
        { content: replyText.trim(), threadOf: parentId },
        authToken,
        locale
      );
      if (result?.data) {
        // Ensure threadOf is set even if API omits it
        upsertComments([{ ...result.data, threadOf: parentId }]);
        setReplyFor(null);
        setReplyText("");
      }
    } catch (err) {
      console.error(err);
      setError(t("submitError"));
    }
  };

  const handleEditSubmit = async (commentId: number) => {
    if (!authToken) {
      setError(t("signinRequired"));
      return;
    }
    if (!editText.trim()) {
      setError(t("contentRequired"));
      return;
    }
    try {
      const result = await updateComment(
        relation,
        commentId,
        { content: editText.trim() },
        authToken
      );
      const updated = result?.data || null;
      if (updated) {
        const existing = comments.find((c) => c.id === commentId);
        const threadOf =
          updated.threadOf !== undefined && updated.threadOf !== null
            ? updated.threadOf
            : existing?.threadOf ?? null;
        upsertComments([{ ...updated, threadOf }]);
        setEditingId(null);
        setEditText("");
      }
    } catch (err) {
      console.error(err);
      setError(t("updateError"));
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!authToken) {
      setError(t("signinRequired"));
      return;
    }
    try {
      const target = comments.find((c) => c.id === commentId);
      const hasChildren = target?.id ? comments.some((c) => c.threadOf === target.id) : false;

      if (hasChildren) {
        // Soft delete: replace content with placeholder to keep children intact
        await updateComment(relation, commentId, { content: SOFT_DELETE_PLACEHOLDER }, authToken);
      } else {
        await deleteComment(relation, commentId, authToken, currentUserId ?? undefined);
      }

      // Always refetch to reflect server state and cascading behavior
      await loadComments(1, true);
    } catch (err) {
      console.error(err);
      setError(t("deleteError"));
    }
  };

  const renderAuthor = (comment: Comment) => {
    if (isSoftDeleted(comment)) return t("deleted");
    const authorObj = (comment as { author?: { name?: string; email?: string; id?: number } })
      ?.author;
    return (
      authorObj?.name ||
      authorObj?.email ||
      (comment.authorId ? `${t("author")} #${comment.authorId}` : t("anonymous"))
    );
  };

  const renderComment = (comment: Comment & { children?: Comment[] }, depth = 0) => {
    const isOwner =
      !!currentUserId &&
      (comment.authorId === currentUserId || comment.author?.id === currentUserId);
    const isEditing = editingId === comment.id;
    const isReplying = replyFor === comment.id;
    const isRemoved = isSoftDeleted(comment);

    return (
      <article
        key={comment.id}
        className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        style={{ marginLeft: depth ? `${depth * 16}px` : undefined }}
      >
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {renderAuthor(comment)}
          </span>
          <span>{formatTimestamp(comment.createdAt, locale)}</span>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
            />
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => handleEditSubmit(comment.id)}
                className="rounded-lg bg-black px-3 py-1.5 font-semibold text-white hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-black"
              >
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEditText("");
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:text-gray-100"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-line text-sm text-gray-800 dark:text-gray-100">
            {isRemoved ? t("deleted") : comment.content}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          {authToken && (
            <button
              type="button"
              onClick={() => {
                setReplyFor(comment.id);
                setReplyText("");
                setEditingId(null);
              }}
              className="font-semibold hover:text-black dark:hover:text-white"
            >
              {t("reply")}
            </button>
          )}
          {isOwner && !isRemoved && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditingId(comment.id);
                  setEditText(comment.content || "");
                  setReplyFor(null);
                  setReplyText("");
                }}
                className="font-semibold hover:text-black dark:hover:text-white"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(comment.id)}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                {t("delete")}
              </button>
            </>
          )}
        </div>

        {isReplying && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50"
            />
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => handleReplySubmit(comment.id)}
                className="rounded-lg bg-black px-3 py-1.5 font-semibold text-white hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-black"
              >
                {t("submit")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyFor(null);
                  setReplyText("");
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:text-gray-100"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}

        {comment.children && comment.children.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.children.map((child) => renderComment(child, depth + 1))}
          </div>
        )}
      </article>
    );
  };

  return (
    <section className="space-y-4 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            {t("title")}
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t("subtitle")}</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-gray-200">
          {comments.length}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t(authToken ? "placeholder" : "signinRequired")}
          disabled={!authToken || submitting}
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-50 dark:focus:border-white dark:focus:ring-white"
        />
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>{authToken ? t("hint") : t("signinRequired")}</span>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {submitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">{t("loading")}</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">{t("empty")}</p>
        ) : (
          tree.map((comment) => renderComment(comment))
        )}
      </div>

      {hasMore && !loading && (
        <button
          type="button"
          onClick={() => loadComments(page + 1, false)}
          disabled={loadingMore}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 dark:border-zinc-700 dark:text-gray-100"
        >
          {loadingMore ? t("loading") : t("loadMore")}
        </button>
      )}
    </section>
  );
}
