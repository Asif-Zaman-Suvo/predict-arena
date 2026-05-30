/** Simulates async persistence (localStorage) for React 19 action patterns. */
export function simulatePersistDelay(ms = 16): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
