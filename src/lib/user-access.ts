/** User may use app routes after onboarding with a non-empty display name. */
export function canAccessApp(state: {
  hasOnboarded: boolean
  displayName: string
}): boolean {
  return state.hasOnboarded && state.displayName.trim().length > 0
}
