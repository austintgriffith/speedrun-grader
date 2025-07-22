/**
 * Mock function to fetch price from Uniswap
 * Returns a fixed price of 3000 with 18 decimals
 */
export async function fetchPriceFromUniswap(): Promise<bigint> {
  return 3000n * 10n ** 18n;
}
