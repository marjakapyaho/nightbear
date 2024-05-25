// https://vitejs.dev/config/
export default {
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
}
