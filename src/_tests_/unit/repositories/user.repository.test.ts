import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";
import mongoose from "mongoose";

describe("User Repository Integrated Tests", () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new UserRepository();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
  });

  const baseUser = {
    fullName: "Test User",
    email: "test@example.com",
    password: "Password123!",
  };

  test("1. Create a new user", async () => {
    const user = await userRepository.createUser(baseUser);
    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.role).toBe("user");
  });

  test("2. Get user by email after creation", async () => {
    await userRepository.createUser(baseUser);
    const user = await userRepository.getUserByEmail(baseUser.email);
    expect(user).not.toBeNull();
    expect(user?.email).toBe(baseUser.email);
  });

  test("3. Get user by fullName after creation", async () => {
    await userRepository.createUser(baseUser);
    const user = await userRepository.getUserByFullName(baseUser.fullName);
    expect(user).not.toBeNull();
    expect(user?.fullName).toBe(baseUser.fullName);
  });

  test("4. Get user by id after creation", async () => {
    const created = await userRepository.createUser(baseUser);
    const user = await userRepository.getUserById(created._id.toString());
    expect(user).not.toBeNull();
    expect(user?._id.toString()).toBe(created._id.toString());
  });

  test("5. Update user details", async () => {
    const user = await userRepository.createUser(baseUser);
    const updated = await userRepository.updateUser(user._id.toString(), {
      fullName: "Updated User",
      role: "admin",
    });
    expect(updated?.fullName).toBe("Updated User");
    expect(updated?.role).toBe("admin");
  });

  test("6. Update non-existing user returns null", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await userRepository.updateUser(fakeId, { fullName: "X" });
    expect(result).toBeNull();
  });

  test("7. Delete user by id", async () => {
    const user = await userRepository.createUser(baseUser);
    const result = await userRepository.deleteUser(user._id.toString());
    expect(result).toBe(true);
  });

  test("8. Delete non-existing user returns false", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await userRepository.deleteUser(fakeId);
    expect(result).toBe(false);
  });

  test("9. Get all users without pagination", async () => {
    await userRepository.createUser(baseUser);
    await userRepository.createUser({ ...baseUser, email: "u2@example.com" });
    const result = await userRepository.getAllUsers();
    expect(result.users.length).toBe(2);
    expect(result.total).toBe(2);
  });

  test("10. Get all users with pagination", async () => {
    await userRepository.createUser(baseUser);
    await userRepository.createUser({ ...baseUser, email: "u2@example.com" });
    const result = await userRepository.getAllUsers(1, 1);
    expect(result.users.length).toBe(1);
    expect(result.total).toBe(2);
  });

  test("11. Search users by fullName", async () => {
    await userRepository.createUser({ ...baseUser, fullName: "Alice Smith" });
    await userRepository.createUser({ ...baseUser, email: "b@example.com", fullName: "Bob Jones" });
    const result = await userRepository.getAllUsers(1, 10, "Alice");
    expect(result.users.length).toBe(1);
    expect(result.users[0].fullName).toContain("Alice");
  });

  test("12. Search users by email", async () => {
    await userRepository.createUser({ ...baseUser, email: "alice@example.com" });
    await userRepository.createUser({ ...baseUser, email: "bob@example.com", fullName: "Bob Jones" });
    const result = await userRepository.getAllUsers(1, 10, "alice");
    expect(result.users.length).toBe(1);
    expect(result.users[0].email).toContain("alice");
  });

  test("13. Search with no matches returns empty array", async () => {
    await userRepository.createUser(baseUser);
    const result = await userRepository.getAllUsers(1, 10, "NonExistent");
    expect(result.users.length).toBe(0);
  });

  test("14. Pagination page exceeds total pages returns empty array", async () => {
    await userRepository.createUser(baseUser);
    const result = await userRepository.getAllUsers(10, 5);
    expect(result.users.length).toBe(0);
  });

  test("15. Update user with empty object keeps fields unchanged", async () => {
    const user = await userRepository.createUser(baseUser);
    const updated = await userRepository.updateUser(user._id.toString(), {});
    expect(updated?._id.toString()).toBe(user._id.toString());
    expect(updated?.fullName).toBe(user.fullName);
  });

  test("16. Create multiple users with same fullName different emails", async () => {
    await userRepository.createUser(baseUser);
    await userRepository.createUser({ ...baseUser, email: "u2@example.com" });
    const result = await userRepository.getAllUsers(1, 10, "Test User");
    expect(result.users.length).toBe(2);
  });

  test("17. Verify role defaults to 'user'", async () => {
    const user = await userRepository.createUser(baseUser);
    expect(user.role).toBe("user");
  });

  test("18. Create user with custom role", async () => {
    const user = await userRepository.createUser({ ...baseUser, email: "u3@example.com", role: "admin" });
    expect(user.role).toBe("admin");
  });

  test("19. Create + update + get by id workflow", async () => {
    const user = await userRepository.createUser(baseUser);
    await userRepository.updateUser(user._id.toString(), { fullName: "Updated Workflow" });
    const fetched = await userRepository.getUserById(user._id.toString());
    expect(fetched?.fullName).toBe("Updated Workflow");
  });

  test("20. Create multiple users, delete one, check total", async () => {
    const u1 = await userRepository.createUser(baseUser);
    await userRepository.createUser({ ...baseUser, email: "u2@example.com" });
    await userRepository.deleteUser(u1._id.toString());
    const result = await userRepository.getAllUsers();
    expect(result.total).toBe(1);
  });

  test("21. Search + update + search workflow", async () => {
    const user = await userRepository.createUser({ ...baseUser, fullName: "Temp User" });
    await userRepository.updateUser(user._id.toString(), { fullName: "Updated User" });
    const result = await userRepository.getAllUsers(1, 10, "Updated");
    expect(result.users.length).toBe(1);
    expect(result.users[0].fullName).toBe("Updated User");
  });

  test("22. Create users + pagination slices", async () => {
    for (let i = 1; i <= 5; i++) {
      await userRepository.createUser({ ...baseUser, email: `user${i}@example.com` });
    }
    const result = await userRepository.getAllUsers(2, 2);
    expect(result.users.length).toBe(2);
  });

  test("23. Search special characters handled", async () => {
    await userRepository.createUser({ ...baseUser, email: "user+1@example.com" });
    const result = await userRepository.getAllUsers(1, 10, "user+1");
    expect(result.users.length).toBe(1);
  });

  test("24. Delete all users", async () => {
    const u1 = await userRepository.createUser(baseUser);
    const u2 = await userRepository.createUser({ ...baseUser, email: "u2@example.com" });
    await userRepository.deleteUser(u1._id.toString());
    await userRepository.deleteUser(u2._id.toString());
    const result = await userRepository.getAllUsers();
    expect(result.total).toBe(0);
  });

  test("25. Create users + search + pagination combined", async () => {
    await userRepository.createUser({ ...baseUser, fullName: "Santosh" });
    await userRepository.createUser({ ...baseUser, email: "s@example.com", fullName: "Santuu" });
    await userRepository.createUser({ ...baseUser, email: "matcha@example.com", fullName: "Matcha" });
    const result = await userRepository.getAllUsers(1, 2, "a");
    expect(result.users.length).toBe(2);
  });
});