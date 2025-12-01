export interface Comment {
  id: number;
  content: string;
  path?: string;
  depth?: number;
  deleted?: boolean;
  postId: number;
  authorId?: number;
  createdAt?: string;
}
