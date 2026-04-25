export interface Video {
  videoId: number;
  videoTitle: string;
  videoSummary?: string;
  videoLink: string;
  isPublished: boolean;
  createdVideoDate: Date;
  modifiedVideoDate: Date;
  tagId?: number;
  tagName?: string;
  workflowStatus?: number;
}

export interface CreateVideoDto {
  videoTitle: string;
  videoSummary?: string;
  videoLink: string;
  isPublished: boolean;
  tagId?: number;
}

export interface UpdateVideoDto {
  videoTitle?: string;
  videoSummary?: string;
  videoLink?: string;
  isPublished?: boolean;
  tagId?: number;
}
