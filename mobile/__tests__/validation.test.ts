import {validateMessage, validateUsername} from "../src/utils/validation";

describe("validation", () => {
  it("accepts a trimmed username", () => expect(validateUsername(" Prem ")).toBeNull());
  it("rejects a short username", () => expect(validateUsername("A")).toMatch(/at least/));
  it("rejects blank messages", () => expect(validateMessage("  ")).toMatch(/blank/));
  it("accepts a normal message", () => expect(validateMessage("Hello")).toBeNull());
});
