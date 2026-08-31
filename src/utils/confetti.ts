export async function fireConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { y?: number; x?: number };
}): Promise<void> {
  try {
    const confettiModule = await import("canvas-confetti");
    const confetti = (confettiModule as any).default || confettiModule;
    confetti(options);
  } catch (err) {
    console.warn("Failed to load confetti:", err);
  }
}
