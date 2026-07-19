import data from "@emoji-mart/data";
import EmojiPicker from "@emoji-mart/react";
import clsx from "clsx";

import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Offcanvas,
  OffcanvasHeader,
  Row,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useChatContext } from "@/context/useChatContext";
import { useLayoutContext } from "@/context/useLayoutContext";
import type { ChatMessageType, UserType } from "@/types/data";
import type { ChatUser } from "@/hooks/useProfiles";
import { getFileExtensionIcon } from "@/utils/get-icons";
import { useCreateMessage, useDeleteMessage, useListMessages } from "@/hooks/useMessages";
import { avatars } from "@/assets/images/users";
import TextFormInput from "@/components/from/TextFormInput";
import Image from "next/image";

const MessageDropdown = ({
  copyValue,
  canDelete,
  onDelete,
}: {
  copyValue?: string;
  canDelete?: boolean;
  onDelete?: () => void;
}) => {
  const handleCopy = async () => {
    if (!copyValue) return;

    try {
      await navigator.clipboard.writeText(copyValue);
      toast.success("Message copied.");
    } catch {
      toast.error("Could not copy the message.");
    }
  };

  if (!copyValue && !canDelete) {
    return null;
  }

  return (
    <Dropdown className="chat-conversation-actions">
      <DropdownToggle as={"a"} role="button" className="ps-1">
        <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-18" />
      </DropdownToggle>
      <DropdownMenu>
        {copyValue ? (
          <DropdownItem onClick={handleCopy}>
            <IconifyIcon icon="bx:copy" className="me-2" />
            Copy
          </DropdownItem>
        ) : null}
        {canDelete && onDelete ? (
          <DropdownItem onClick={onDelete}>
            <IconifyIcon icon="bx:trash" className="me-2" />
            Delete
          </DropdownItem>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
};

const UnavailableCallAction = ({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) => (
  <li className="list-inline-item fs-20 dropdown">
    <button
      type="button"
      className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
      onClick={() =>
        toast("Calls are not enabled in the admin messaging launch surface yet.", {
          icon: "i",
        })
      }
      title={title}
    >
      <span>
        <IconifyIcon icon={icon} />
      </span>
    </button>
  </li>
);

const VideoCall = () => (
  <UnavailableCallAction
    icon="solar:videocamera-record-bold-duotone"
    title="Video calling is not enabled in admin messaging yet"
  />
);

const VoiceCall = () => (
  <UnavailableCallAction
    icon="solar:outgoing-call-rounded-bold-duotone"
    title="Voice calling is not enabled in admin messaging yet"
  />
);

const ProfileDetail = ({ selectedUser }: { selectedUser: UserType }) => {
  const { chatProfile } = useChatContext();

  return (
    <>
      <li className="list-inline-item fs-20 dropdown">
        <div
          role="button"
          className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
          onClick={chatProfile.toggle}
        >
          <span>
            <IconifyIcon icon="solar:user-bold-duotone" />
          </span>
        </div>
      </li>

      <Offcanvas
        show={chatProfile.open}
        onHide={chatProfile.toggle}
        placement="end"
        className="shadow border-start"
        data-bs-scroll="true"
        tabIndex={-1}
      >
        <OffcanvasHeader closeButton>
          <h5 className="offcanvas-title text-truncate w-50">Profile</h5>
        </OffcanvasHeader>
        <SimplebarReactClient className="offcanvas-body p-0 h-100">
          <div className="p-3">
            <div className="text-center">
              <Image
                src={selectedUser.avatar}
                alt={selectedUser.name}
                width={80}
                height={80}
                className="img-thumbnail avatar-lg rounded-circle mb-1"
              />
              <h4>{selectedUser.name}</h4>
              <Button
                as="a"
                href={`mailto:${selectedUser.email}`}
                variant="primary"
                size="sm"
                className="mt-1"
              >
                <IconifyIcon icon="bi:envelope" className="me-1" />
                Send Email
              </Button>
              <p className="text-muted mt-2 fs-14 mb-0">
                Status:{" "}
                <strong
                  className={`text-${selectedUser.activityStatus === "offline" ? "danger" : "success"}`}
                >
                  {selectedUser.activityStatus}
                </strong>
              </p>
            </div>
            <div className="mt-4">
              <p className="mt-3 mb-1">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:phone-line" className="me-1" />
                  Phone Number:
                </strong>
              </p>
              <p>{selectedUser.contact || "Not provided"}</p>
              <p className="mt-3 mb-1">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:map-pin-line" className="me-1" />
                  Location:
                </strong>
              </p>
              <p>{selectedUser.location}</p>
              <p className="mt-3 mb-1">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:global-line" className="me-1" />
                  Languages:
                </strong>
              </p>
              <p>{selectedUser.languages.join(", ") || "English"}</p>
              <p className="mt-3 mb-1">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:message-2-line" className="me-1" />
                  Latest Message:
                </strong>
              </p>
              <p>{selectedUser.message || "No messages yet"}</p>
              <p className="mt-3 mb-1">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:time-line" className="me-1" />
                  Last Activity:
                </strong>
              </p>
              <p>{new Date(selectedUser.time || new Date(0)).toLocaleString()}</p>
              <p className="mt-3 mb-1">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:mail-unread-line" className="me-1" />
                  Unread From Contact:
                </strong>
              </p>
              <p>{(selectedUser as ChatUser).unreadCount || 0}</p>
            </div>
          </div>
        </SimplebarReactClient>
      </Offcanvas>
    </>
  );
};

// Helper functions for image handling
const isImageFile = (mimeType: string | undefined): boolean => {
  return mimeType ? mimeType.startsWith('image/') : false;
};

const UserMessage = ({
  message,
  toUser,
  onImageClick,
  onDelete,
}: {
  message: ChatMessageType;
  toUser: UserType;
  onImageClick: (imageUrl: string, imageName: string) => void;
  onDelete: (messageId: string) => void;
}) => {
  const copyValue =
    typeof message.message.value === "string" && message.message.value.trim().length > 0
      ? message.message.value
      : undefined;
  const sentByCurrentUser = message.from.id === toUser.id;

  return (
    <li
      className={clsx("clearfix gap-2 d-flex", {
        "justify-content-end odd": sentByCurrentUser,
      })}
    >
      {!sentByCurrentUser && (
        <div className="chat-avatar text-center">
          <Image
            src={message.from.avatar}
            alt="avatar"
            width={36}
            height={36}
            className="avatar rounded-circle"
          />
        </div>
      )}
      <div
        className={clsx("chat-conversation-text", {
          "ms-0": sentByCurrentUser,
        })}
      >
        {sentByCurrentUser ? (
          <p className="mb-2  text-end">
            {new Date(message.sentOn || new Date()).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}{" "}
            <span className={`text-dark fw-medium me-1 `}>
              {sentByCurrentUser ? "you" : message.from.name}
            </span>{" "}
          </p>
        ) : (
          <p className="mb-2">
            <span className={`text-dark fw-medium me-1 `}>
              {sentByCurrentUser ? "you" : message.from.name}
            </span>{" "}
            {new Date(message.sentOn || new Date()).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </p>
        )}
        <div
          className={clsx("d-flex", {
            "justify-content-end": sentByCurrentUser,
          })}
        >
          {sentByCurrentUser && (
            <MessageDropdown
              copyValue={copyValue}
              canDelete
              onDelete={() => onDelete(message.id)}
            />
          )}
          <div className="chat-ctext-wrap d-flex ">
            {/* Text messages */}
            {(message.message.type === "text" || !message.message.type) &&
              typeof message.message.value === "string" && (
                <p className="">{message.message.value}</p>
              )}

                        {/* File attachments from Supabase */}
            {message.message.type === "file" && (message as any).attachments && (
              <>
                {/* Image preview for image files - clean bubble style */}
                {isImageFile((message as any).attachments.mimeType) ? (
                  <Image
                    src={(message as any).attachments.url}
                    alt={(message as any).attachments.name}
                    width={250}
                    height={200}
                    className="img-fluid rounded cursor-pointer"
                    style={{ 
                      objectFit: 'cover',
                      maxWidth: '250px',
                      maxHeight: '200px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onImageClick((message as any).attachments.url, (message as any).attachments.name)}
                  />
                ) : (
                  /* Non-image file attachment with filename */
                  <div className="file-attachment">
                    {/* Show filename for non-image files */}
                    {typeof message.message.value === "string" && (
                      <p className="mb-2">{message.message.value}</p>
                    )}
                    <div className="d-flex align-items-center p-2 border rounded bg-light">
                      <div className="flex-shrink-0">
                        <IconifyIcon
                          icon={getFileExtensionIcon((message as any).attachments.name)}
                          className="fs-24 me-2 text-success"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <a 
                          href={(message as any).attachments.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-dark text-decoration-none"
                        >
                          <span className="fw-medium">{(message as any).attachments.name}</span>
                          <p className="mb-0 text-muted small">
                            {((message as any).attachments.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </a>
                      </div>
                      <div className="flex-shrink-0">
                        <a 
                          href={(message as any).attachments.url} 
                          download={(message as any).attachments.name}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <IconifyIcon icon="ri:download-line" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Video call messages - check content for video_call type */}
            {(message as any).content && (message as any).content.includes("Video call") && (
              <div className="video-call-message p-2 border rounded bg-primary bg-opacity-10">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="ri:video-on-line" className="fs-20 me-2 text-primary" />
                  <div>
                    {typeof message.message.value === "string" && (
                      <p className="mb-0 fw-medium">{message.message.value}</p>
                    )}
                    <small className="text-muted">
                      {(message as any).content}
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Legacy file format support */}
            {message.message.type === "file" &&
              typeof message.message.value === "object" &&
              Array.isArray(message.message.value) &&
              message.message.value.map((item, idx) => (
                <Fragment key={idx}>
                  {item.preview && (
                    <div role="button" key={idx}>
                      <Image
                        src={item.preview}
                        alt="attachment"
                        height={84}
                        width={121}
                        className="img-thumbnail me-1"
                      />
                    </div>
                  )}
                  {item.name && (
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="flex-shrink-0">
                        <IconifyIcon
                          icon={getFileExtensionIcon(item.name)}
                          className="fs-24 me-1 text-success"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <span role="button" className="text-dark">
                          {item.name}
                        </span>
                        <p className="mb-0">{item.size} MB</p>
                      </div>
                    </div>
                  )}
                </Fragment>
              ))}
          </div>
          {!sentByCurrentUser && (
            <MessageDropdown copyValue={copyValue} />
          )}
        </div>
      </div>
      {sentByCurrentUser && (
        <div className="chat-avatar text-center ms-2">
          <Image
            src={message.from.avatar}
            alt="avatar"
            width={36}
            height={36}
            className="avatar rounded-circle"
          />
        </div>
      )}
    </li>
  );
};

const ChatArea = ({ selectedUser, selectedUserId }: { selectedUser: ChatUser; selectedUserId: string | undefined }) => {
  const messageSchema = yup.object({
    newMessage: yup.string().required("Please enter message"),
  });

  const { reset, handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  });

  // Image viewer state
  const [imageViewer, setImageViewer] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
  }>({
    isOpen: false,
    imageUrl: '',
    imageName: ''
  });

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.name || "You";
  const currentUserEmail = session?.user?.email || "admin@casanirvana.com";
  const effectiveSelectedUserId =
    selectedUserId && selectedUserId !== currentUserId ? selectedUserId : undefined;

  // Use real messages from Supabase - only if selectedUserId is valid
  const { data: realMessages, isLoading } = useListMessages(
    currentUserId, 
    effectiveSelectedUserId
  );
  const createMessageMutation = useCreateMessage();
  const deleteMessageMutation = useDeleteMessage();

  const currentUser: UserType = {
    id: currentUserId || "current-user",
    mutualCount: 0,
    name: currentUserName,
    avatar: avatars.avatar10,
    email: currentUserEmail,
    message: "",
    time: new Date(),
    contact: "Not provided",
    emailMessage: "",
    location: "Admin Workspace",
    languages: ["English"],
    activityStatus: "online",
    status: "Active",
  };

  // Transform Supabase messages to ChatMessageType format for UI compatibility
  const userMessages: (ChatMessageType & { attachments?: any; content?: string })[] = realMessages?.map((msg) => ({
    id: msg.id,
    from: msg.from_user === currentUserId ? {
      ...currentUser,
      activityStatus: "online" as const,
    } : selectedUser,
    to: msg.to_user === currentUserId ? {
      ...currentUser,
      activityStatus: "online" as const,
    } : selectedUser,
    message: {
      type: msg.message_type === 'file' ? 'file' : msg.message_type === 'video_call' ? 'text' : 'text', // Map to valid types
      value: msg.body || ""
    },
    sentOn: new Date(msg.sent_at || ""),
    // Include additional data
    attachments: msg.attachments,
    content: msg.content || undefined,
  })) || [];
  const toUser: UserType = currentUser;

  const handleAttachmentClick = () => {
    toast("File attachments are not enabled in admin messaging yet.", {
      icon: "i",
    });
  };

  const handleVideoCallClick = () => {
    toast("Call controls are not enabled in the admin messaging launch surface yet.", {
      icon: "i",
    });
  };

  /**
   * Check if file is an image
   */
  const isImageFile = (mimeType: string | undefined): boolean => {
    return mimeType ? mimeType.startsWith('image/') : false;
  };

  /**
   * Open image viewer
   */
  const openImageViewer = (imageUrl: string, imageName: string) => {
    setImageViewer({
      isOpen: true,
      imageUrl,
      imageName
    });
  };

  /**
   * Close image viewer
   */
  const closeImageViewer = () => {
    setImageViewer({
      isOpen: false,
      imageUrl: '',
      imageName: ''
    });
  };

  /**
   * sends the chat message - FIXED: No automatic response
   */
  const sendChatMessage = async (values: { newMessage?: string }) => {
    if (!values.newMessage?.trim() || !effectiveSelectedUserId || !currentUserId) return;

    try {
      await createMessageMutation.mutateAsync({
        to_user: effectiveSelectedUserId,
        body: values.newMessage.trim(),
        message_type: 'text',
      });
      
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessageMutation.mutateAsync(messageId);
      toast.success("Message deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete message.");
    }
  };

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (
        elementRef &&
        elementRef.current &&
        elementRef.current.scrollIntoView
      ) {
        elementRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
    return <div ref={elementRef} />;
  };

  const { chatList, chatProfile } = useChatContext();

  const { theme } = useLayoutContext();

  return (
    <>
    <Card className="position-relative overflow-hidden">
      <CardHeader className="d-flex align-items-center mh-100">
        <Button
          variant="light"
          onClick={chatList.toggle}
          className="d-xxl-none d-flex align-items-center px-2 me-2"
          type="button"
        >
          <IconifyIcon icon="bx:menu" className="fs-18" />
        </Button>
        <div className="d-flex align-items-center">
          <Image
            src={selectedUser.avatar}
            className="me-2 rounded"
            width={36}
            height={36}
            alt="avatar-4"
          />
          <div className="d-none d-md-flex flex-column">
            <h5 className="my-0 fs-16 fw-semibold">
              <span
                role="button"
                onClick={chatProfile.toggle}
                className="text-dark"
              >
                {selectedUser.name}
              </span>
            </h5>
            <p
              className={`mb-0 text-${selectedUser.activityStatus === "offline" ? "danger" : "success"} fw-semibold fst-italic`}
            >
              <IconifyIcon icon="bxs:circle" className="fs-13" />
              {selectedUser.activityStatus}
            </p>
          </div>
        </div>
        <div className="flex-grow-1">
          <ul className="list-inline float-end d-flex gap-1 mb-0">
            <VideoCall />

            <VoiceCall />

            <ProfileDetail selectedUser={selectedUser} />
          </ul>
        </div>
      </CardHeader>
      <div className="chat-box">
        <SimplebarReactClient className="chat-conversation-list p-3 chatbox-height">
          {isLoading ? (
            <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading messages...</span>
                </div>
                <p className="mt-2 text-muted">Loading messages...</p>
              </div>
            ) : userMessages.length === 0 ? (
              <div className="text-center p-4">
                <IconifyIcon icon="ri:message-3-line" className="fs-48 text-muted mb-3" />
                <p className="text-muted mb-0">No messages yet. Start the conversation.</p>
              </div>
            ) : (
              userMessages.map((message, idx) => (
                <UserMessage
                  message={message}
                  toUser={toUser}
                  onImageClick={openImageViewer}
                  onDelete={handleDeleteMessage}
                  key={idx}
                />
              ))
            )}
            <AlwaysScrollToBottom />
          </SimplebarReactClient>

        <div className="bg-light bg-opacity-50 p-2">
          <form
            className="needs-validation"
            name="chat-form"
            id="chat-form"
            onSubmit={handleSubmit(sendChatMessage)}
          >
            <Row className="align-items-center">
              <Col className="mb-2 mb-sm-0 d-flex">
                <div className="input-group flex-nowrap">
                  <Dropdown drop="up">
                    <DropdownToggle
                      type="button"
                      className="btn btn-sm btn-primary rounded-start d-flex align-items-center input-group-text content-none"
                    >
                      <IconifyIcon
                        width={18}
                        height={27}
                        icon="ri:emotion-line"
                        className="fs-18"
                      />
                    </DropdownToggle>
                    <DropdownMenu className="p-0 rounded-4">
                        <EmojiPicker
                          data={data}
                          theme={theme}
                          onEmojiSelect={() => undefined}
                        />
                    </DropdownMenu>
                  </Dropdown>
                  <TextFormInput
                    noValidate
                    control={control}
                    name="newMessage"
                    containerClassName="w-100"
                    className="border-0 h-100"
                    placeholder="Enter your message"
                  />
                </div>
              </Col>
              <Col sm={"auto"}>
                <div className="d-flex gap-2">
                  <Button 
                    variant="soft-success" 
                    size="sm"
                    onClick={handleAttachmentClick}
                    disabled={!currentUserId || !effectiveSelectedUserId}
                    title="Attachments are not enabled for launch yet"
                  >
                    <IconifyIcon
                      icon="ri:attachment-2"
                      width={18}
                      height={27}
                      className="fs-18"
                    />
                  </Button>
                  <Button 
                    variant="soft-warning" 
                    size="sm"
                    onClick={handleVideoCallClick}
                    disabled={!currentUserId || !effectiveSelectedUserId}
                    title="Calling is not enabled for launch yet"
                  >
                    <IconifyIcon
                      icon="ri:video-on-line"
                      width={18}
                      height={27}
                      className="fs-18"
                    />
                  </Button>
                  
                  {/* Send message button */}
                  <button
                    type="submit"
                    disabled={createMessageMutation.isPending || !currentUserId || !effectiveSelectedUserId}
                    className="btn btn-primary btn-sm chat-send"
                    title="Send message"
                  >
                    {createMessageMutation.isPending ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Sending...</span>
                      </div>
                    ) : (
                      <IconifyIcon
                        icon="ri:send-plane-2-line"
                        width={18}
                        height={18}
                        className=" fs-18"
                      />
                    )}
                  </button>
                </div>
              </Col>
            </Row>
          </form>
        </div>
      </div>
    </Card>

    {/* Image Viewer Modal */}
    <Modal
      show={imageViewer.isOpen}
      onHide={closeImageViewer}
      centered
      size="lg"
      className="image-viewer-modal"
      contentClassName="bg-transparent border-0"
    >
      <ModalHeader className="border-0 p-2">
        <div className="d-flex align-items-center justify-content-between w-100">
          <h6 className="text-white mb-0">{imageViewer.imageName}</h6>
          <div className="d-flex gap-2">
            <a
              href={imageViewer.imageUrl}
              download={imageViewer.imageName}
              className="btn btn-sm btn-outline-light"
              title="Download image"
            >
              <IconifyIcon icon="ri:download-line" />
            </a>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={closeImageViewer}
              title="Close"
            >
              <IconifyIcon icon="ri:close-line" />
            </button>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="p-2 text-center">
        <div className="position-relative">
          <Image
            src={imageViewer.imageUrl}
            alt={imageViewer.imageName}
            width={800}
            height={600}
            className="img-fluid rounded"
            style={{ 
              maxHeight: '80vh', 
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </ModalBody>
    </Modal>
  </>
  );
};

export default ChatArea;
