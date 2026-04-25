export interface Opinion {
  id: string; // Guid
  title: string;
  summary: string;
  content: string;
  imagePath: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  isPublished: boolean;
  authorId: number | null;
  authorName: string | null;
  authorPicture: string | null;
  tagId: number | null;
  tagName: string | null;
}

export interface OpinionCreate {
  title: string;
  summary: string;
  content: string;
  isPublished: boolean;
  authorId?: number;
  tagId?: number;
  createdDate?: string;
  updatedDate?: string;
}
