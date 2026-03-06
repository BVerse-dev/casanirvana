"use client";
import data from "@emoji-mart/data";
import EmojiPicker from "@emoji-mart/react";
import clsx from "clsx";

import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
import { addOrSubtractMinutesFromDate } from "@/utils/date";
import { getFileExtensionIcon } from "@/utils/get-icons";
import { 
  useGetGroup, 
  useListGroupMessages, 
  useCreateGroupMessage 
} from "@/hooks/useGroups";
import { avatars } from "@/assets/images/users";
import { supabase } from '@/lib/supabase';
import { mapAvatarUrl } from "@/utils/avatarMapper";

import small1 from "@/assets/images/small/img-1.jpg";
import small2 from "@/assets/images/small/img-2.jpg";
import small3 from "@/assets/images/small/img-3.jpg";
import TextFormInput from "@/components/from/TextFormInput";
import Image from "next/image";

interface GroupChatAreaProps {
  groupId: string;
}

const VideoCall = ({ group }: { group: any }) => {
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
            <div className="me-2 rounded bg-primary d-flex align-items-center justify-content-center" style={{ width: 100, height: 100 }}>
              <IconifyIcon icon="ri:group-line" className="fs-48 text-white" />
            </div>
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

const VoiceCall = ({ group }: { group: any }) => {
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
            <div className="me-2 rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
              <IconifyIcon icon="ri:group-line" className="fs-24 text-white" />
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-0 text-center">
          <h5>{group?.name || 'Group Chat'}</h5>
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
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="flex-shrink-0">
                        <IconifyIcon
                          icon={getFileExtensionIcon((message as any).attachments.name)}
                          className="fs-24 me-1 text-success"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <span role="button" className="text-dark">
                          {(message as any).attachments.name}
                        </span>
                        <p className="mb-0">{((message as any).attachments.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Legacy file attachments array */}
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

const GroupChatArea = ({ groupId }: GroupChatAreaProps) => {
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
  const currentUserEmail = session?.user?.email || "Not available";

  // Use real group data from Supabase
  const { data: group, isLoading: groupLoading } = useGetGroup(groupId);
  const { data: groupMessages, isLoading: messagesLoading } = useListGroupMessages(groupId);
  const createGroupMessageMutation = useCreateGroupMessage();

  // Transform Supabase group messages to ChatMessageType format for UI compatibility
  const userMessages: (ChatMessageType & { attachments?: any; content?: string })[] = groupMessages?.map((msg) => {
    // Get user info from profiles or use default
    const hasValidProfile = msg.profiles && typeof msg.profiles === 'object' && !('message' in msg.profiles);
    const profileData = hasValidProfile ? msg.profiles as any : null;
    
    const fromUser = profileData ? {
      id: msg.from_user || 'unknown',
      name: `${profileData.first_name || 'User'} ${profileData.last_name || ''}`.trim(),
      avatar: mapAvatarUrl(profileData.avatar_url) || avatars.avatar1,
      email: profileData.email || "user@example.com",
      mutualCount: 0,
      contact: profileData.phone || "Not provided",
      activityStatus: "online" as const,
      status: "Active" as const,
      location: group?.name || "Group chat",
      languages: ["English"],
      time: new Date(),
      message: "",
      emailMessage: "",
    } : {
      id: msg.from_user || 'unknown',
      name: "User",
      avatar: avatars.avatar1,
      email: "user@example.com",
      mutualCount: 0,
      contact: "Not provided",
      activityStatus: "online" as const,
      status: "Active" as const,
      location: group?.name || "Group chat",
      languages: ["English"],
      time: new Date(),
      message: "",
      emailMessage: "",
    };

    return {
      id: msg.id,
      from: fromUser,
      to: fromUser, // Group messages don't have a specific "to" user
      message: {
        type: msg.message_type === 'file' ? 'file' : msg.message_type === 'video_call' ? 'text' : 'text',
        value: msg.body || ""
      },
      sentOn: new Date(msg.sent_at || ""),
      attachments: msg.attachments,
    };
  }) || [];

  // Fixed current user object for UI compatibility
  const toUser: UserType = {
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

  /**
   * Handle attachment button click
   */
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle file selection from file input
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUserId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const storagePath = `${currentUserId}/group-chat/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('chat-attachments')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(storagePath);

      await createGroupMessageMutation.mutateAsync({
        group_id: groupId,
        body: `📎 ${file.name}`,
        message_type: "file",
        attachments: { 
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          name: file.name,
          url: publicUrl,
        },
      });
    } catch {
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle video call button click
   */
  const handleVideoCallClick = async () => {
    try {
      await createGroupMessageMutation.mutateAsync({
        group_id: groupId,
        body: `📹 Video call initiated`,
        attachments: {
          type: 'video_call',
          action: 'initiated',
          timestamp: new Date().toISOString()
        },
        message_type: 'video_call',
      });
    } catch {
    }
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
   * sends the group chat message
   */
  const sendChatMessage = async (values: { newMessage?: string }) => {
    if (!values.newMessage?.trim()) return;

    try {
      await createGroupMessageMutation.mutateAsync({
        group_id: groupId,
        body: values.newMessage.trim(),
        message_type: 'text',
      });
      
      reset();
    } catch {
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

  const { chatList, videoCall, voiceCall } = useChatContext();
  const { theme } = useLayoutContext();

  // Show loading state
  if (groupLoading || messagesLoading) {
    return (
      <Card className="position-relative overflow-hidden">
        <CardHeader className="d-flex align-items-center justify-content-center mh-100">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading group...</span>
        </CardHeader>
      </Card>
    );
  }

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
            <div className="me-2 rounded bg-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <IconifyIcon icon="ri:group-line" className="fs-18 text-white" />
            </div>
            <div className="d-none d-md-flex flex-column">
              <h5 className="my-0 fs-16 fw-semibold">
                <span className="text-dark">
                  {group?.name || 'Group Chat'}
                </span>
              </h5>
                             <p className="mb-0 text-muted fw-semibold fst-italic">
                 <IconifyIcon icon="bxs:circle" className="fs-13 text-success" />
                 {group?.group_members?.length || 0} members
               </p>
            </div>
          </div>
          <div className="flex-grow-1">
            <ul className="list-inline float-end d-flex gap-1 mb-0">
              <VideoCall group={group} />

              <VoiceCall group={group} />

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
                    <IconifyIcon icon="ri:group-line" className="me-2" />
                    Group Info
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
                    <IconifyIcon icon="ri:notification-line" className="me-2" />
                    Mute Notifications
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
            {messagesLoading ? (
              <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading messages...</span>
                </div>
                <p className="mt-2 text-muted">Loading messages...</p>
              </div>
            ) : userMessages.length > 0 ? (
              userMessages.map((message, idx) => (
                <UserMessage message={message} toUser={toUser} onImageClick={openImageViewer} key={idx} />
              ))
            ) : (
              <div className="text-center p-4">
                <IconifyIcon icon="ri:group-line" className="fs-48 text-muted mb-3" />
                <p className="text-muted">No messages yet. Start the conversation!</p>
              </div>
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
                      disabled={createGroupMessageMutation.isPending}
                      className="btn btn-primary btn-sm chat-send"
                      title="Send message"
                    >
                      {createGroupMessageMutation.isPending ? (
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
      >
        <ModalHeader closeButton>
          <h5 className="modal-title">{imageViewer.imageName}</h5>
        </ModalHeader>
        <ModalBody className="text-center p-0">
          <Image
            src={imageViewer.imageUrl}
            alt={imageViewer.imageName}
            width={800}
            height={600}
            className="img-fluid"
            style={{ maxHeight: '70vh', objectFit: 'contain' }}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default GroupChatArea; 
