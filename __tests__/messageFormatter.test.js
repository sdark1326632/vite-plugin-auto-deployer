const { formatMessage } = require("../src/utils/messageFormatter");

describe("Message Formatter", () => {
  test("should format simple message", () => {
    const result = formatMessage("CONFIG_ERROR");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("should format message with parameters", () => {
    const result = formatMessage("NO_MATCHING_CONFIG", { mode: "test" });
    expect(result).toContain("test");
  });

  test("should handle unknown message keys", () => {
    const result = formatMessage("UNKNOWN_KEY");
    expect(result).toBe("UNKNOWN_KEY");
  });

  test("should return bilingual messages", () => {
    const result = formatMessage("CONFIG_ERROR");
    expect(result).toContain("配置错误");
    expect(result).toContain("Configuration Error");
  });
});
