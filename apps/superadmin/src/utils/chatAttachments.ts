const CHAT_ATTACHMENT_BUCKET = "chat-attachments";
const CHAT_ATTACHMENT_SIGNED_URL_TTL_SECONDS = 60 * 60;

const IMAGE_FILE_RE = /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)$/i;
const AUDIO_FILE_RE = /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac)$/i;

type UnknownRecord = Record<string, unknown>;

type SignedUrlResult = {
  data?: {
    signedUrl?: string | null;
  } | null;
  error?: unknown;
};

type StorageClient = {
  from: (bucket: string) => {
    createSignedUrl: (path: string, expiresIn: number) => Promise<SignedUrlResult>;
  };
};

export type NormalizedChatAttachment = {
  type: string;
  path: string | null;
  fileName: string;
  filename: string;
  fileSize: number | null;
  size: number | null;
  mimeType: string | null;
  url: string | null;
  name: string;
};

export type StoredChatAttachment = {
  type: string;
  path: string | null;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
};

const asRecord = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
};

const readString = (record: UnknownRecord | null, keys: string[]) => {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const readNumber = (record: UnknownRecord | null, keys: string[]) => {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

const extractPathFromUrl = (url: string | null) => {
  if (!url) {
    return null;
  }

  const marker = "/chat-attachments/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return url;
  }

  const pathWithQuery = url.slice(markerIndex + marker.length);
  const [pathWithoutQuery] = pathWithQuery.split("?");
  return pathWithoutQuery || null;
};

export const inferChatAttachmentType = (attachment: unknown, fallbackType = "document") => {
  const record = asRecord(attachment);
  const rawType = readString(record, ["type"]);
  const mimeType = (readString(record, ["mimeType", "mime_type"]) || "").toLowerCase();
  const fileName = (
    readString(record, ["fileName", "name", "filename", "path"]) || ""
  ).toLowerCase();

  if (rawType && rawType !== "file") {
    const normalizedType = rawType.toLowerCase();
    if (normalizedType === "image" || normalizedType === "audio" || normalizedType === "document") {
      return normalizedType;
    }
  }

  if (mimeType.startsWith("image/") || IMAGE_FILE_RE.test(fileName)) {
    return "image";
  }

  if (mimeType.startsWith("audio/") || AUDIO_FILE_RE.test(fileName)) {
    return "audio";
  }

  return fallbackType;
};

export const normalizeChatAttachment = (
  attachment: unknown,
  fallbackType = "document"
): NormalizedChatAttachment | null => {
  const record = asRecord(attachment);
  if (!record) {
    return null;
  }

  const url = readString(record, ["url"]);
  const path = readString(record, ["path"]) || extractPathFromUrl(url);
  const fileName =
    readString(record, ["fileName", "name", "filename"]) || (path ? path.split("/").pop() || "Attachment" : "Attachment");
  const fileSize = readNumber(record, ["fileSize", "size"]);
  const mimeType = readString(record, ["mimeType", "mime_type"]);
  const type = inferChatAttachmentType(record, fallbackType);

  return {
    type,
    path: path || null,
    fileName,
    filename: fileName,
    fileSize,
    size: fileSize,
    mimeType,
    url,
    name: fileName,
  };
};

export const buildStoredChatAttachment = (
  attachment: unknown,
  fallbackType = "document"
): StoredChatAttachment | null => {
  const normalizedAttachment = normalizeChatAttachment(attachment, fallbackType);
  if (!normalizedAttachment) {
    return null;
  }

  return {
    type: normalizedAttachment.type,
    path: normalizedAttachment.path,
    fileName: normalizedAttachment.fileName,
    fileSize: normalizedAttachment.fileSize,
    mimeType: normalizedAttachment.mimeType,
  };
};

export const resolveSignedChatAttachment = async (
  storageClient: StorageClient,
  attachment: unknown,
  fallbackType = "document"
): Promise<NormalizedChatAttachment | null> => {
  const normalizedAttachment = normalizeChatAttachment(attachment, fallbackType);
  if (!normalizedAttachment) {
    return null;
  }

  if (!normalizedAttachment.path) {
    return normalizedAttachment;
  }

  const { data, error } = await storageClient
    .from(CHAT_ATTACHMENT_BUCKET)
    .createSignedUrl(normalizedAttachment.path, CHAT_ATTACHMENT_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return normalizedAttachment;
  }

  return {
    ...normalizedAttachment,
    url: data.signedUrl,
  };
};

export const hydrateMessageChatAttachment = async <T extends { message_type?: string | null; attachments?: unknown }>(
  storageClient: StorageClient,
  message: T
): Promise<T> => {
  if (!message || message.message_type !== "file" || !message.attachments) {
    return message;
  }

  const attachment = await resolveSignedChatAttachment(storageClient, message.attachments);
  if (!attachment) {
    return message;
  }

  return {
    ...message,
    attachments: attachment,
  };
};

export const hydrateChatAttachments = async <T extends { message_type?: string | null; attachments?: unknown }>(
  storageClient: StorageClient,
  messages: T[] = []
): Promise<T[]> => Promise.all(messages.map((message) => hydrateMessageChatAttachment(storageClient, message)));
