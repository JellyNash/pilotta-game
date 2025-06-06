import { Contract } from './types';
import { GAME_CONSTANTS } from './constants';

export function isValidBid(bid: number, currentHighest: number | null): boolean {
  const { MIN_BID, MAX_NORMAL_BID, INCREMENT, CAPOT } = GAME_CONSTANTS.BIDDING;
  if (bid === CAPOT) return true;
  if (bid < MIN_BID || bid > MAX_NORMAL_BID) return false;
  if (bid % INCREMENT !== 0) return false;
  if (currentHighest !== null && bid <= currentHighest) return false;
  return true;
}

export function getValidBids(currentHighest: number | null): number[] {
  const { MIN_BID, MAX_NORMAL_BID, INCREMENT, CAPOT } = GAME_CONSTANTS.BIDDING;
  const start = currentHighest ? currentHighest + INCREMENT : MIN_BID;
  const bids: number[] = [];
  for (let b = start; b <= MAX_NORMAL_BID; b += INCREMENT) {
    bids.push(b);
  }
  if (!bids.includes(CAPOT)) bids.push(CAPOT);
  return bids;
}

export function getMinimumBid(contract: Contract | null): number {
  const { MIN_BID, INCREMENT, CAPOT } = GAME_CONSTANTS.BIDDING;
  if (!contract) return MIN_BID;
  return Math.min(contract.value + INCREMENT, CAPOT);
}
