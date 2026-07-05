/**
 * Milestone detection engine.
 * Checks whether recording a payment crossed a meaningful debt-payoff threshold.
 */

export type MilestoneKey =
  | "10_PERCENT"
  | "25_PERCENT"
  | "50_PERCENT"
  | "75_PERCENT"
  | "90_PERCENT"
  | "PAID_OFF";

export interface Milestone {
  key: MilestoneKey;
  label: string;
  emoji: string;
  color: string;
  message: string;
}

const MILESTONES: Array<{ threshold: number; milestone: Milestone }> = [
  {
    threshold: 10,
    milestone: {
      key: "10_PERCENT",
      label: "10% Paid Off",
      emoji: "🚀",
      color: "emerald",
      message: "Great start! You've paid off 10% of your loan. Keep going!",
    },
  },
  {
    threshold: 25,
    milestone: {
      key: "25_PERCENT",
      label: "Quarter Done!",
      emoji: "🎯",
      color: "emerald",
      message: "One quarter down! You're on the right track to financial freedom.",
    },
  },
  {
    threshold: 50,
    milestone: {
      key: "50_PERCENT",
      label: "Halfway There!",
      emoji: "⚡",
      color: "amber",
      message: "Incredible! You're halfway through. The finish line is closer than ever.",
    },
  },
  {
    threshold: 75,
    milestone: {
      key: "75_PERCENT",
      label: "75% Done!",
      emoji: "🔥",
      color: "amber",
      message: "Just 25% to go! You're crushing it.",
    },
  },
  {
    threshold: 90,
    milestone: {
      key: "90_PERCENT",
      label: "Almost There!",
      emoji: "🏁",
      color: "emerald",
      message: "Only 10% left! The finish line is in sight.",
    },
  },
  {
    threshold: 100,
    milestone: {
      key: "PAID_OFF",
      label: "Debt Free! 🎉",
      emoji: "🎊",
      color: "emerald",
      message: "YOU DID IT! This loan is completely paid off. Congratulations!",
    },
  },
];

/**
 * Returns a milestone if the payment crossed a threshold, otherwise null.
 *
 * @param previousBalance - Outstanding balance before payment
 * @param newBalance      - Outstanding balance after payment
 * @param principal       - Original loan principal
 */
export function checkMilestone(
  previousBalance: number,
  newBalance: number,
  principal: number
): Milestone | null {
  if (principal <= 0) return null;

  const previousPaidPct = ((principal - previousBalance) / principal) * 100;
  const newPaidPct = ((principal - newBalance) / principal) * 100;

  // Walk milestones from highest to lowest so we return the most significant one
  for (const { threshold, milestone } of [...MILESTONES].reverse()) {
    if (newPaidPct >= threshold && previousPaidPct < threshold) {
      return milestone;
    }
  }

  return null;
}
