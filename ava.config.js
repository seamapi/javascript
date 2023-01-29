export default () => {
  return {
    ignoredByWatcher: ['tmp/**/*'],
    files: ['**/*.test.ts', '!package/**/*'],
    environmentVariables: {
      // UPSTREAM: https://nodejs.org/docs/latest-v18.x/api/esm.html#loaders
      NODE_NO_WARNINGS: '1'
    },
    extensions: {
      ts: 'module'
    },
    nodeArguments: ['--loader=tsx']
  }
}
