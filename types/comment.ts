export interface Comment {
  id: number;
  content: string;
  path?: string;
  depth?: number;
  deleted?: boolean;
  postId: number;
  authorId?: number;
  author?: { id?: number; name?: string; email?: string };
  threadOf?: number | null;
  children?: Comment[];
  createdAt?: string;
}
