const { isDangerousPath } = require("../src/utils/pathValidator");

describe("Path Validator", () => {
  test("should allow safe paths", () => {
    expect(isDangerousPath("/app/www")).toBe(false);
    expect(isDangerousPath("/data/myapp")).toBe(false);
    expect(isDangerousPath("/www/html")).toBe(false);
  });

  test("should reject dangerous system paths", () => {
    expect(isDangerousPath("/")).toBe(true);
    expect(isDangerousPath("/etc")).toBe(true);
    expect(isDangerousPath("/var/log")).toBe(true);
    expect(isDangerousPath("/home/*")).toBe(true);
    expect(isDangerousPath("/usr/*/config")).toBe(true);
    expect(isDangerousPath("/opt/system")).toBe(true); // /opt is considered system
  });

  test("should handle invalid inputs", () => {
    expect(isDangerousPath("")).toBe(true);
    expect(isDangerousPath(null)).toBe(true);
    expect(isDangerousPath(undefined)).toBe(true);
    expect(isDangerousPath(123)).toBe(true);
  });
});
