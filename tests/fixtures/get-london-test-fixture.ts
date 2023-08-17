import { Seam } from "../../src"
import { createFake } from "@seamapi/fake-seam-connect"
import type { ExecutionContext } from "ava"

/**
 * A london test fixture has everything you need to run a test against the Seam
 * API, it's the only import you should need in a test file besides ava.
 *
 * Usage:
 * ```ts
 * test("my test", async t => {
 *   const { seam, mutateEnv } = await getLondonTestFixture(t)
 *
 *   await mutateEnv({ mutation_type: "EMPTY_WORKSPACE" })
 *
 *   t.deepEqual(await seam.devices.list(), [])
 * })
 * ```
 *
 * If you need to modify the test environment, use fixture.mutateEnv(), which
 * is a predictable set of mutations.
 */
export const getLondonTestFixture = async (t: ExecutionContext) => {
  const fake = await createFake()

  const { serverUrl } = await fake.startServer()

  const seam = new Seam({
    apiKey: "1234",
    endpoint: serverUrl,
  })

  // TODO move to separate file if it complex
  function mutateEnv() {}

  return {
    seam,
    mutateEnv,
  }
}
