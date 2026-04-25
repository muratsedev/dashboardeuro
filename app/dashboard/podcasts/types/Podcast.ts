export interface Podcast {
  podcastId: number;
  podcastTitle: string;
  podcastSummary?: string;
  podcastLink: string;
  isPublished: boolean;
  workflowStatus?: number;
}

export interface CreatePodcastDto {
  podcastTitle: string;
  podcastSummary?: string;
  podcastLink: string;
  isPublished: boolean;
}

export interface UpdatePodcastDto {
  podcastTitle?: string;
  podcastSummary?: string;
  podcastLink?: string;
  isPublished?: boolean;
}
