export default () => {
  return {
    files: ['**/*.test.ts', '!package/**/*'],
    ignoreChanges: {
      watchMode: ['tmp/**/*'],
    },
    extensions: ['ts'],
    nodeArguments: ['--import=tsx'],
  }
}
