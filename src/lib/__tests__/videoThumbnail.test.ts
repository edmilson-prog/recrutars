import { describe, it, expect } from 'vitest';
import { extractYouTubeId, extractVimeoId, getVideoThumbnail } from '@/lib/videoThumbnail';

describe('videoThumbnail', () => {
  it('extracts a YouTube id from a watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts a YouTube id from a youtu.be short URL', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for a non-YouTube URL', () => {
    expect(extractYouTubeId('https://example.com/video')).toBeNull();
  });

  it('extracts a Vimeo id', () => {
    expect(extractVimeoId('https://vimeo.com/123456789')).toBe('123456789');
  });

  it('getVideoThumbnail returns youtube descriptor', () => {
    expect(getVideoThumbnail('https://youtu.be/dQw4w9WgXcQ')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' });
  });

  it('getVideoThumbnail returns vimeo descriptor', () => {
    expect(getVideoThumbnail('https://vimeo.com/123456789')).toEqual({ type: 'vimeo', id: '123456789' });
  });

  it('getVideoThumbnail returns null for unknown provider', () => {
    expect(getVideoThumbnail('https://example.com/video.mp4')).toBeNull();
  });

  it('extracts a Vimeo id from the /video/ path variant', () => {
    expect(extractVimeoId('https://vimeo.com/video/123456789')).toBe('123456789');
  });

  it('extracts a YouTube id from an embed URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
});
