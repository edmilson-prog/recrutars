/**
 * Notification Sound
 * Plays a short two-tone "ding" sound using the Web Audio API.
 * No external audio files needed — generated programmatically.
 */

let audioContext: AudioContext | null = null;

/**
 * Warm up the AudioContext on the first user gesture so it's ready
 * when a Realtime notification arrives (which is NOT a user gesture
 * and would be blocked by Chrome's autoplay policy).
 */
function initOnUserGesture() {
  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  } catch {
    // Ignore — getAudioContext will retry later
  }
  // Clean up listeners once the context is running
  if (audioContext?.state === 'running') {
    const events = ['click', 'keydown', 'touchstart', 'pointerdown'];
    for (const evt of events) {
      document.removeEventListener(evt, initOnUserGesture);
    }
  }
}

// Register listeners at module load — first interaction warms the context
const gestureEvents = ['click', 'keydown', 'touchstart', 'pointerdown'];
for (const evt of gestureEvents) {
  document.addEventListener(evt, initOnUserGesture, { capture: true });
}

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, volume: number) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.15, 0.3);       // C5
  playTone(ctx, 659.25, now + 0.15, 0.2, 0.25); // E5
}
