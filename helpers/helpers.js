import path from "path";
import fs from "fs/promises";
import Jimp from "jimp";

const avatarsDir = path.join(process.cwd(), "public/avatars");

export const removeTempFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error("Failed to remove temp file:", err);
  }
};

const clearUserOldAvatar = async (userId) => {
  try {
    const avatars = await fs.readdir(avatarsDir);
    const userAvatar = avatars.find(
      (avatar) => path.parse(avatar).name === String(userId)
    );
    if (userAvatar) {
      await fs.unlink(path.join(avatarsDir, userAvatar));
    }
  } catch (err) {
    console.error("Failed to clear old avatar:", err);
  }
};

export const transformAvatar = async (filePath, userId) => {
  const ext = path.extname(filePath);
  const tempAvatarName = `${userId}-temp${ext}`;
  const finalAvatarName = `${userId}${ext}`;
  const tempAvatarPath = path.join(avatarsDir, tempAvatarName);
  const finalAvatarPath = path.join(avatarsDir, finalAvatarName);

  try {
    const image = await Jimp.read(filePath);

    await image.rotate(360).cover(250, 250).writeAsync(tempAvatarPath);
    await clearUserOldAvatar(userId);
    await fs.rename(tempAvatarPath, finalAvatarPath);
    await removeTempFile(filePath);

    return `/avatars/${finalAvatarName}`;
  } catch (err) {
    console.error("Avatar transformation error:", err);
    throw err;
  }
};
