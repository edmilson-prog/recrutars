// Video thumbnail helpers shared by the candidate's DocumentsTab (editable)
// and the company's read-only CandidateDocumentsCard.

export type VideoThumbnail = { type: 'youtube' | 'vimeo'; id: string } | null;

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export function getVideoThumbnail(url: string): VideoThumbnail {
  const ytId = extractYouTubeId(url);
  if (ytId) return { type: 'youtube', id: ytId };
  const vimeoId = extractVimeoId(url);
  if (vimeoId) return { type: 'vimeo', id: vimeoId };
  return null;
}
