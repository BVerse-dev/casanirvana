import { supabase } from "./supabase";

const DIRECTORY_AVATAR_BUCKET = "attachments";
const REMOTE_URI_PATTERN = /^(https?:\/\/|data:image\/)/i;
const LOCAL_URI_PATTERN = /^(file:\/\/|content:\/\/|blob:)/i;

const MIME_EXTENSION_MAP = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

const normalizeAvatarUri = (value) => {
  if (!value) return null;

  if (typeof value === "object" && value?.uri) {
    return normalizeAvatarUri(value.uri);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  return null;
};

const resolveExtension = ({ imageUri, mimeType }) => {
  if (mimeType && MIME_EXTENSION_MAP[mimeType]) {
    return MIME_EXTENSION_MAP[mimeType];
  }

  const extensionCandidate = imageUri?.split(".").pop() || "jpg";
  return extensionCandidate.split("?")[0].toLowerCase();
};

export const uploadDirectoryAvatarIfNeeded = async ({
  imageUri,
  ownerId,
  scope,
  existingAvatarUrl = null,
}) => {
  const normalizedAvatarUri = normalizeAvatarUri(imageUri);

  if (!normalizedAvatarUri) {
    return existingAvatarUrl || null;
  }

  if (REMOTE_URI_PATTERN.test(normalizedAvatarUri)) {
    return normalizedAvatarUri;
  }

  if (!LOCAL_URI_PATTERN.test(normalizedAvatarUri)) {
    return existingAvatarUrl || null;
  }

  if (!ownerId) {
    throw new Error("Owner id is required for directory avatar upload.");
  }

  if (!scope) {
    throw new Error("Upload scope is required for directory avatar upload.");
  }

  const response = await fetch(normalizedAvatarUri);
  if (!response.ok) {
    throw new Error("Unable to read selected avatar image.");
  }

  const imageBlob = await response.blob();
  const extension = resolveExtension({
    imageUri: normalizedAvatarUri,
    mimeType: imageBlob.type,
  });
  const filePath = `directory-avatars/${scope}/${ownerId}/${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from(DIRECTORY_AVATAR_BUCKET)
    .upload(filePath, imageBlob, {
      contentType: imageBlob.type || `image/${extension}`,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(DIRECTORY_AVATAR_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData?.publicUrl || null;
};
