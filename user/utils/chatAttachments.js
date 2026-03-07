const CHAT_ATTACHMENT_BUCKET = 'chat-attachments';
const CHAT_ATTACHMENT_SIGNED_URL_TTL_SECONDS = 60 * 60;

const IMAGE_FILE_RE = /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)$/i;
const AUDIO_FILE_RE = /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac)$/i;

const extractPathFromUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) {
    return null;
  }

  const normalizedUrl = url.trim();
  const marker = '/chat-attachments/';
  const markerIndex = normalizedUrl.indexOf(marker);

  if (markerIndex === -1) {
    return normalizedUrl;
  }

  const pathWithQuery = normalizedUrl.slice(markerIndex + marker.length);
  const [pathWithoutQuery] = pathWithQuery.split('?');
  return pathWithoutQuery || null;
};

export const inferChatAttachmentType = (attachment = {}, fallbackType = 'document') => {
  const rawType =
    typeof attachment.type === 'string' && attachment.type !== 'file'
      ? attachment.type.toLowerCase()
      : '';
  const mimeType = typeof attachment.mimeType === 'string' ? attachment.mimeType.toLowerCase() : '';
  const fileName = String(
    attachment.fileName || attachment.name || attachment.filename || attachment.path || '',
  ).toLowerCase();

  if (rawType === 'image' || rawType === 'audio' || rawType === 'document') {
    return rawType;
  }

  if (mimeType.startsWith('image/') || IMAGE_FILE_RE.test(fileName)) {
    return 'image';
  }

  if (mimeType.startsWith('audio/') || AUDIO_FILE_RE.test(fileName)) {
    return 'audio';
  }

  return fallbackType;
};

export const normalizeChatAttachment = (attachment, fallbackType = 'document') => {
  if (!attachment || typeof attachment !== 'object' || Array.isArray(attachment)) {
    return null;
  }

  const path = attachment.path || extractPathFromUrl(attachment.url);
  const fileName =
    attachment.fileName || attachment.name || attachment.filename || (path ? path.split('/').pop() : 'Attachment');
  const fileSizeValue = attachment.fileSize ?? attachment.size ?? null;
  const numericFileSize =
    typeof fileSizeValue === 'number' ? fileSizeValue : Number.parseInt(fileSizeValue || '', 10);
  const fileSize = Number.isFinite(numericFileSize) ? numericFileSize : null;
  const mimeType =
    typeof attachment.mimeType === 'string'
      ? attachment.mimeType
      : typeof attachment.mime_type === 'string'
        ? attachment.mime_type
        : null;
  const type = inferChatAttachmentType(attachment, fallbackType);

  return {
    type,
    path: path || null,
    fileName: fileName || 'Attachment',
    filename: fileName || 'Attachment',
    fileSize,
    size: fileSize,
    mimeType,
    url: typeof attachment.url === 'string' ? attachment.url : null,
    name: fileName || 'Attachment',
  };
};

export const buildStoredChatAttachment = (attachment, fallbackType = 'document') => {
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
  storageClient,
  attachment,
  fallbackType = 'document',
) => {
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

export const hydrateMessageChatAttachment = async (storageClient, message) => {
  if (!message || message.message_type !== 'file' || !message.attachments) {
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

export const hydrateChatAttachments = async (storageClient, messages = []) =>
  Promise.all(messages.map((message) => hydrateMessageChatAttachment(storageClient, message)));
