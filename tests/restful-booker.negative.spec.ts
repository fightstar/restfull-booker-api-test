import { test, expect } from "@playwright/test";

const baseURL = "https://restful-booker.herokuapp.com";

function bookingPayload(overrides: Partial<any> = {}) {
  return {
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: "2018-01-01", checkout: "2019-01-01" },
    additionalneeds: "Breakfast",
    ...overrides,
  };
}

test.describe("Restful-Booker - negative quality gate", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${baseURL}/auth`, {
      data: { username: "admin", password: "password123" },
    });

    const text = await res.text();
    expect(res.status(), `Auth status/body:\n${res.status()}\n${text}`).toBe(200);

    const json = JSON.parse(text);
    expect(json.token, `Auth response missing token:\n${text}`).toBeTruthy();
    token = json.token;
  });

  test("1) Invalid JSON on create -> must be 4xx (not 5xx)", async ({ request }) => {
    const res = await request.post(`${baseURL}/booking`, {
      headers: { "Content-Type": "application/json" },
      data: "{ broken" as any,
    });

    const text = await res.text();

    expect(
      res.status(),
      `Actual status/body:\n${res.status()}\n${text}`
    ).toBeGreaterThanOrEqual(400);

    expect(
      res.status(),
      `Actual status/body:\n${res.status()}\n${text}`
    ).toBeLessThan(500);

    expect(text.toLowerCase(), `Body looks like HTML/stacktrace:\n${text}`).not.toContain("<html");
  });

  test("2) Missing required field (bookingdates) -> must be 4xx (not 5xx, not success)", async ({ request }) => {
    const res = await request.post(`${baseURL}/booking`, {
      data: {
        firstname: "Neg",
        lastname: "NoDates",
        totalprice: 123,
        depositpaid: true,
        additionalneeds: "Breakfast",
      },
    });

    const text = await res.text();

    expect(
      res.status(),
      `Missing bookingdates MUST NOT succeed or 5xx.\nActual:\n${res.status()}\n${text}`
    ).toBeGreaterThanOrEqual(400);

    expect(
      res.status(),
      `Missing bookingdates MUST NOT be 5xx.\nActual:\n${res.status()}\n${text}`
    ).toBeLessThan(500);
  });

  test("3) Wrong type depositpaid='true' -> must be rejected (4xx)", async ({ request }) => {
    const res = await request.post(`${baseURL}/booking`, {
      data: bookingPayload({ depositpaid: "true" }),
    });

    const text = await res.text();

    expect(
      res.status(),
      `Wrong type for depositpaid MUST be rejected.\nActual:\n${res.status()}\n${text}`
    ).toBeGreaterThanOrEqual(400);

    expect(
      res.status(),
      `Wrong type for depositpaid MUST be 4xx, not 5xx.\nActual:\n${res.status()}\n${text}`
    ).toBeLessThan(500);
  });

  test("4) Invalid dates (checkout < checkin) -> must be rejected (4xx)", async ({ request }) => {
    const res = await request.post(`${baseURL}/booking`, {
      data: bookingPayload({
        bookingdates: { checkin: "2026-01-20", checkout: "2026-01-10" },
      }),
    });

    const text = await res.text();

    expect(
      res.status(),
      `Invalid dates MUST be rejected.\nActual:\n${res.status()}\n${text}`
    ).toBeGreaterThanOrEqual(400);

    expect(
      res.status(),
      `Invalid dates MUST be 4xx, not 5xx.\nActual:\n${res.status()}\n${text}`
    ).toBeLessThan(500);
  });

  test("5) Unauthorized update -> must be 401/403", async ({ request }) => {
    const create = await request.post(`${baseURL}/booking`, { data: bookingPayload() });
    const createText = await create.text();

    expect(create.status(), `Setup create failed:\n${create.status()}\n${createText}`).toBe(200);

    const created = JSON.parse(createText);
    const id = created.bookingid;
    expect(id, `No bookingid in create response:\n${createText}`).toBeTruthy();

    const res = await request.put(`${baseURL}/booking/${id}`, {
      headers: { "Content-Type": "application/json" },
      data: bookingPayload({ firstname: "Hacker" }),
    });

    const text = await res.text();

    expect(
      [401, 403],
      `Unauthorized update MUST be 401/403.\nActual:\n${res.status()}\n${text}`
    ).toContain(res.status());
  });

  test("5b) Authorized update sanity -> should be 200", async ({ request }) => {
    const create = await request.post(`${baseURL}/booking`, { data: bookingPayload() });
    const createText = await create.text();
    expect(create.status(), `Setup create failed:\n${create.status()}\n${createText}`).toBe(200);

    const created = JSON.parse(createText);
    const id = created.bookingid;

    const res = await request.put(`${baseURL}/booking/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      data: bookingPayload({ firstname: "Updated" }),
    });

    const text = await res.text();
    expect(res.status(), `Authorized update expected 200.\nActual:\n${res.status()}\n${text}`).toBe(200);
  });
});
