import {createClientMessageId} from "../src/utils/clientMessageId";

describe("client message IDs", () => {
  it("creates a non-empty retry key", () => {
    const id = createClientMessageId();
    expect(id).toEqual(expect.any(String));
    expect(id.length).toBeGreaterThan(8);
  });
});
