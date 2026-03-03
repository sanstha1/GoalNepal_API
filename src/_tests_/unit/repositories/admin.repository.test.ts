import mongoose from "mongoose";
import { AdminRepository } from "../../../repositories/admin/admin.repository";
import { AdminModel } from "../../../models/admin/admin.model";

describe("Admin Repository Integration Tests", () => {
  let adminRepository: AdminRepository;

  beforeAll(() => {
    adminRepository = new AdminRepository();
  });

  beforeEach(async () => {
    await AdminModel.deleteMany({});
  });

  afterAll(async () => {
    await AdminModel.deleteMany({});
  });

  const baseAdmin = {
    fullName: "Admin User",
    email: "admin@test.com",
    password: "hashedpassword123",
    role: "admin" as const,
  };

  it("1. Should create a new admin", async () => {
    const admin = await adminRepository.createUser(baseAdmin);
    expect(admin._id).toBeDefined();
    expect(admin.email).toBe("admin@test.com");
    expect(admin.role).toBe("admin");
  });

  it("2. Should get admin by email", async () => {
    await adminRepository.createUser(baseAdmin);
    const found = await adminRepository.getUserbyEmail("admin@test.com");
    expect(found).not.toBeNull();
    expect(found?.email).toBe("admin@test.com");
  });

  it("3. Should return null for non-existing email", async () => {
    const found = await adminRepository.getUserbyEmail("notexist@test.com");
    expect(found).toBeNull();
  });

  it("4. Should get admin by ID", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    const found = await adminRepository.getUserById(created._id.toString());
    expect(found).not.toBeNull();
    expect(found?._id.toString()).toBe(created._id.toString());
  });

  it("5. Should return null for non-existing ID", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const found = await adminRepository.getUserById(fakeId);
    expect(found).toBeNull();
  });

  it("6. Should get all admins", async () => {
    await adminRepository.createUser(baseAdmin);
    await adminRepository.createUser({ ...baseAdmin, email: "admin2@test.com" });
    const admins = await adminRepository.getAllAdmins();
    expect(admins.length).toBe(2);
  });

  it("7. Should return empty array when no admins exist", async () => {
    const admins = await adminRepository.getAllAdmins();
    expect(admins.length).toBe(0);
  });

  it("8. Should update admin by ID", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    const updated = await adminRepository.updateOneAdmin(created._id.toString(), { fullName: "Updated Admin" });
    expect(updated?.fullName).toBe("Updated Admin");
  });

  it("9. Should return null when updating non-existing admin", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await adminRepository.updateOneAdmin(fakeId, { fullName: "X" });
    expect(result).toBeNull();
  });

  it("10. Should delete admin by ID", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    const result = await adminRepository.deleteOneAdmin(created._id.toString());
    expect(result).toBe(true);
    const found = await adminRepository.getUserById(created._id.toString());
    expect(found).toBeNull();
  });

  it("11. Should return null when deleting non-existing admin", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await adminRepository.deleteOneAdmin(fakeId);
    expect(result).toBeNull();
  });

  it("12. Create + update + get workflow", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    await adminRepository.updateOneAdmin(created._id.toString(), { fullName: "Workflow Admin" });
    const found = await adminRepository.getUserById(created._id.toString());
    expect(found?.fullName).toBe("Workflow Admin");
  });
});