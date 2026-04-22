const autoDeployer = require("../src/index");

describe("Vite Auto Deployer Plugin", () => {
  test("should export a function", () => {
    expect(typeof autoDeployer).toBe("function");
  });

  test("should return a plugin object", () => {
    const config = {
      mode: "production",
      host: "example.com",
      username: "user",
      path: "/var/www"
    };
    const plugin = autoDeployer(config);
    expect(plugin).toHaveProperty("name");
    expect(plugin.name).toBe("vite-plugin-auto-deployer");
  });
});
