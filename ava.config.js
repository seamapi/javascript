export default () => {
  return {
    ignoredByWatcher: ['tmp/**/*'],
    files: ['**/*.test.ts', '!package/**/*'],
    extensions: {
      ts: 'commonjs'
    },
    nodeArguments: ['--import=tsx']
  }
}
