import confetti from 'canvas-confetti';

/**
 * Trigger a confetti celebration for level-ups
 */
export const celebrateLevelUp = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Burst from left
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#8B5CF6', '#3B82F6'],
    });

    // Burst from right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#8B5CF6', '#3B82F6'],
    });
  }, 250);
};

/**
 * Trigger a badge unlock celebration
 */
export const celebrateBadgeUnlock = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
  const colors = {
    common: ['#94A3B8', '#CBD5E1'],
    rare: ['#3B82F6', '#60A5FA'],
    epic: ['#8B5CF6', '#A78BFA'],
    legendary: ['#FFD700', '#FFA500', '#FF6347'],
  };

  confetti({
    particleCount: rarity === 'legendary' ? 150 : rarity === 'epic' ? 100 : 75,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors[rarity],
    zIndex: 10000,
    shapes: ['circle', 'square'],
    scalar: 1.2,
  });

  // Second burst for legendary
  if (rarity === 'legendary') {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors[rarity],
        zIndex: 10000,
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors[rarity],
        zIndex: 10000,
      });
    }, 150);
  }
};

/**
 * Trigger a simple celebration for small achievements
 */
export const celebrateSmallWin = () => {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#5B7DB1', '#6B4C9A', '#E5DFF0'],
    zIndex: 10000,
  });
};
