import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(() => "token"),
  },
}));
jest.unstable_mockModule("../models/users.js", () => ({
  User: {
    findOne: jest.fn(() =>
      Promise.resolve({
        _id: "123",
        email: "test123@example.com",
        subscription: "starter",
        validatePassword: async () => true,
        save: async () => {},
      })
    ),
  },
  updateUserSubscription: jest.fn(),
}));

let logIn;

describe("logIn users controller", () => {
  beforeAll(async () => {
    ({ logIn } = await import("./users.js"));
  });

  test("should return 200, token and user object with email and subscription", async () => {
    const req = { body: { email: "test123@example.com", password: "test123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await logIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        token: "token",
        user: { email: "test123@example.com", subscription: "starter" },
      },
    });
  });
});
