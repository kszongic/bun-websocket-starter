import { expect, test } from "bun:test";

test("server starts and serves HTML", async () => {
  // Import to start server
  const proc = Bun.spawn(["bun", "run", "src/index.ts"], {
    cwd: import.meta.dir + "/../..",
    env: { ...process.env, PORT: "4567" },
    stdout: "pipe",
  });

  // Wait for startup
  await Bun.sleep(500);

  try {
    const res = await fetch("http://localhost:4567/");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Bun WS Chat");

    const health = await fetch("http://localhost:4567/health");
    const json = await health.json();
    expect(json.status).toBe("ok");
  } finally {
    proc.kill();
  }
});
