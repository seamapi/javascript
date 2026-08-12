export default () => {
  return {
    files: ['**/*.test.ts', '!package/**/*'],
    watchMode: {
      ignoreChanges: ['tmp/**/*'],
    },
    extensions: ['ts'],
    nodeArguments: ['--import=tsx'],
    workerThreads: false,
  }
}
