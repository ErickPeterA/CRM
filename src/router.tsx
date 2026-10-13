import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  // Keep the current view visible during navigation instead of flashing a
  // full-page loading screen on every menu click.
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadDelay: 40,
    defaultStaleTime: 30_000,
    defaultPreloadStaleTime: 60_000,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
