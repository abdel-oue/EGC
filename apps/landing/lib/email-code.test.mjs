import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { codeSlot, registrationCode } from "./email-code.js";

test("codes are the first 32 HMAC bits mod 1e6, as in public.registration_code()", async () => {
  const message = "sami@esisa.ac.ma:7d3c1f0e-0000-4000-8000-000000000000:2945000";
  const expected = String(createHmac("sha256", "secret").update(message).digest().readUInt32BE(0) % 1000000).padStart(6, "0");
  assert.equal(await registrationCode("secret", "sami@esisa.ac.ma", "7d3c1f0e-0000-4000-8000-000000000000", 2945000), expected);
  assert.equal(codeSlot(600000 * 5 + 599999), 5);
});
