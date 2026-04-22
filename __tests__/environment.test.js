const { getEnvironmentMode } = require("../src/utils/environment");

describe("Environment Utils", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test("should get mode from resolved config", () => {
    const mockConfig = {
      mode: "production"
    };
    const result = getEnvironmentMode(mockConfig);
    expect(result).toBe("production");
  });

  test("should default to development mode", () => {
    delete process.env.NODE_ENV;
    const mockConfig = {};
    const result = getEnvironmentMode(mockConfig);
    expect(result).toBe("development");
  });

  test("should use NODE_ENV when config has no mode", () => {
    process.env.NODE_ENV = "staging";
    const mockConfig = {};
    const result = getEnvironmentMode(mockConfig);
    expect(result).toBe("staging");
  });
});
