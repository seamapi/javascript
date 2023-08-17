import test from "ava"
import { getLondonTestFixture } from "../fixtures/get-london-test-fixture"

test("connected account ids filter should return no devices if no accounts are specified", async (t) => {
  const { seam } = await getLondonTestFixture(t)

  console.log("goint to list devices")
  const no_devices = await seam.devices.list({
    connected_account_ids: [],
  })

  t.is(no_devices.length, 0)
})
