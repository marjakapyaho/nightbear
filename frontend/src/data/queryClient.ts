import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: 'always',
      refetchOnWindowFocus: 'always',
      refetchOnMount: 'always',
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
})

export { queryClient }
