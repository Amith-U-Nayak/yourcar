jest.mock("dotenv", () => ({
  config: jest.fn(() => ({ parsed: {} })),
}));

describe("Config defaults", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses sensible defaults when environment variables are omitted", async () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.DATABASE_URL;
    delete process.env.TEST_DATABASE_URL;

    const { config } = await import("../config");
    expect(config.nodeEnv).toBe("development");
    expect(config.port).toBe(3000);
    expect(config.jwtSecret).toBe("dev_secret_change_me");
    expect(config.jwtExpiresIn).toBe("7d");
    expect(config.databaseUrl).toBe("");
  });
});
