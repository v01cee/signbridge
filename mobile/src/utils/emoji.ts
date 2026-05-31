const HAND_EMOJIS = ['🤟', '✋', '👋', '🤙', '👌', '✌️', '🤞', '🖐️'];
export const getEmoji = (id: number): string =>
  HAND_EMOJIS[Math.abs(id) % HAND_EMOJIS.length];

const GRADIENTS: Array<[string, string]> = [
  ['#1e1b4b', '#312e81'],
  ['#1a2e1e', '#1a4731'],
  ['#2d1b1b', '#5c2626'],
  ['#1b2535', '#1e3a5f'],
  ['#2b1d35', '#4c2a6e'],
];
export const getGradient = (id: number): [string, string] =>
  GRADIENTS[Math.abs(id) % GRADIENTS.length];
