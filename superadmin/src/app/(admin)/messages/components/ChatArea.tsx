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
import { useCreateMessage, useListMessages } from "@/hooks/useMessages";
import { avatars } from "@/assets/images/users";
import { supabase } from '@/lib/supabase';
import { buildStoredChatAttachment } from "@/utils/chatAttachments";

import small1 from "@/assets/images/small/img-1.jpg";
import small2 from "@/assets/images/small/img-2.jpg";
import small3 from "@/assets/images/small/img-3.jpg";
import TextFormInput from "@/components/from/TextFormInput";
import Image from "next/image";

const MessageDropdown = ({
  message,
  toUser,
}: {
  message: ChatMessageType;
  toUser: UserType;
}) => {
  return (
    <Dropdown
      drop={message.from.id === toUser.id ? "end" : "start"}
      className="chat-conversation-actions"
    >
      <DropdownToggle as={"a"} role="button" className="ps-1">
        <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-18" />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem>
          <IconifyIcon icon="bx:share" className="me-2" />
          Reply
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:share-alt" className="me-2" />
          Forward
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:copy" className="me-2" />
          Copy
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:bookmark" className="me-2" />
          Bookmark
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:star" className="me-2" />
          Starred
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:info-square" className="me-2" />
          Mark as Unread
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:trash" className="me-2" />
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const VideoCall = ({ selectedUser }: { selectedUser: UserType }) => {
  const { videoCall } = useChatContext();
  return (
    <>
      <li className="list-inline-item fs-20 dropdown">
        <div
          role="button"
          className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
          onClick={videoCall.toggle}
        >
          <span>
            {" "}
            <IconifyIcon icon="solar:videocamera-record-bold-duotone" />
          </span>
        </div>
      </li>

      <Modal
        show={videoCall.open}
        onHide={videoCall.toggle}
        centered
        contentClassName="video-call"
        className="fade mx-auto d-flex"
        id="videocall"
        aria-hidden="true"
      >
        <ModalHeader className="border-0 mb-5 justify-content-end">
          <div className="video-call-head">
            <Image
              src={selectedUser.avatar}
              className="rounded"
              width={100}
              height={100}
              alt="avatar-4"
            />
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="video-call-action text-center pt-4 pb-0">
            <ul className="d-flex align-items-center justify-content-evenly bg-dark m-3 p-2 rounded-pill">
              <li className="list-inline-item avatar-sm me-2">
                <button
                  type="button"
                  className="avatar-title rounded-circle bg-soft-light text-white fs-16 border-0"
                >
                  <IconifyIcon icon="ri:mic-off-line" />
                </button>
              </li>
              <li className="list-inline-item avatar-sm">
                <button
                  type="button"
                  className="avatar-title rounded-circle bg-soft-light text-white fs-16 border-0"
                >
                  <IconifyIcon icon="ri:volume-up-line" />
                </button>
              </li>
              <li className="list-inline-item avatar-sm me-2">
                <button
                  type="button"
                  className="avatar-title rounded-circle bg-soft-light text-white fs-16 border-0"
                >
                  <IconifyIcon icon="ri:camera-switch-line" />
                </button>
              </li>
              <li className="list-inline-item avatar-sm">
                <button
                  type="button"
                  className="avatar-title rounded-circle bg-soft-light text-white fs-16 border-0"
                >
                  <IconifyIcon icon="ri:camera-off-line" />
                </button>
              </li>
              <li className="list-inline-item fw-bold" data-bs-dismiss="modal">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={videoCall.toggle}
                  className="rounded-pill d-flex icons-center"
                >
                  <IconifyIcon
                    width={13}
                    height={13}
                    icon="ri:phone-line"
                    className="me-1"
                  />
                  10:02
                </Button>
              </li>
            </ul>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

const VoiceCall = ({ selectedUser }: { selectedUser: UserType }) => {
  const { voiceCall } = useChatContext();
  return (
    <>
      <li className="list-inline-item fs-20 dropdown">
        <div
          role="button"
          className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
          onClick={voiceCall.toggle}
        >
          <span>
            {" "}
            <IconifyIcon icon="solar:outgoing-call-rounded-bold-duotone" />
          </span>
        </div>
      </li>

      <Modal
        show={voiceCall.open}
        onHide={voiceCall.toggle}
        centered
        contentClassName="voice-call  mx-auto d-flex"
        className="fade"
        id="voicecall"
        aria-hidden="true"
      >
        <ModalHeader className="border-0 mt-5 justify-content-center">
          <div className="voice-call-head">
            <Image
              src={selectedUser.avatar}
              className="rounded-circle"
              width={80}
              height={80}
              alt="avatar-4"
            />
          </div>
        </ModalHeader>
        <ModalBody className="pt-0 text-center">
          <h5>{selectedUser.name}</h5>
          <p className="mb-5">Calling...</p>
          <div className="voice-call-action pt-4 pb-0">
            <ul className="d-flex align-items-center justify-content-between bg-dark mx-5 mb-3 p-2 rounded-pill">
              <li className="list-inline-item avatar-sm me-2">
                <button
                  type="button"
                  className="avatar-title rounded-circle bg-soft-light text-white fs-16 border-0"
                >
                  <IconifyIcon icon="ri:mic-off-line" />
                </button>
              </li>
              <li
                className="list-inline-item avatar-sm me-2"
                data-bs-dismiss="modal"
              >
                <button
                  type="button"
                  onClick={voiceCall.toggle}
                  className="avatar-title rounded-circle bg-danger text-white fs-18 border-0"
                >
                  <IconifyIcon icon="solar:end-call-linear" />
                </button>
              </li>
              <li className="list-inline-item avatar-sm">
                <button
                  type="button"
                  className="avatar-title rounded-circle bg-soft-light text-white fs-16 border-0"
                >
                  <IconifyIcon icon="ri:volume-up-line" />
                </button>
              </li>
            </ul>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

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
            {" "}
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
          <h5
            className="offcanvas-title text-truncate w-50"
            id="user-profileLabel"
          >
            Profile
          </h5>
        </OffcanvasHeader>
        <SimplebarReactClient className="offcanvas-body p-0 h-100">
          <div className="p-3">
            <div className="text-center">
              <Image
                src={selectedUser.avatar}
                alt="shreyu"
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
              <p className="text-muted mt-2 fs-14">
                Last Interacted:
                <strong
                  className={`text-${selectedUser.activityStatus === "offline" ? "danger" : "success"}`}
                >
                  {" "}
                  {selectedUser.activityStatus}
                </strong>
              </p>
            </div>
            <div className="mt-3">
              <hr />
              <p className="mt-3 mb-1">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:phone-line" className="me-1" />
                  Phone Number:
                </strong>
              </p>
              <p>+1 {selectedUser.contact}</p>
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
              <p>
                {selectedUser.languages.map((language, idx) => (
                  <Fragment key={idx}>{language}, </Fragment>
                ))}
              </p>
              <p className="mt-3 mb-2">
                <strong className="icons-center">
                  <IconifyIcon icon="ri:group-3-line" className="me-1" />
                  Groups:
                </strong>
              </p>
              <p className="mb-0">
                <span className="badge badge-soft-success p-1 fs-14 me-1">
                  Work
                </span>
                <span className="badge badge-soft-primary p-1 fs-14">
                  Friends
                </span>
              </p>
            </div>
            <h5 className="mt-3">
              <span role="button" className="my-0">
                <span className="float-end">See All</span>
                Shared Photoes
              </span>
            </h5>
            <Row className="gx-1 pt-2">
              <Col xs={4}>
                <div role="button">
                  <Image
                    src={small1}
                    alt="img-1"
                    width={100}
                    height={100}
                    className="img-fluid rounded"
                  />
                </div>
              </Col>
              <Col xs={4}>
                <div role="button">
                  <Image
                    src={small2}
                    alt="img-2"
                    width={100}
                    height={100}
                    className="img-fluid rounded"
                  />
                </div>
              </Col>
              <Col xs={4}>
                <div className="position-relative overflow-hidden rounded">
                  <div role="button">
                    <Image
                      src={small3}
                      alt="img-3"
                      width={100}
                      height={100}
                      className="img-fluid rounded"
                    />
                    <div className="bg-overlay bg-dark" />
                    <h3 className="position-absolute top-50 start-50 translate-middle my-0 text-white">
                      +3
                    </h3>
                  </div>
                </div>
              </Col>
            </Row>
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
}: {
  message: ChatMessageType;
  toUser: UserType;
  onImageClick: (imageUrl: string, imageName: string) => void;
}) => {
  return (
    <li
      className={clsx("clearfix gap-2 d-flex", {
        "justify-content-end odd": message.from.id === toUser.id,
      })}
    >
      {message.from.id != toUser.id && (
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
          "ms-0": message.from.id === toUser.id,
        })}
      >
        {message.from.id === toUser.id ? (
          <p className="mb-2  text-end">
            {new Date(message.sentOn || new Date()).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}{" "}
            <span className={`text-dark fw-medium me-1 `}>
              {message.from.id === toUser.id ? "you" : message.from.name}
            </span>{" "}
          </p>
        ) : (
          <p className="mb-2">
            <span className={`text-dark fw-medium me-1 `}>
              {message.from.id === toUser.id ? "you" : message.from.name}
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
            "justify-content-end": message.from.id === toUser.id,
          })}
        >
          {message.from.id === toUser.id && (
            <MessageDropdown message={message} toUser={toUser} />
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
          {message.from.id != toUser.id && (
            <MessageDropdown message={message} toUser={toUser} />
          )}
        </div>
      </div>
      {message.from.id === toUser.id && (
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

  // File input ref for attachment functionality
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  /**
   * Handle attachment button click
   */
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle file selection for attachment
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !effectiveSelectedUserId || !currentUserId) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const storagePath = `${currentUserId}/chat/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Fallback: send text message about file
        await createMessageMutation.mutateAsync({
          from_user: currentUserId,
          to_user: effectiveSelectedUserId,
          body: `📎 File share attempted: ${file.name} (upload failed)`,
          content: null,
          attachments: null,
          message_type: 'text',
          sent_at: new Date().toISOString(),
          read: false,
          is_read: false,
        });
        toast.error("File upload failed. A text notice was sent instead.");
      } else {
        // Send message with file attachment
        await createMessageMutation.mutateAsync({
          from_user: currentUserId,
          to_user: effectiveSelectedUserId,
          body: `📎 ${file.name}`,
          content: null,
          attachments: buildStoredChatAttachment({
            path: storagePath,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }),
          message_type: 'file',
          sent_at: new Date().toISOString(),
          read: false,
          is_read: false,
        });
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send file.");
    }
  };

  /**
   * Handle video call button click
   */
  const handleVideoCallClick = async () => {
    if (!currentUserId || !effectiveSelectedUserId) return;

    // Send a message indicating video call attempt
    try {
      await createMessageMutation.mutateAsync({
        from_user: currentUserId,
        to_user: effectiveSelectedUserId,
        body: `📹 Video call initiated`,
        content: `Video call started at ${new Date().toLocaleTimeString()}`,
        attachments: {
          type: 'video_call',
          action: 'initiated',
          timestamp: new Date().toISOString()
        },
        message_type: 'video_call',
        sent_at: new Date().toISOString(),
        read: false,
        is_read: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register the call event.");
    }

    // Open the video call modal
    videoCall.toggle();
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
        from_user: currentUserId,
        to_user: effectiveSelectedUserId,
        body: values.newMessage.trim(),
        message_type: 'text',
        sent_at: new Date().toISOString(),
        read: false,
        is_read: false,
      });
      
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
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

  const { chatList, chatProfile, videoCall } = useChatContext();

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
              {selectedUser.activityStatus != "typing" && (
                <IconifyIcon icon="bxs:circle" className="fs-13" />
              )}
              {selectedUser.activityStatus}
              {selectedUser.activityStatus === "typing" && "..."}
            </p>
          </div>
        </div>
        <div className="flex-grow-1">
          <ul className="list-inline float-end d-flex gap-1 mb-0">
            <VideoCall selectedUser={selectedUser} />

            <VoiceCall selectedUser={selectedUser} />

            <ProfileDetail selectedUser={selectedUser} />

            <Dropdown className="list-inline-item fs-20 d-none d-md-flex">
              <DropdownToggle
                as={"a"}
                role="button"
                className="arrow-none text-dark"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <IconifyIcon icon="bx:dots-vertical-rounded" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>
                  <IconifyIcon icon="ri:user-6-line" className="me-2" />
                  View Profile
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon icon="ri:music-2-line" className="me-2" />
                  Media, Links and Docs
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon icon="ri:search-2-line" className="me-2" />
                  Search
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon icon="ri:image-line" className="me-2" />
                  Wallpaper
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon
                    icon="ri:arrow-right-circle-line"
                    className="me-2"
                  />
                  More
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
          ) : (
            userMessages.map((message, idx) => (
              <UserMessage message={message} toUser={toUser} onImageClick={openImageViewer} key={idx} />
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
                  {/* Hidden file input for attachments */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  />
                  
                  {/* Attachment button */}
                  <Button 
                    variant="soft-success" 
                    size="sm"
                    onClick={handleAttachmentClick}
                    disabled={!currentUserId || !effectiveSelectedUserId}
                    title="Attach file"
                  >
                    <IconifyIcon
                      icon="ri:attachment-2"
                      width={18}
                      height={27}
                      className="fs-18"
                    />
                  </Button>
                  
                  {/* Video call button */}
                  <Button 
                    variant="soft-warning" 
                    size="sm"
                    onClick={handleVideoCallClick}
                    disabled={!currentUserId || !effectiveSelectedUserId}
                    title="Start video call"
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
