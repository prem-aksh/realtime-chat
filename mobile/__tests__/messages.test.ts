import {mergeMessages, formatTimestamp} from "../src/utils/messages";

describe("message utilities", () => {
  it("deduplicates by server id and sorts deterministically", () => {
    const messages = mergeMessages([
      {id: "2", username: "B", text: "later", createdAt: "2025-01-01T00:00:02.000Z"},
      {id: "1", username: "A", text: "first", createdAt: "2025-01-01T00:00:01.000Z"}
    ], [{id: "1", username: "A", text: "first", createdAt: "2025-01-01T00:00:01.000Z", status: "sent"}]);
    expect(messages).toHaveLength(2);
    expect(messages[0]?.id).toBe("1");
    expect(messages[0]?.status).toBe("sent");
  });

  it("formats a timestamp", () => expect(formatTimestamp("2025-01-01T12:30:00.000Z")).toMatch(/\d/));
});
