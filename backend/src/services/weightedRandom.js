/**
 * Weighted Random Prize Selection Service
 * Selects a prize based on configured weights.
 * Normalizes weights internally and excludes out-of-stock or inactive prizes.
 */
const selectWeightedPrize = (prizes) => {
  if (!prizes || prizes.length === 0) {
    throw new Error('No eligible active prizes available for spin selection.');
  }

  // Filter out prizes with 0 stock or inactive
  const availablePrizes = prizes.filter(p => p.is_active && p.stock_quantity > 0 && p.weight > 0);

  if (availablePrizes.length === 0) {
    throw new Error('All prizes are currently out of stock or inactive.');
  }

  // Calculate total sum of weights
  const totalWeight = availablePrizes.reduce((sum, p) => sum + Number(p.weight), 0);

  if (totalWeight <= 0) {
    throw new Error('Invalid total prize weight configured.');
  }

  // Generate random value between 0 and totalWeight
  const randomVal = Math.random() * totalWeight;

  let currentSum = 0;
  for (const prize of availablePrizes) {
    currentSum += Number(prize.weight);
    if (randomVal < currentSum) {
      return prize;
    }
  }

  // Fallback to last prize if float precision boundary
  return availablePrizes[availablePrizes.length - 1];
};

module.exports = {
  selectWeightedPrize
};
