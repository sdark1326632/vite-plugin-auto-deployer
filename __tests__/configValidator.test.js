const { validateDeploymentConfig } = require("../src/validators/configValidator");

describe("Config Validator", () => {
  test("should validate valid config", async () => {
    const config = {
      mode: "production",
      host: "example.com",
      port: 22,
      username: "user",
      path: "/app/www" // Safe path
    };
    
    const result = await validateDeploymentConfig(config);
    expect(result).toBe(true);
  });

  test("should reject config without required fields", async () => {
    const config = {
      host: "example.com",
      username: "user"
    };
    
    const result = await validateDeploymentConfig(config);
    expect(result).toBe(false);
  });

  test("should reject config with invalid path", async () => {
    const config = {
      mode: "production",
      host: "example.com",
      port: 22,
      username: "user",
      path: "/etc/passwd" // System path
    };
    
    const result = await validateDeploymentConfig(config);
    expect(result).toBe(false);
  });
});
