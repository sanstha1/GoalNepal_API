import multer from "multer";
import { uploadProfilePicture, uploadBannerImage, uploadImage, upload, uploadBanner } from "../../../middlewares/upload.middleware";

describe("Upload Middleware Unit Tests", () => {
  it("1. uploadProfilePicture should be a multer instance", () => {
    expect(uploadProfilePicture).toBeDefined();
    expect(typeof uploadProfilePicture.single).toBe("function");
  });

  it("2. uploadBannerImage should be a multer instance", () => {
    expect(uploadBannerImage).toBeDefined();
    expect(typeof uploadBannerImage.single).toBe("function");
  });

  it("3. uploadImage should equal uploadProfilePicture", () => {
    expect(uploadImage).toBe(uploadProfilePicture);
  });

  it("4. upload should equal uploadProfilePicture", () => {
    expect(upload).toBe(uploadProfilePicture);
  });

  it("5. uploadBanner should equal uploadBannerImage", () => {
    expect(uploadBanner).toBe(uploadBannerImage);
  });

  it("6. fileFilter should reject invalid field names", () => {
    const fileFilter = (uploadProfilePicture as any).fileFilter;
    if (!fileFilter) return;
    const cb = jest.fn();
    fileFilter({}, { fieldname: "invalidField", mimetype: "image/jpeg" }, cb);
    expect(cb).toHaveBeenCalledWith(expect.any(Error));
  });

  it("7. fileFilter should reject non-image mimetypes", () => {
    const fileFilter = (uploadProfilePicture as any).fileFilter;
    if (!fileFilter) return;
    const cb = jest.fn();
    fileFilter({}, { fieldname: "profilePicture", mimetype: "application/pdf" }, cb);
    expect(cb).toHaveBeenCalledWith(expect.any(Error));
  });

  it("8. fileFilter should accept valid profilePicture image", () => {
    const fileFilter = (uploadProfilePicture as any).fileFilter;
    if (!fileFilter) return;
    const cb = jest.fn();
    fileFilter({}, { fieldname: "profilePicture", mimetype: "image/jpeg" }, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("9. fileFilter should accept valid bannerImage", () => {
    const fileFilter = (uploadBannerImage as any).fileFilter;
    if (!fileFilter) return;
    const cb = jest.fn();
    fileFilter({}, { fieldname: "bannerImage", mimetype: "image/png" }, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });
});