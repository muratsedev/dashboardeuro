'use client';

interface PodcastPlayerProps {
  url: string;
  title: string;
}

function getSpotifyEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'open.spotify.com') {
      // Converts /episode/ID, /show/ID, /track/ID → embed URL
      return `https://open.spotify.com/embed${parsed.pathname}`;
    }
  } catch {
    // invalid URL
  }
  return null;
}

function isSoundCloud(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'soundcloud.com' ||
      parsed.hostname === 'www.soundcloud.com'
    );
  } catch {
    return false;
  }
}

function isDirectAudio(url: string): boolean {
  return /\.(mp3|ogg|wav|aac|m4a|flac)(\?.*)?$/i.test(url);
}

export default function PodcastPlayer({ url, title }: PodcastPlayerProps) {
  const spotifyEmbed = getSpotifyEmbedUrl(url);

  if (spotifyEmbed) {
    return (
      <iframe
        src={spotifyEmbed}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={title}
        className="rounded-lg border-0"
      />
    );
  }

  if (isSoundCloud(url)) {
    const embedUrl =
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}` +
      `&color=%23ff5500&auto_play=false&hide_related=true` +
      `&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    return (
      <iframe
        width="100%"
        height="166"
        src={embedUrl}
        allow="autoplay"
        title={title}
        className="rounded-lg border-0"
      />
    );
  }

  if (isDirectAudio(url)) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio controls className="w-full min-w-[220px]">
        <source src={url} />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          {url}
        </a>
      </audio>
    );
  }

  // Fallback: plain link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
    >
      {url.length > 50 ? `${url.substring(0, 50)}...` : url}
    </a>
  );
}
