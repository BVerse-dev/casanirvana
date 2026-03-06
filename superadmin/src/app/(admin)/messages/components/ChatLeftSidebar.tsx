import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useChatContext } from "@/context/useChatContext";
import { useMessageStats } from "@/hooks/useMessages";
import { useGetProfile } from "@/hooks/useProfiles";
import { 
  useGetChatSettings, 
  useUpdateChatSettings, 
  useUpdateChatPreferences, 
  useUpdateNotificationSettings, 
  useUpdateStorageSettings, 
  useUpdateThemeSettings,
  useFormattedStorageUsage,
  useChatSettingsRealtime 
} from "@/hooks/useChatSettings";
import type { UserType } from "@/types/data";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Card,
  CardHeader,
  CardTitle,
  Offcanvas,
  OffcanvasHeader,
  Tab,
  Tabs,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
} from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper/modules";
import Chat from "./Chat";
import Contact from "./Contact";
import Group from "./Group";

import avatar1 from "@/assets/images/users/avatar-1.jpg";

import Image from "next/image";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import "swiper/css";
import "swiper/css/free-mode";

// Add custom styles for Facebook Messenger-like hover effect
const activeContactStyles = `
  /* Active contacts wrapper - ensures proper containment */
  .active-contacts-wrapper {
    position: relative;
    padding: 12px 0;
    margin-bottom: 20px;
    border-radius: 12px;
    transition: all 0.2s ease;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .active-contacts-wrapper:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
  
  .active-contacts-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    padding: 4px 8px;
  }
  
  /* Swiper container styling */
  .mySwiper {
    overflow: hidden !important;
    cursor: grab;
    user-select: none;
    padding: 0;
    margin: 0;
    border-radius: 8px;
  }
  
  .mySwiper:active {
    cursor: grabbing;
  }
  
  .mySwiper .swiper-wrapper {
    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    align-items: center;
    padding: 4px 0;
  }
  
  .mySwiper .swiper-slide {
    width: auto !important;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: auto;
  }
  
  /* Contact item styling */
  .active-contact-container {
    padding: 6px;
    border-radius: 12px;
    transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .active-contact-container:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    border-color: rgba(13, 110, 253, 0.3);
  }
  
  .active-contact-container:active {
    transform: translateY(-1px) scale(0.98);
  }
  
  /* Avatar styling */
  .chat-user-status-box:hover .avatar {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
  }
  
  .chat-user-status-box:hover .hover-overlay {
    opacity: 0.08 !important;
  }
  
  .chat-user-status-box:active .avatar {
    transform: scale(0.95);
  }
  
  /* Professional glassmorphism effect */
  .active-contacts-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .active-contacts-wrapper:hover::before {
    opacity: 1;
  }
  
  /* Professional spacing system */
  .active-contacts-wrapper + .card-title {
    margin-top: 0 !important;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .active-contacts-wrapper {
      margin-left: 12px;
      margin-right: 12px;
      margin-bottom: 16px;
      padding: 10px 0;
    }
    
    .active-contact-container {
      padding: 4px;
    }
  }
  
  /* Professional section dividers */
  .chat-section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
    margin: 16px 0;
  }
  
  /* Message stats styling */
  .message-stats-badge {
    transition: all 0.2s ease;
    font-weight: 600;
    font-size: 11px;
    min-width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .message-stats-badge:hover {
    transform: scale(1.05);
  }
  
  .message-stats-section {
    transition: all 0.2s ease;
  }
  
  .message-stats-section:hover {
    color: #495057;
  }
`;

const formatRoleLabel = (role?: string | null) => {
  if (!role) return "Admin";
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
};

type ChatUsersProps = {
  onUserSelect: (value: any) => void;
  users: any[];
  selectedUser: any;
  onGroupSelect?: (groupId: string, groupName?: string) => void;
  onContactSelect?: (contactId: string, contactName: string) => void;
};

const ChatLeftSidebar = ({
  users,
  onUserSelect,
  selectedUser,
  onGroupSelect,
  onContactSelect,
}: ChatUsersProps) => {
  const { chatSetting } = useChatContext();
  const [user, setUser] = useState<any[]>([...users]);
  const { data: messageStats, isLoading: statsLoading } = useMessageStats();
  
  // Modal states
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showTwoStepModal, setShowTwoStepModal] = useState(false);
  const [showChangeNumberModal, setShowChangeNumberModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  
  // Chat section modals
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showAppLanguageModal, setShowAppLanguageModal] = useState(false);
  const [showChatBackupModal, setShowChatBackupModal] = useState(false);
  const [showChatHistoryModal, setShowChatHistoryModal] = useState(false);
  
  // Custom wallpaper upload state
  const [uploadedWallpaper, setUploadedWallpaper] = useState<string | null>(null);
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  
  // Notification section modals
  const [showMessageToneModal, setShowMessageToneModal] = useState(false);
  const [showMessageVibrateModal, setShowMessageVibrateModal] = useState(false);
  const [showMessageLightModal, setShowMessageLightModal] = useState(false);
  const [showGroupToneModal, setShowGroupToneModal] = useState(false);
  const [showGroupVibrateModal, setShowGroupVibrateModal] = useState(false);
  const [showGroupLightModal, setShowGroupLightModal] = useState(false);
  const [showCallRingtoneModal, setShowCallRingtoneModal] = useState(false);
  const [showCallVibrateModal, setShowCallVibrateModal] = useState(false);
  
  // Storage section modals
  const [showManageStorageModal, setShowManageStorageModal] = useState(false);
  const [showNetworkUsageModal, setShowNetworkUsageModal] = useState(false);
  const [showMobileDataModal, setShowMobileDataModal] = useState(false);
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [showRoamingModal, setShowRoamingModal] = useState(false);
  const [showPhotoQualityModal, setShowPhotoQualityModal] = useState(false);
  
  // Help section modals
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  const [showContactUsModal, setShowContactUsModal] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  
  // QR Code modal
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  
  // Chat settings hooks
  const { data: chatSettings, isLoading: settingsLoading } = useGetChatSettings();
  const { mutate: updateChatSettings } = useUpdateChatSettings();
  const { mutate: updateChatPreferences } = useUpdateChatPreferences();
  const { mutate: updateNotificationSettings } = useUpdateNotificationSettings();
  const { mutate: updateStorageSettings } = useUpdateStorageSettings();
  const { mutate: updateThemeSettings } = useUpdateThemeSettings();
  const { subscribeToChatSettings } = useChatSettingsRealtime();
  const formattedStorage = useFormattedStorageUsage(chatSettings);
  const { data: session } = useSession();
  const { data: currentProfile } = useGetProfile(session?.user?.id || "");

  const currentUserName = session?.user?.name || "Admin User";
  const currentUserEmail = session?.user?.email || "No email available";
  const currentUserRole = formatRoleLabel(session?.user?.role);
  const currentUserAvatar = mapAvatarUrl(currentProfile?.avatar_url) || avatar1;
  const currentUserSubtitle = currentProfile?.phone || currentUserEmail;
  const qrContactPayload = useMemo(
    () => ({
      type: "nirvana_chat_user",
      id: session?.user?.id || chatSettings?.user_id || "unknown",
      name: currentUserName,
      email: session?.user?.email || null,
      role: session?.user?.role || null,
      app: "Nirvana Chat",
      timestamp: new Date().toISOString(),
    }),
    [chatSettings?.user_id, currentUserName, session?.user?.email, session?.user?.id, session?.user?.role],
  );

  const search = (text: string) => {
    setUser(
      text
        ? [...users].filter(
            (u) => u.name!.toLowerCase().indexOf(text.toLowerCase()) >= 0,
          )
        : [...users],
    );
  };

  // Subscribe to real-time chat settings updates
  useEffect(() => {
    const unsubscribe = subscribeToChatSettings();
    return () => {
      unsubscribe();
    };
  }, [subscribeToChatSettings]);

  useEffect(() => {
    let active = true;

    const generateQrCode = async () => {
      try {
        const nextQrCode = await QRCode.toDataURL(JSON.stringify(qrContactPayload), {
          width: 200,
          margin: 1,
        });
        if (active) {
          setQrCodeDataUrl(nextQrCode);
        }
      } catch {
        if (active) {
          setQrCodeDataUrl(null);
        }
      }
    };

    generateQrCode();

    return () => {
      active = false;
    };
  }, [qrContactPayload]);

  // Helper function to handle settings updates
  const handleSettingToggle = (settingType: string, field: string, value: any) => {
    if (!chatSettings) return;
    
    const userId = chatSettings.user_id;
    
    switch (settingType) {
      case 'flat':
        updateChatSettings({ 
          user_id: userId, 
          [field]: value 
        });
        break;
      case 'preferences':
        updateChatPreferences({ 
          userId, 
          preferences: { [field]: value } 
        });
        break;
      case 'notifications':
        updateNotificationSettings({ 
          userId, 
          notificationSettings: { [field]: value } 
        });
        break;
      case 'storage':
        updateStorageSettings({ 
          userId, 
          storageSettings: { [field]: value } 
        });
        break;
      case 'theme':
        updateThemeSettings({ 
          userId, 
          [field]: value 
        });
        break;
    }
  };

  // Helper function to handle privacy settings updates
  const handlePrivacyUpdate = (field: string, value: any) => {
    if (!chatSettings) return;
    
    const userId = chatSettings.user_id;
    const currentPrivacySettings = chatSettings.privacy_settings ? 
      (typeof chatSettings.privacy_settings === 'object' ? chatSettings.privacy_settings : {}) : {};
    
    const updatedPrivacySettings = {
      ...currentPrivacySettings,
      [field]: value
    };
    
    updateChatSettings({ 
      user_id: userId, 
      privacy_settings: updatedPrivacySettings 
    });
  };

  // Helper function to get privacy setting value
  const getPrivacySettingValue = (field: string, defaultValue: any = 'Everyone') => {
    if (!chatSettings?.privacy_settings) return defaultValue;
    if (typeof chatSettings.privacy_settings !== 'object') return defaultValue;
    return (chatSettings.privacy_settings as any)[field] || defaultValue;
  };

  // Helper function to handle security settings updates
  const handleSecurityUpdate = (field: string, value: any) => {
    if (!chatSettings) return;
    
    const userId = chatSettings.user_id;
    const currentSecuritySettings = chatSettings.security_settings ? 
      (typeof chatSettings.security_settings === 'object' ? chatSettings.security_settings : {}) : {};
    
    const updatedSecuritySettings = {
      ...currentSecuritySettings,
      [field]: value
    };
    
    updateChatSettings({ 
      user_id: userId, 
      security_settings: updatedSecuritySettings 
    });
  };

  // Helper function to get security setting value
  const getSecuritySettingValue = (field: string, defaultValue: any = false) => {
    if (!chatSettings?.security_settings) return defaultValue;
    if (typeof chatSettings.security_settings !== 'object') return defaultValue;
    return (chatSettings.security_settings as any)[field] || defaultValue;
  };

  // Handle custom wallpaper upload
  const handleWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file.");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB.");
        return;
      }

      setWallpaperFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedWallpaper(imageUrl);
        
        // Update wallpaper setting to 'custom'
        handleSettingToggle('flat', 'wallpaper', 'custom');
        
        // Store the custom wallpaper URL (in real app, you'd upload to storage first)
        handleSettingToggle('flat', 'custom_wallpaper_url', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: activeContactStyles }} />
      
      <Card className="position-relative overflow-hidden">
        <CardHeader className="border-0 d-flex justify-content-between align-items-center gap-3">
        <form className="chat-search pb-0">
          <div className="chat-search-box">
            <input
              className="form-control"
              type="text"
              onKeyUp={(e: any) => search(e.target.value)}
              name="search"
              placeholder="Search ..."
            />
            <button
              type="button"
              className="btn btn-sm btn-link search-icon p-0 fs-15"
            >
              <IconifyIcon icon="ri:search-eye-line" />
            </button>
          </div>
        </form>
        <a
          href="#user-setting"
          onClick={chatSetting.toggle}
          className="fs-20 icons-center"
          type="button"
          data-bs-toggle="offcanvas"
          aria-haspopup="true"
          aria-expanded="true"
        >
          <IconifyIcon icon="ri:settings-2-line" />
        </a>
      </CardHeader>
      <CardTitle as={"h4"} className="mx-3 mb-3 d-flex align-items-center justify-content-between">
        <span>Active</span>
        <small className="text-muted fs-12" style={{ fontSize: '10px' }}>
          <IconifyIcon icon="ri:drag-move-2-line" className="fs-12 me-1" />
          Scroll
        </small>
      </CardTitle>
      
      {/* Active contacts container with proper overflow handling */}
      <div className="active-contacts-wrapper mx-3">
        <div className="active-contacts-container">
          <Swiper
            modules={[Mousewheel, FreeMode]}
            mousewheel={{
              enabled: true,
              forceToAxis: true,
              sensitivity: 1,
              releaseOnEdges: true,
            }}
            freeMode={{
              enabled: true,
              momentum: true,
              momentumRatio: 0.5,
              momentumVelocityRatio: 0.5,
              sticky: false,
            }}
            slidesPerView={"auto"}
            spaceBetween={8}
            breakpoints={{
              0: {
                slidesPerView: 4,
              },
              1400: {
                slidesPerView: 6,
              },
            }}
            autoHeight
            grabCursor={true}
            className="mySwiper"
          >
            {users.map((user) => (
              <SwiperSlide className="avatar" key={user.id}>
                <div className="active-contact-container">
                  <div 
                    className="chat-user-status-box position-relative"
                    role="button"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onUserSelect(user)}
                    title={user.name} // Tooltip on hover
                  >
                    <span className="position-relative d-inline-block">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="avatar rounded-circle flex-shrink-0 border border-2 border-white shadow-sm"
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      {/* Online status indicator */}
                      <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white border-2 rounded-circle">
                        <span className="visually-hidden">Online</span>
                      </span>
                    </span>
                    {/* Hover overlay for Facebook Messenger effect */}
                    <div 
                      className="hover-overlay position-absolute top-0 start-0 w-100 h-100 rounded-circle bg-dark"
                      style={{
                        transition: 'all 0.2s ease',
                        opacity: 0,
                        zIndex: 1
                      }}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      
      {/* Message section with consistent spacing */}
      <CardTitle as={"h4"} className="mx-3 mt-4 mb-3 d-flex align-items-center justify-content-between message-stats-section">
        <span>
          Message{" "}
          {statsLoading ? (
            <span className="badge bg-secondary badge-pill message-stats-badge">
              <div className="spinner-border spinner-border-sm" role="status" style={{ width: '10px', height: '10px' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </span>
          ) : (
            <span className={`badge badge-pill message-stats-badge ${messageStats?.activeChats && messageStats.activeChats > 0 ? 'bg-danger' : 'bg-secondary'}`}>
              {messageStats?.activeChats || 0}
            </span>
          )}
        </span>
        {messageStats && (
          <small className="text-muted fs-12 d-flex align-items-center" style={{ fontSize: '10px' }}>
            <IconifyIcon icon="ri:chat-3-line" className="fs-12 me-1" />
            {messageStats.unreadMessages || 0} unread
          </small>
        )}
      </CardTitle>
      <Tabs
        justify
        mountOnEnter
        className="nav nav-pills chat-tab-pills nav-justified p-1 rounded mx-1"
        defaultActiveKey={"chat-tab"}
      >
        <Tab title="Chat" eventKey={"chat-tab"}>
          <Chat
            onUserSelect={onUserSelect}
            users={user}
            selectedUser={selectedUser}
          />
        </Tab>
        <Tab title="Group" eventKey={"group-tab"}>
          <Group onGroupSelect={onGroupSelect} />
        </Tab>
        <Tab title="Contact" eventKey={"contact-tab"}>
          <Contact onContactSelect={onContactSelect} />
        </Tab>
      </Tabs>
      <Offcanvas
        show={chatSetting.open}
        placement="start"
        onHide={chatSetting.toggle}
        className="offcanvas-start position-absolute shadow"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabIndex={-1}
        id="user-setting"
        aria-labelledby="user-settingLabel"
      >
        <OffcanvasHeader closeButton>
          <h5
            className="offcanvas-title text-truncate w-50"
            id="user-settingLabel"
          >
            Profile
          </h5>
        </OffcanvasHeader>
        <div className="offcanvas-body p-0 h-100" data-simplebar>
          <h4 className="page-title p-3 my-0">Setting</h4>
          <div className="d-flex align-items-center px-3 pb-3 border-bottom">
            <Image
              src={currentUserAvatar}
              className="me-2 rounded-circle"
              height={36}
              width={36}
              alt={currentUserName}
            />
            <div className="flex-grow-1">
              <div className="float-end">
                <span role="button" onClick={() => setShowQRCodeModal(true)}>
                  <IconifyIcon icon="bx:qr-scan" className="fs-20" />
                </span>
              </div>
              <h5 className="my-0 fs-14">{currentUserName}</h5>
              <p className="mt-1 mb-0 text-muted">
                <span className="w-75">{currentUserSubtitle}</span>
              </p>
              <p className="mt-1 mb-0 text-muted fs-12">{currentUserRole}</p>
            </div>
          </div>
          <div className="px-3 my-3 app-chat-setting">
            <Accordion className="custom-accordion" id="accordionSetting">
              <AccordionItem eventKey="1" className="border-0">
                <AccordionHeader as={"h5"} className="my-0" id="headingAccount">
                  <span className="d-flex align-items-center">
                    <IconifyIcon icon="bx:key" className="me-3 fs-32" />
                    <span className="flex-grow-1">
                      <span className="fs-14 h5 mt-0 mb-1 d-block">
                        Account
                      </span>
                      <span className="mt-1 mb-0 text-muted w-75">
                        Privacy, security, change number
                      </span>
                    </span>
                  </span>
                </AccordionHeader>

                <AccordionBody className="pb-0">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowPrivacyModal(true)}>
                        <IconifyIcon
                          icon="bx:lock-alt"
                          className="fs-18 me-2"
                        />
                        Privacy
                      </span>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowSecurityModal(true)}>
                        <IconifyIcon
                          icon="bx:check-Reback"
                          className="fs-18 me-2"
                        />
                        Security
                      </span>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowTwoStepModal(true)}>
                        <IconifyIcon
                          icon="bx:badge-check"
                          className="fs-18 me-2"
                        />
                        Two-step verification
                      </span>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowChangeNumberModal(true)}>
                        <IconifyIcon
                          icon="bx:arrow-from-left"
                          className="fs-18 me-2"
                        />
                        Change number
                      </span>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowRequestInfoModal(true)}>
                        <IconifyIcon
                          icon="bx:info-circle"
                          className="fs-18 me-2"
                        />
                        Request account info
                      </span>
                    </li>
                    <li>
                      <span role="button" onClick={() => setShowDeleteAccountModal(true)}>
                        <IconifyIcon icon="bx:trash" className="fs-18 me-2" />
                        Delete my account
                      </span>
                    </li>
                  </ul>
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey="2" className="border-0">
                <AccordionHeader as={"h5"} className="my-0" id="headingChats">
                  <span className="d-flex align-items-center">
                    <IconifyIcon
                      icon="bx:message-dots"
                      className="me-3 fs-32"
                    />
                    <span className="flex-grow-1">
                      <span className="fs-14 h5 mt-0 mb-1 d-block">Chats</span>
                      <span className="mt-1 mb-0 text-muted w-75">
                        Theme, wallpapers, chat history
                      </span>
                    </span>
                  </span>
                </AccordionHeader>

                <AccordionBody className="pb-0">
                  <h5 className="mb-2">Display</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2 d-flex">
                      <IconifyIcon icon="bx:palette" className="fs-18 me-2" />
                      <div className="flex-grow-1">
                        <span role="button" onClick={() => setShowThemeModal(true)}>Theme</span>
                        <p className="mb-0 text-muted fs-12">
                          {chatSettings?.theme || 'System default'}
                        </p>
                      </div>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowWallpaperModal(true)}>
                        <IconifyIcon icon="bx:image" className="fs-16 me-2" />
                        Wallpaper
                      </span>
                    </li>
                  </ul>
                  <hr />
                  <h5>Chat Setting</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2 ms-2">
                      <div className="float-end">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="media"
                            checked={chatSettings?.media_visibility || false}
                            onChange={(e) => handleSettingToggle('flat', 'media_visibility', e.target.checked)}
                            disabled={settingsLoading}
                          />
                        </div>
                      </div>
                      <span className="fw-medium">Media Visibility</span>
                      <p className="mb-0 text-muted fs-12">
                        Show Newly downloaded media in your phone&apos;s gallery
                      </p>
                    </li>
                    <li className="mb-2 ms-2">
                      <div className="float-end">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="enter"
                            checked={chatSettings?.enter_is_send || false}
                            onChange={(e) => handleSettingToggle('flat', 'enter_is_send', e.target.checked)}
                            disabled={settingsLoading}
                          />
                        </div>
                      </div>
                      <span className="fw-medium">Enter is send</span>
                      <p className="mb-0 text-muted fs-12">
                        Enter key will send your message
                      </p>
                    </li>
                    <li className="mb-2 ms-2">
                      <span role="button" onClick={() => setShowFontSizeModal(true)}>Font size</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.font_size || 'medium'}
                      </p>
                    </li>
                  </ul>
                  <hr />
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <div className="d-flex">
                        <IconifyIcon icon="bx:text" className="fs-16 me-2" />
                        <div className="flex-grow-1">
                          <span role="button" onClick={() => setShowAppLanguageModal(true)}>App Language</span>
                          <p className="mb-0 text-muted fs-12">
                            {chatSettings?.app_language === 'en' ? 'English' : chatSettings?.app_language || 'English'}
                          </p>
                        </div>
                      </div>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowChatBackupModal(true)}>
                        <IconifyIcon
                          icon="bx:cloud-upload"
                          className="fs-16 me-2"
                        />
                        Chat Backup
                      </span>
                    </li>
                    <li>
                      <span role="button" onClick={() => setShowChatHistoryModal(true)}>
                        <IconifyIcon icon="bx:history" className="fs-16 me-2" />
                        Chat History
                      </span>
                    </li>
                  </ul>
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey="3" className="border-0">
                <AccordionHeader
                  as={"h5"}
                  className="my-0"
                  id="headingNotification"
                >
                  <span className="d-flex align-items-center">
                    <IconifyIcon icon="bx:bell" className="me-3 fs-32" />
                    <span className="flex-grow-1">
                      <span className="fs-14 h5 mt-0 mb-1 d-block">
                        Notification
                      </span>
                      <span className="mt-1 mb-0 text-muted w-75">
                        Message, group, call tones
                      </span>
                    </span>
                  </span>
                </AccordionHeader>
                <AccordionBody className="pb-0">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <div className="float-end">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="conversation"
                            checked={chatSettings?.conversation_tones || false}
                            onChange={(e) => handleSettingToggle('flat', 'conversation_tones', e.target.checked)}
                            disabled={settingsLoading}
                          />
                        </div>
                      </div>
                      <span className="fw-medium">Conversation Tones</span>
                      <p className="mb-0 text-muted fs-12">
                        Play sound for incoming and outgoing message.
                      </p>
                    </li>
                  </ul>
                  <hr />
                  <h5>Messages</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowMessageToneModal(true)}>Notification Tone</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.message_notification_tone || 'Default ringtone'}
                      </p>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowMessageVibrateModal(true)}>Vibrate</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.message_vibrate || 'Default'}
                      </p>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowMessageLightModal(true)}>Light</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.message_light_color || 'White'}
                      </p>
                    </li>
                  </ul>
                  <hr />
                  <h5>Groups</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowGroupToneModal(true)}>Notification Tone</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.group_notification_tone || 'Default ringtone'}
                      </p>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowGroupVibrateModal(true)}>Vibrate</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.group_vibrate || 'Off'}
                      </p>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowGroupLightModal(true)}>Light</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.group_light_color || 'Dark'}
                      </p>
                    </li>
                  </ul>
                  <hr />
                  <h5>Calls</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowCallRingtoneModal(true)}>Ringtone</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.call_ringtone || 'Default ringtone'}
                      </p>
                    </li>
                    <li>
                      <span role="button" onClick={() => setShowCallVibrateModal(true)}>Vibrate</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.call_vibrate || 'Default'}
                      </p>
                    </li>
                  </ul>
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey="4" className="border-0">
                <AccordionHeader as={"h5"} className="my-0" id="headingStorage">
                  <span className="d-flex align-items-center">
                    <IconifyIcon icon="bx:history" className="me-3 fs-32" />
                    <span className="flex-grow-1">
                      <span className="fs-14 h5 mt-0 mb-1 d-block">
                        Storage and data
                      </span>
                      <span className="mt-1 mb-0 text-muted w-75">
                        Network usage, auto download
                      </span>
                    </span>
                  </span>
                </AccordionHeader>

                <AccordionBody className="pb-0">
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex">
                      <IconifyIcon icon="bx:folder" className="fs-16 me-2" />
                      <div className="flex-grow-1">
                        <span role="button" onClick={() => setShowManageStorageModal(true)}>Manage storage</span>
                        <p className="mb-0 text-muted fs-12">
                          {formattedStorage?.storageUsed || '2.4 GB'}
                        </p>
                      </div>
                    </li>
                  </ul>
                  <hr />
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex">
                      <IconifyIcon icon="bx:wifi" className="fs-16 me-2" />
                      <div className="flex-grow-1">
                        <span role="button" onClick={() => setShowNetworkUsageModal(true)}>Network usage</span>
                        <p className="mb-0 text-muted fs-12">
                          {formattedStorage?.networkUsage ? 
                            `${formattedStorage.networkUsage.sent} sent - ${formattedStorage.networkUsage.received} received` :
                            '7.2 GB sent - 13.8 GB received'
                          }
                        </p>
                      </div>
                    </li>
                  </ul>
                  <hr />
                  <h5 className="mb-0">Media auto-download</h5>
                  <p className="mb-0 text-muted fs-12">
                    Voice message are always automatically downloaded
                  </p>
                  <ul className="list-unstyled mb-0 mt-2">
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowMobileDataModal(true)}>When using mobile data</span>
                      <p className="mb-0 text-muted fs-12">No media</p>
                    </li>
                    <li className="mb-2 ms-2">
                      <span role="button" onClick={() => setShowWifiModal(true)}>When connected on wi-fi</span>
                      <p className="mb-0 text-muted fs-12">No media</p>
                    </li>
                    <li className="mb-2 ms-2">
                      <span role="button" onClick={() => setShowRoamingModal(true)}>When roaming</span>
                      <p className="mb-0 text-muted fs-12">No media</p>
                    </li>
                  </ul>
                  <hr />
                  <h5 className="mb-0">Media upload quality</h5>
                  <p className="mb-0 text-muted fs-12">
                    Choose the quality of media files to be sent
                  </p>
                  <ul className="list-unstyled mb-0 mt-2">
                    <li className="ms-2">
                      <span role="button" onClick={() => setShowPhotoQualityModal(true)}>Photo upload quality</span>
                      <p className="mb-0 text-muted fs-12">
                        {chatSettings?.photo_upload_quality || 'Auto (recommended)'}
                      </p>
                    </li>
                  </ul>
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey="5" className="border-0">
                <AccordionHeader as={"h5"} className="my-0" id="headingHelp">
                  <span className="d-flex align-items-center">
                    <IconifyIcon icon="bx:info-circle" className="me-3 fs-32" />
                    <span className="flex-grow-1">
                      <span className="fs-14 h5 mt-0 mb-1 d-block">Help</span>
                      <span className="mt-1 mb-0 text-muted w-75">
                        Help center, contact us, privacy policy
                      </span>
                    </span>
                  </span>
                </AccordionHeader>

                <AccordionBody className="pb-0">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <div role="button" onClick={() => setShowHelpCenterModal(true)}>
                        <IconifyIcon
                          icon="bx:info-circle"
                          className="fs-16 me-2"
                        />
                        Help center
                      </div>
                    </li>
                    <li className="mb-2 d-flex">
                      <IconifyIcon icon="bxs:contact" className="fs-16 me-2" />
                      <div className="flex-grow-1">
                        <span role="button" onClick={() => setShowContactUsModal(true)}>Contact us</span>
                        <p className="mb-0 text-muted fs-12">Questions?</p>
                      </div>
                    </li>
                    <li className="mb-2">
                      <span role="button" onClick={() => setShowPrivacyPolicyModal(true)}>
                        <IconifyIcon
                          icon="bx:book-content"
                          className="fs-16 me-2"
                        />
                        Terms and Privacy Policy
                      </span>
                    </li>
                    <li>
                      <span role="button" onClick={() => setShowAppInfoModal(true)}>
                        <IconifyIcon
                          icon="bx:book-circle"
                          className="fs-16 me-2"
                        />
                        App info
                      </span>
                    </li>
                  </ul>
                </AccordionBody>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Offcanvas>
    </Card>
    
    {/* Privacy Modal */}
    <Modal show={showPrivacyModal} onHide={() => setShowPrivacyModal(false)} centered>
      <ModalHeader closeButton>
        <ModalTitle>Privacy Settings</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="privacy-settings">
          <div className="mb-3">
            <h6 className="mb-2">Who can see my personal info</h6>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                <span>Last seen</span>
                                 <select 
                   className="form-select form-select-sm w-auto"
                   value={getPrivacySettingValue('last_seen', 'Everyone')}
                   onChange={(e) => handlePrivacyUpdate('last_seen', e.target.value)}
                 >
                   <option value="Everyone">Everyone</option>
                   <option value="My contacts">My contacts</option>
                   <option value="My contacts except...">My contacts except...</option>
                   <option value="Nobody">Nobody</option>
                 </select>
              </label>
            </div>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                <span>Profile photo</span>
                                 <select 
                   className="form-select form-select-sm w-auto"
                   value={getPrivacySettingValue('profile_photo', 'Everyone')}
                   onChange={(e) => handlePrivacyUpdate('profile_photo', e.target.value)}
                 >
                   <option value="Everyone">Everyone</option>
                   <option value="My contacts">My contacts</option>
                   <option value="My contacts except...">My contacts except...</option>
                   <option value="Nobody">Nobody</option>
                 </select>
              </label>
            </div>
            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                <span>About</span>
                                 <select 
                   className="form-select form-select-sm w-auto"
                   value={getPrivacySettingValue('about', 'Everyone')}
                   onChange={(e) => handlePrivacyUpdate('about', e.target.value)}
                 >
                   <option value="Everyone">Everyone</option>
                   <option value="My contacts">My contacts</option>
                   <option value="My contacts except...">My contacts except...</option>
                   <option value="Nobody">Nobody</option>
                 </select>
               </label>
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Messaging</h6>
             <div className="mb-3">
               <label className="form-label d-flex justify-content-between">
                 <span>Read receipts</span>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={getPrivacySettingValue('read_receipts', false)}
                     onChange={(e) => handlePrivacyUpdate('read_receipts', e.target.checked)}
                   />
                 </div>
               </label>
               <small className="text-muted">If turned off, you won't send or receive read receipts</small>
             </div>
             <div className="mb-3">
               <label className="form-label d-flex justify-content-between">
                 <span>Groups</span>
                 <select 
                   className="form-select form-select-sm w-auto"
                   value={getPrivacySettingValue('groups', 'Everyone')}
                   onChange={(e) => handlePrivacyUpdate('groups', e.target.value)}
                 >
                   <option value="Everyone">Everyone</option>
                   <option value="My contacts">My contacts</option>
                   <option value="My contacts except...">My contacts except...</option>
                 </select>
               </label>
             </div>
             <div className="mb-3">
               <label className="form-label d-flex justify-content-between">
                 <span>Live Location</span>
                 <select 
                   className="form-select form-select-sm w-auto"
                   value={getPrivacySettingValue('live_location', 'Everyone')}
                   onChange={(e) => handlePrivacyUpdate('live_location', e.target.value)}
                 >
                   <option value="Everyone">Everyone</option>
                   <option value="My contacts">My contacts</option>
                   <option value="My contacts except...">My contacts except...</option>
                 </select>
               </label>
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Blocked contacts</h6>
             <div className="d-flex justify-content-between align-items-center">
               <span>Blocked contacts</span>
               <span className="text-muted">{getPrivacySettingValue('blocked_contacts', [])?.length || 0}</span>
             </div>
             <small className="text-muted">Manage blocked contacts</small>
           </div>
                 </div>
       </ModalBody>
     </Modal>
     
     {/* Security Modal */}
     <Modal show={showSecurityModal} onHide={() => setShowSecurityModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Security Settings</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="security-settings">
           <div className="mb-3">
             <h6 className="mb-2">Notifications</h6>
             <div className="mb-3">
               <label className="form-label d-flex justify-content-between">
                 <span>Show security notifications</span>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={getSecuritySettingValue('show_security_notifications', true)}
                     onChange={(e) => handleSecurityUpdate('show_security_notifications', e.target.checked)}
                   />
                 </div>
               </label>
               <small className="text-muted">Get notified for security events</small>
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">App Lock</h6>
             <div className="mb-3">
               <label className="form-label d-flex justify-content-between">
                 <span>Screen lock</span>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={getSecuritySettingValue('screen_lock', false)}
                     onChange={(e) => handleSecurityUpdate('screen_lock', e.target.checked)}
                   />
                 </div>
               </label>
               <small className="text-muted">Require authentication to open the app</small>
             </div>
             <div className="mb-3">
               <label className="form-label d-flex justify-content-between">
                 <span>Fingerprint unlock</span>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={getSecuritySettingValue('fingerprint_unlock', false)}
                     onChange={(e) => handleSecurityUpdate('fingerprint_unlock', e.target.checked)}
                   />
                 </div>
               </label>
               <small className="text-muted">Use fingerprint to unlock the app</small>
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Session Management</h6>
             <div className="mb-3">
               <label className="form-label d-flex justify-content-between">
                 <span>Auto-lock timer</span>
                 <select 
                   className="form-select form-select-sm w-auto"
                   value={getSecuritySettingValue('auto_lock_timer', '5 minutes')}
                   onChange={(e) => handleSecurityUpdate('auto_lock_timer', e.target.value)}
                 >
                   <option value="Immediately">Immediately</option>
                   <option value="1 minute">1 minute</option>
                   <option value="5 minutes">5 minutes</option>
                   <option value="15 minutes">15 minutes</option>
                   <option value="30 minutes">30 minutes</option>
                   <option value="1 hour">1 hour</option>
                 </select>
               </label>
               <small className="text-muted">Time before auto-lock activates</small>
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Account Security</h6>
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <span>Two-factor authentication</span>
                 <span className={`badge ${getSecuritySettingValue('two_factor_enabled', false) ? 'bg-success' : 'bg-secondary'}`}>
                   {getSecuritySettingValue('two_factor_enabled', false) ? 'Enabled' : 'Disabled'}
                 </span>
               </div>
               <small className="text-muted">Extra security for your account</small>
             </div>
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <span>Active sessions</span>
                 <span className="text-muted">{getSecuritySettingValue('active_sessions', 1)}</span>
               </div>
               <small className="text-muted">Number of active login sessions</small>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Two-step Verification Modal */}
     <Modal show={showTwoStepModal} onHide={() => setShowTwoStepModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Two-step Verification</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="two-step-settings">
           <div className="mb-4 text-center">
             <IconifyIcon 
               icon="bx:shield-check" 
               className="fs-48 text-success mb-3"
             />
             <h5>Secure Your Account</h5>
             <p className="text-muted">
               Two-step verification adds an extra layer of security to your account.
             </p>
           </div>
           
           <div className="mb-3">
             <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
               <div>
                 <h6 className="mb-1">Status</h6>
                 <span className={`badge ${getSecuritySettingValue('two_factor_enabled', false) ? 'bg-success' : 'bg-secondary'}`}>
                   {getSecuritySettingValue('two_factor_enabled', false) ? 'Enabled' : 'Disabled'}
                 </span>
               </div>
               <div className="form-check form-switch">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   checked={getSecuritySettingValue('two_factor_enabled', false)}
                   onChange={(e) => handleSecurityUpdate('two_factor_enabled', e.target.checked)}
                 />
               </div>
             </div>
           </div>
           
           {getSecuritySettingValue('two_factor_enabled', false) && (
             <div className="mb-3">
               <h6 className="mb-2">Verification Methods</h6>
               <div className="mb-3">
                 <label className="form-label d-flex justify-content-between">
                   <span>SMS to phone</span>
                   <div className="form-check form-switch">
                     <input
                       className="form-check-input"
                       type="checkbox"
                       checked={getSecuritySettingValue('sms_verification', false)}
                       onChange={(e) => handleSecurityUpdate('sms_verification', e.target.checked)}
                     />
                   </div>
                 </label>
                 <small className="text-muted">Receive verification codes via SMS</small>
               </div>
               <div className="mb-3">
                 <label className="form-label d-flex justify-content-between">
                   <span>Email verification</span>
                   <div className="form-check form-switch">
                     <input
                       className="form-check-input"
                       type="checkbox"
                       checked={getSecuritySettingValue('email_verification', false)}
                       onChange={(e) => handleSecurityUpdate('email_verification', e.target.checked)}
                     />
                   </div>
                 </label>
                 <small className="text-muted">Receive verification codes via email</small>
               </div>
               <div className="mb-3">
                 <label className="form-label d-flex justify-content-between">
                   <span>Authenticator app</span>
                   <div className="form-check form-switch">
                     <input
                       className="form-check-input"
                       type="checkbox"
                       checked={getSecuritySettingValue('authenticator_app', false)}
                       onChange={(e) => handleSecurityUpdate('authenticator_app', e.target.checked)}
                     />
                   </div>
                 </label>
                 <small className="text-muted">Use an authenticator app like Google Authenticator</small>
               </div>
             </div>
           )}
           
           <div className="mb-3">
             <h6 className="mb-2">Backup Options</h6>
             <div className="mb-3">
               <label className="form-label">Backup codes</label>
               <div className="d-flex justify-content-between align-items-center">
                 <span className="text-muted">
                   {getSecuritySettingValue('backup_codes_count', 0)} codes remaining
                 </span>
                 <button 
                   className="btn btn-sm btn-outline-primary"
                   onClick={() => handleSecurityUpdate('backup_codes_count', 10)}
                 >
                   Generate New
                 </button>
               </div>
               <small className="text-muted">Use backup codes when you can't access your device</small>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Change Number Modal */}
     <Modal show={showChangeNumberModal} onHide={() => setShowChangeNumberModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Change Number</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="change-number-settings">
           <div className="mb-4 text-center">
             <IconifyIcon 
               icon="bx:phone" 
               className="fs-48 text-primary mb-3"
             />
             <h5>Change Your Phone Number</h5>
             <p className="text-muted">
               Update your phone number for account security and verification.
             </p>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Current Phone Number</label>
             <input
               type="tel"
               className="form-control"
               value={getSecuritySettingValue('current_phone', '+1 (555) 123-4567')}
               disabled
             />
             <small className="text-muted">Your current registered phone number</small>
           </div>
           
           <div className="mb-3">
             <label className="form-label">New Phone Number</label>
             <input
               type="tel"
               className="form-control"
               placeholder="Enter new phone number"
               value={getSecuritySettingValue('new_phone', '')}
               onChange={(e) => handleSecurityUpdate('new_phone', e.target.value)}
             />
             <small className="text-muted">Enter your new phone number with country code</small>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Country</label>
             <select 
               className="form-select"
               value={getSecuritySettingValue('phone_country', 'US')}
               onChange={(e) => handleSecurityUpdate('phone_country', e.target.value)}
             >
               <option value="US">United States (+1)</option>
               <option value="CA">Canada (+1)</option>
               <option value="GB">United Kingdom (+44)</option>
               <option value="IN">India (+91)</option>
               <option value="AU">Australia (+61)</option>
               <option value="DE">Germany (+49)</option>
               <option value="FR">France (+33)</option>
               <option value="JP">Japan (+81)</option>
             </select>
           </div>
           
           <div className="mb-3">
             <div className="alert alert-info">
               <IconifyIcon icon="bx:info-circle" className="me-2" />
               <strong>Important:</strong> You'll receive a verification code on your new number to confirm the change.
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Verification Process</h6>
             <div className="d-flex align-items-center mb-2">
               <IconifyIcon icon="bx:check-circle" className="text-success me-2" />
               <span>1. Verify current number</span>
             </div>
             <div className="d-flex align-items-center mb-2">
               <IconifyIcon icon="bx:circle" className="text-muted me-2" />
               <span>2. Verify new number</span>
             </div>
             <div className="d-flex align-items-center mb-2">
               <IconifyIcon icon="bx:circle" className="text-muted me-2" />
               <span>3. Update account</span>
             </div>
           </div>
           
           <div className="d-grid gap-2">
             <button 
               className="btn btn-primary"
               onClick={() => {
                 handleSecurityUpdate('phone_change_requested', true);
                 handleSecurityUpdate('phone_change_requested_at', new Date().toISOString());
                 setShowChangeNumberModal(false);
                 toast.success('Phone change request saved.');
               }}
               disabled={!getSecuritySettingValue('new_phone', '')}
             >
               Save Change Request
             </button>
             <button 
               className="btn btn-outline-secondary"
               onClick={() => setShowChangeNumberModal(false)}
             >
               Cancel
             </button>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Request Account Info Modal */}
     <Modal show={showRequestInfoModal} onHide={() => setShowRequestInfoModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Request Account Info</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="request-info-settings">
           <div className="mb-4 text-center">
             <IconifyIcon 
               icon="bx:download" 
               className="fs-48 text-info mb-3"
             />
             <h5>Download Your Data</h5>
             <p className="text-muted">
               Request a copy of your account information and chat data.
             </p>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Data to Include</h6>
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="includeProfile"
                   checked={getSecuritySettingValue('include_profile', true)}
                   onChange={(e) => handleSecurityUpdate('include_profile', e.target.checked)}
                 />
                 <label className="form-check-label" htmlFor="includeProfile">
                   Account profile information
                 </label>
               </div>
               <small className="text-muted">Name, email, phone number, and profile settings</small>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="includeMessages"
                   checked={getSecuritySettingValue('include_messages', true)}
                   onChange={(e) => handleSecurityUpdate('include_messages', e.target.checked)}
                 />
                 <label className="form-check-label" htmlFor="includeMessages">
                   Chat messages and history
                 </label>
               </div>
               <small className="text-muted">All your messages, groups, and chat history</small>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="includeMedia"
                   checked={getSecuritySettingValue('include_media', false)}
                   onChange={(e) => handleSecurityUpdate('include_media', e.target.checked)}
                 />
                 <label className="form-check-label" htmlFor="includeMedia">
                   Media files and attachments
                 </label>
               </div>
               <small className="text-muted">Photos, videos, documents, and other files</small>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="includeContacts"
                   checked={getSecuritySettingValue('include_contacts', true)}
                   onChange={(e) => handleSecurityUpdate('include_contacts', e.target.checked)}
                 />
                 <label className="form-check-label" htmlFor="includeContacts">
                   Contacts and groups
                 </label>
               </div>
               <small className="text-muted">Your contact list and group memberships</small>
             </div>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Export Format</label>
             <select 
               className="form-select"
               value={getSecuritySettingValue('export_format', 'JSON')}
               onChange={(e) => handleSecurityUpdate('export_format', e.target.value)}
             >
               <option value="JSON">JSON (recommended)</option>
               <option value="CSV">CSV (spreadsheet)</option>
               <option value="PDF">PDF (readable)</option>
               <option value="HTML">HTML (web page)</option>
             </select>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Email Address</label>
             <input
               type="email"
               className="form-control"
               placeholder="Enter email for delivery"
               value={getSecuritySettingValue('export_email', '')}
               onChange={(e) => handleSecurityUpdate('export_email', e.target.value)}
             />
             <small className="text-muted">We'll send the download link to this email</small>
           </div>
           
           <div className="mb-3">
             <div className="alert alert-warning">
               <IconifyIcon icon="bx:time" className="me-2" />
               <strong>Processing Time:</strong> It may take up to 24 hours to prepare your data.
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Previous Requests</h6>
             <div className="d-flex justify-content-between align-items-center">
               <span>Last request:</span>
               <span className="text-muted">
                 {getSecuritySettingValue('last_export_date', 'Never')}
               </span>
             </div>
             <small className="text-muted">You can request your data once every 7 days</small>
           </div>
           
           <div className="d-grid gap-2">
             <button 
               className="btn btn-primary"
               onClick={() => {
                 handleSecurityUpdate('export_requested', true);
                 handleSecurityUpdate('last_export_date', new Date().toISOString());
                 setShowRequestInfoModal(false);
                 toast.success('Export request saved.');
               }}
               disabled={!getSecuritySettingValue('export_email', '')}
             >
               Save Export Request
             </button>
             <button 
               className="btn btn-outline-secondary"
               onClick={() => setShowRequestInfoModal(false)}
             >
               Cancel
             </button>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Delete Account Modal */}
     <Modal show={showDeleteAccountModal} onHide={() => setShowDeleteAccountModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle className="text-danger">Delete Account</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="delete-account-settings">
           <div className="mb-4 text-center">
             <IconifyIcon 
               icon="bx:trash" 
               className="fs-48 text-danger mb-3"
             />
             <h5 className="text-danger">Delete Your Account</h5>
             <p className="text-muted">
               This action cannot be undone. Please read the information below carefully.
             </p>
           </div>
           
           <div className="mb-3">
             <div className="alert alert-danger">
               <IconifyIcon icon="bx:error" className="me-2" />
               <strong>Warning:</strong> Deleting your account will permanently remove all your data.
             </div>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">What will be deleted:</h6>
             <ul className="list-unstyled">
               <li className="mb-2">
                 <IconifyIcon icon="bx:x" className="text-danger me-2" />
                 All your messages and chat history
               </li>
               <li className="mb-2">
                 <IconifyIcon icon="bx:x" className="text-danger me-2" />
                 Your profile information and settings
               </li>
               <li className="mb-2">
                 <IconifyIcon icon="bx:x" className="text-danger me-2" />
                 All uploaded media files and attachments
               </li>
               <li className="mb-2">
                 <IconifyIcon icon="bx:x" className="text-danger me-2" />
                 Your contacts and group memberships
               </li>
               <li className="mb-2">
                 <IconifyIcon icon="bx:x" className="text-danger me-2" />
                 All account preferences and customizations
               </li>
             </ul>
           </div>
           
           <div className="mb-3">
             <h6 className="mb-2">Before you delete:</h6>
             <div className="form-check mb-2">
               <input
                 className="form-check-input"
                 type="checkbox"
                 id="backupData"
                 checked={getSecuritySettingValue('backup_before_delete', false)}
                 onChange={(e) => handleSecurityUpdate('backup_before_delete', e.target.checked)}
               />
               <label className="form-check-label" htmlFor="backupData">
                 I have backed up my important data
               </label>
             </div>
             <div className="form-check mb-2">
               <input
                 className="form-check-input"
                 type="checkbox"
                 id="notifyContacts"
                 checked={getSecuritySettingValue('notify_contacts', false)}
                 onChange={(e) => handleSecurityUpdate('notify_contacts', e.target.checked)}
               />
               <label className="form-check-label" htmlFor="notifyContacts">
                 I have informed my contacts about account deletion
               </label>
             </div>
             <div className="form-check mb-2">
               <input
                 className="form-check-input"
                 type="checkbox"
                 id="understoodPermanent"
                 checked={getSecuritySettingValue('understand_permanent', false)}
                 onChange={(e) => handleSecurityUpdate('understand_permanent', e.target.checked)}
               />
               <label className="form-check-label" htmlFor="understoodPermanent">
                 I understand this action is permanent and cannot be undone
               </label>
             </div>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Reason for deletion (optional)</label>
             <select 
               className="form-select"
               value={getSecuritySettingValue('deletion_reason', '')}
               onChange={(e) => handleSecurityUpdate('deletion_reason', e.target.value)}
             >
               <option value="">Select a reason...</option>
               <option value="no_longer_needed">No longer needed</option>
               <option value="privacy_concerns">Privacy concerns</option>
               <option value="switching_service">Switching to another service</option>
               <option value="too_many_notifications">Too many notifications</option>
               <option value="other">Other</option>
             </select>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Confirm by typing "DELETE" below:</label>
             <input
               type="text"
               className="form-control"
               placeholder="Type DELETE to confirm"
               value={getSecuritySettingValue('delete_confirmation', '')}
               onChange={(e) => handleSecurityUpdate('delete_confirmation', e.target.value)}
             />
           </div>
           
           <div className="mb-3">
             <div className="alert alert-info">
               <IconifyIcon icon="bx:time" className="me-2" />
               <strong>Grace Period:</strong> You have 30 days to recover your account after deletion.
             </div>
           </div>
           
           <div className="d-grid gap-2">
             <button 
               className="btn btn-danger"
               onClick={() => {
                 handleSecurityUpdate('account_deletion_requested', true);
                 handleSecurityUpdate('account_deletion_requested_at', new Date().toISOString());
                 setShowDeleteAccountModal(false);
                 toast.success('Account deletion request saved.');
               }}
               disabled={
                 !getSecuritySettingValue('backup_before_delete', false) ||
                 !getSecuritySettingValue('notify_contacts', false) ||
                 !getSecuritySettingValue('understand_permanent', false) ||
                 getSecuritySettingValue('delete_confirmation', '') !== 'DELETE'
               }
             >
               Delete My Account
             </button>
             <button 
               className="btn btn-outline-secondary"
               onClick={() => setShowDeleteAccountModal(false)}
             >
               Cancel
             </button>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Theme Modal */}
     <Modal show={showThemeModal} onHide={() => setShowThemeModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Theme</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="theme-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:palette" className="fs-48 text-primary mb-3" />
             <h5>Choose Theme</h5>
             <p className="text-muted">Select your preferred theme for the chat interface.</p>
           </div>
           
           <div className="theme-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="theme"
                   id="themeSystem"
                   checked={chatSettings?.theme === 'system' || !chatSettings?.theme}
                   onChange={() => handleSettingToggle('flat', 'theme', 'system')}
                 />
                 <label className="form-check-label" htmlFor="themeSystem">
                   <div className="d-flex align-items-center">
                     <IconifyIcon icon="bx:desktop" className="fs-20 me-2" />
                     <div>
                       <strong>System default</strong>
                       <div className="text-muted small">Use your device's theme setting</div>
                     </div>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="theme"
                   id="themeLight"
                   checked={chatSettings?.theme === 'light'}
                   onChange={() => handleSettingToggle('flat', 'theme', 'light')}
                 />
                 <label className="form-check-label" htmlFor="themeLight">
                   <div className="d-flex align-items-center">
                     <IconifyIcon icon="bx:sun" className="fs-20 me-2 text-warning" />
                     <div>
                       <strong>Light</strong>
                       <div className="text-muted small">Bright and clean appearance</div>
                     </div>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="theme"
                   id="themeDark"
                   checked={chatSettings?.theme === 'dark'}
                   onChange={() => handleSettingToggle('flat', 'theme', 'dark')}
                 />
                 <label className="form-check-label" htmlFor="themeDark">
                   <div className="d-flex align-items-center">
                     <IconifyIcon icon="bx:moon" className="fs-20 me-2 text-info" />
                     <div>
                       <strong>Dark</strong>
                       <div className="text-muted small">Easy on the eyes in low light</div>
                     </div>
                   </div>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Wallpaper Modal */}
     <Modal show={showWallpaperModal} onHide={() => setShowWallpaperModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Wallpaper</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="wallpaper-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:image" className="fs-48 text-success mb-3" />
             <h5>Choose Wallpaper</h5>
             <p className="text-muted">Customize your chat background.</p>
           </div>
           
           <div className="wallpaper-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="wallpaper"
                   id="wallpaperDefault"
                   checked={chatSettings?.wallpaper === 'default' || !chatSettings?.wallpaper}
                   onChange={() => handleSettingToggle('flat', 'wallpaper', 'default')}
                 />
                 <label className="form-check-label" htmlFor="wallpaperDefault">
                   <strong>Default</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="wallpaper"
                   id="wallpaperNature"
                   checked={chatSettings?.wallpaper === 'nature'}
                   onChange={() => handleSettingToggle('flat', 'wallpaper', 'nature')}
                 />
                 <label className="form-check-label" htmlFor="wallpaperNature">
                   <strong>Nature</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="wallpaper"
                   id="wallpaperAbstract"
                   checked={chatSettings?.wallpaper === 'abstract'}
                   onChange={() => handleSettingToggle('flat', 'wallpaper', 'abstract')}
                 />
                 <label className="form-check-label" htmlFor="wallpaperAbstract">
                   <strong>Abstract</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="wallpaper"
                   id="wallpaperSolid"
                   checked={chatSettings?.wallpaper === 'solid'}
                   onChange={() => handleSettingToggle('flat', 'wallpaper', 'solid')}
                 />
                 <label className="form-check-label" htmlFor="wallpaperSolid">
                   <strong>Solid Color</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="wallpaper"
                   id="wallpaperCustom"
                   checked={chatSettings?.wallpaper === 'custom'}
                   onChange={() => handleSettingToggle('flat', 'wallpaper', 'custom')}
                 />
                 <label className="form-check-label" htmlFor="wallpaperCustom">
                   <strong>Custom Image</strong>
                 </label>
               </div>
             </div>
             
             {/* Custom wallpaper upload section */}
             <div className="mb-3">
               <div className="d-flex align-items-center gap-3">
                 <input
                   type="file"
                   id="wallpaperUpload"
                   accept="image/*"
                   onChange={handleWallpaperUpload}
                   style={{ display: 'none' }}
                 />
                 <label
                   htmlFor="wallpaperUpload"
                   className="btn btn-outline-primary btn-sm"
                   style={{ cursor: 'pointer' }}
                 >
                   <IconifyIcon icon="bx:upload" className="me-2" />
                   Upload Image
                 </label>
                 <small className="text-muted">Max 5MB, JPG/PNG</small>
               </div>
               
               {/* Show preview of uploaded wallpaper */}
               {uploadedWallpaper && (
                 <div className="mt-3">
                   <div className="border rounded p-2 bg-light">
                     <div className="d-flex align-items-center gap-2">
                       <img
                         src={uploadedWallpaper}
                         alt="Custom wallpaper preview"
                         style={{
                           width: '60px',
                           height: '40px',
                           objectFit: 'cover',
                           borderRadius: '4px'
                         }}
                       />
                       <div>
                         <small className="text-success">Custom wallpaper uploaded</small>
                         <br />
                         <small className="text-muted">
                           {wallpaperFile?.name || 'custom-wallpaper.jpg'}
                         </small>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
               
               {/* Show current custom wallpaper from database */}
               {chatSettings?.custom_wallpaper_url && chatSettings?.wallpaper === 'custom' && !uploadedWallpaper && (
                 <div className="mt-3">
                   <div className="border rounded p-2 bg-light">
                     <div className="d-flex align-items-center gap-2">
                       <img
                         src={chatSettings.custom_wallpaper_url}
                         alt="Current custom wallpaper"
                         style={{
                           width: '60px',
                           height: '40px',
                           objectFit: 'cover',
                           borderRadius: '4px'
                         }}
                       />
                       <div>
                         <small className="text-info">Current custom wallpaper</small>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Font Size Modal */}
     <Modal show={showFontSizeModal} onHide={() => setShowFontSizeModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Font Size</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="font-size-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:font-size" className="fs-48 text-info mb-3" />
             <h5>Choose Font Size</h5>
             <p className="text-muted">Select your preferred text size for messages.</p>
           </div>
           
           <div className="font-size-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="fontSize"
                   id="fontSmall"
                   checked={chatSettings?.font_size === 'small'}
                   onChange={() => handleSettingToggle('flat', 'font_size', 'small')}
                 />
                 <label className="form-check-label" htmlFor="fontSmall">
                   <div className="d-flex align-items-center">
                     <IconifyIcon icon="bx:text" className="fs-16 me-2" />
                     <div>
                       <strong>Small</strong>
                       <div className="text-muted small">Compact text size</div>
                     </div>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="fontSize"
                   id="fontMedium"
                   checked={chatSettings?.font_size === 'medium' || !chatSettings?.font_size}
                   onChange={() => handleSettingToggle('flat', 'font_size', 'medium')}
                 />
                 <label className="form-check-label" htmlFor="fontMedium">
                   <div className="d-flex align-items-center">
                     <IconifyIcon icon="bx:text" className="fs-18 me-2" />
                     <div>
                       <strong>Medium</strong>
                       <div className="text-muted small">Standard text size</div>
                     </div>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="fontSize"
                   id="fontLarge"
                   checked={chatSettings?.font_size === 'large'}
                   onChange={() => handleSettingToggle('flat', 'font_size', 'large')}
                 />
                 <label className="form-check-label" htmlFor="fontLarge">
                   <div className="d-flex align-items-center">
                     <IconifyIcon icon="bx:text" className="fs-20 me-2" />
                     <div>
                       <strong>Large</strong>
                       <div className="text-muted small">Larger text for better readability</div>
                     </div>
                   </div>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* App Language Modal */}
     <Modal show={showAppLanguageModal} onHide={() => setShowAppLanguageModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>App Language</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="app-language-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:world" className="fs-48 text-primary mb-3" />
             <h5>Choose Language</h5>
             <p className="text-muted">Select your preferred language for the interface.</p>
           </div>
           
           <div className="language-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="appLanguage"
                   id="langEnglish"
                   checked={chatSettings?.app_language === 'en' || !chatSettings?.app_language}
                   onChange={() => handleSettingToggle('flat', 'app_language', 'en')}
                 />
                 <label className="form-check-label" htmlFor="langEnglish">
                   <strong>English</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="appLanguage"
                   id="langSpanish"
                   checked={chatSettings?.app_language === 'es'}
                   onChange={() => handleSettingToggle('flat', 'app_language', 'es')}
                 />
                 <label className="form-check-label" htmlFor="langSpanish">
                   <strong>Español</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="appLanguage"
                   id="langFrench"
                   checked={chatSettings?.app_language === 'fr'}
                   onChange={() => handleSettingToggle('flat', 'app_language', 'fr')}
                 />
                 <label className="form-check-label" htmlFor="langFrench">
                   <strong>Français</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="appLanguage"
                   id="langGerman"
                   checked={chatSettings?.app_language === 'de'}
                   onChange={() => handleSettingToggle('flat', 'app_language', 'de')}
                 />
                 <label className="form-check-label" htmlFor="langGerman">
                   <strong>Deutsch</strong>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Chat Backup Modal */}
     <Modal show={showChatBackupModal} onHide={() => setShowChatBackupModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Chat Backup</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="chat-backup-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:cloud-upload" className="fs-48 text-success mb-3" />
             <h5>Backup Settings</h5>
             <p className="text-muted">Configure automatic backup of your chat data.</p>
           </div>
           
           <div className="mb-3">
             <div className="d-flex justify-content-between align-items-center">
               <span>Enable automatic backup</span>
               <div className="form-check form-switch">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   checked={chatSettings?.chat_backup_enabled || false}
                   onChange={(e) => handleSettingToggle('flat', 'chat_backup_enabled', e.target.checked)}
                 />
               </div>
             </div>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Backup Frequency</label>
             <select 
               className="form-select"
               value={chatSettings?.chat_backup_frequency || 'daily'}
               onChange={(e) => handleSettingToggle('flat', 'chat_backup_frequency', e.target.value)}
             >
               <option value="daily">Daily</option>
               <option value="weekly">Weekly</option>
               <option value="monthly">Monthly</option>
             </select>
           </div>
           
           <div className="mb-3">
             <div className="d-flex justify-content-between align-items-center">
               <span>Include videos in backup</span>
               <div className="form-check form-switch">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   checked={chatSettings?.backup_include_videos || false}
                   onChange={(e) => handleSettingToggle('flat', 'backup_include_videos', e.target.checked)}
                 />
               </div>
             </div>
           </div>
           
           <div className="mb-3">
             <button className="btn btn-primary w-100">Backup Now</button>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Chat History Modal */}
     <Modal show={showChatHistoryModal} onHide={() => setShowChatHistoryModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Chat History</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="chat-history-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:history" className="fs-48 text-info mb-3" />
             <h5>Chat History Management</h5>
             <p className="text-muted">Manage how long your chat history is stored.</p>
           </div>
           
           <div className="mb-3">
             <div className="d-flex justify-content-between align-items-center">
               <span>Keep chat history</span>
               <div className="form-check form-switch">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   checked={chatSettings?.chat_history_enabled || true}
                   onChange={(e) => handleSettingToggle('flat', 'chat_history_enabled', e.target.checked)}
                 />
               </div>
             </div>
           </div>
           
           <div className="mb-3">
             <label className="form-label">Data retention period</label>
             <select 
               className="form-select"
               value={chatSettings?.data_retention_days || 365}
               onChange={(e) => handleSettingToggle('flat', 'data_retention_days', parseInt(e.target.value))}
             >
               <option value="30">30 days</option>
               <option value="90">90 days</option>
               <option value="180">6 months</option>
               <option value="365">1 year</option>
               <option value="730">2 years</option>
               <option value="0">Forever</option>
             </select>
           </div>
           
           <div className="mb-3">
             <div className="alert alert-warning">
               <IconifyIcon icon="bx:warning" className="me-2" />
               <strong>Warning:</strong> Clearing history will permanently delete all messages.
             </div>
           </div>
           
           <div className="mb-3">
             <button className="btn btn-outline-danger w-100">Clear All Chat History</button>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Notification Modals */}
     
     {/* Message Tone Modal */}
     <Modal show={showMessageToneModal} onHide={() => setShowMessageToneModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Message Notification Tone</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="notification-tone-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:bell" className="fs-48 text-primary mb-3" />
             <h5>Select Notification Tone</h5>
             <p className="text-muted">Choose the sound for incoming messages.</p>
           </div>
           
           <div className="tone-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageTone"
                   id="toneDefault"
                   checked={chatSettings?.message_notification_tone === 'default' || !chatSettings?.message_notification_tone}
                   onChange={() => handleSettingToggle('flat', 'message_notification_tone', 'default')}
                 />
                 <label className="form-check-label" htmlFor="toneDefault">
                   <strong>Default ringtone</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageTone"
                   id="toneClassic"
                   checked={chatSettings?.message_notification_tone === 'classic'}
                   onChange={() => handleSettingToggle('flat', 'message_notification_tone', 'classic')}
                 />
                 <label className="form-check-label" htmlFor="toneClassic">
                   <strong>Classic notification</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageTone"
                   id="toneChime"
                   checked={chatSettings?.message_notification_tone === 'chime'}
                   onChange={() => handleSettingToggle('flat', 'message_notification_tone', 'chime')}
                 />
                 <label className="form-check-label" htmlFor="toneChime">
                   <strong>Chime</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageTone"
                   id="toneSilent"
                   checked={chatSettings?.message_notification_tone === 'silent'}
                   onChange={() => handleSettingToggle('flat', 'message_notification_tone', 'silent')}
                 />
                 <label className="form-check-label" htmlFor="toneSilent">
                   <strong>Silent</strong>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Message Vibrate Modal */}
     <Modal show={showMessageVibrateModal} onHide={() => setShowMessageVibrateModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Message Vibrate</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="vibrate-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:mobile-vibration" className="fs-48 text-info mb-3" />
             <h5>Vibration Pattern</h5>
             <p className="text-muted">Choose vibration pattern for incoming messages.</p>
           </div>
           
           <div className="vibrate-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageVibrate"
                   id="vibrateDefault"
                   checked={chatSettings?.message_vibrate === 'default' || !chatSettings?.message_vibrate}
                   onChange={() => handleSettingToggle('flat', 'message_vibrate', 'default')}
                 />
                 <label className="form-check-label" htmlFor="vibrateDefault">
                   <strong>Default</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageVibrate"
                   id="vibrateShort"
                   checked={chatSettings?.message_vibrate === 'short'}
                   onChange={() => handleSettingToggle('flat', 'message_vibrate', 'short')}
                 />
                 <label className="form-check-label" htmlFor="vibrateShort">
                   <strong>Short</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageVibrate"
                   id="vibrateLong"
                   checked={chatSettings?.message_vibrate === 'long'}
                   onChange={() => handleSettingToggle('flat', 'message_vibrate', 'long')}
                 />
                 <label className="form-check-label" htmlFor="vibrateLong">
                   <strong>Long</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageVibrate"
                   id="vibrateOff"
                   checked={chatSettings?.message_vibrate === 'off'}
                   onChange={() => handleSettingToggle('flat', 'message_vibrate', 'off')}
                 />
                 <label className="form-check-label" htmlFor="vibrateOff">
                   <strong>Off</strong>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Message Light Modal */}
     <Modal show={showMessageLightModal} onHide={() => setShowMessageLightModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Message Light</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="light-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:bulb" className="fs-48 text-warning mb-3" />
             <h5>Notification Light Color</h5>
             <p className="text-muted">Choose the light color for message notifications.</p>
           </div>
           
           <div className="light-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageLight"
                   id="lightWhite"
                   checked={chatSettings?.message_light_color === 'white' || !chatSettings?.message_light_color}
                   onChange={() => handleSettingToggle('flat', 'message_light_color', 'white')}
                 />
                 <label className="form-check-label" htmlFor="lightWhite">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: 'white', border: '1px solid #ddd'}}></div>
                     <strong>White</strong>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageLight"
                   id="lightBlue"
                   checked={chatSettings?.message_light_color === 'blue'}
                   onChange={() => handleSettingToggle('flat', 'message_light_color', 'blue')}
                 />
                 <label className="form-check-label" htmlFor="lightBlue">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: 'blue'}}></div>
                     <strong>Blue</strong>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageLight"
                   id="lightGreen"
                   checked={chatSettings?.message_light_color === 'green'}
                   onChange={() => handleSettingToggle('flat', 'message_light_color', 'green')}
                 />
                 <label className="form-check-label" htmlFor="lightGreen">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: 'green'}}></div>
                     <strong>Green</strong>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="messageLight"
                   id="lightRed"
                   checked={chatSettings?.message_light_color === 'red'}
                   onChange={() => handleSettingToggle('flat', 'message_light_color', 'red')}
                 />
                 <label className="form-check-label" htmlFor="lightRed">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: 'red'}}></div>
                     <strong>Red</strong>
                   </div>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Group Tone Modal */}
     <Modal show={showGroupToneModal} onHide={() => setShowGroupToneModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Group Notification Tone</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="notification-tone-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:group" className="fs-48 text-success mb-3" />
             <h5>Select Group Notification Tone</h5>
             <p className="text-muted">Choose the sound for group messages.</p>
           </div>
           
           <div className="tone-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupTone"
                   id="groupToneDefault"
                   checked={chatSettings?.group_notification_tone === 'default' || !chatSettings?.group_notification_tone}
                   onChange={() => handleSettingToggle('flat', 'group_notification_tone', 'default')}
                 />
                 <label className="form-check-label" htmlFor="groupToneDefault">
                   <strong>Default ringtone</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupTone"
                   id="groupToneClassic"
                   checked={chatSettings?.group_notification_tone === 'classic'}
                   onChange={() => handleSettingToggle('flat', 'group_notification_tone', 'classic')}
                 />
                 <label className="form-check-label" htmlFor="groupToneClassic">
                   <strong>Classic notification</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupTone"
                   id="groupToneChime"
                   checked={chatSettings?.group_notification_tone === 'chime'}
                   onChange={() => handleSettingToggle('flat', 'group_notification_tone', 'chime')}
                 />
                 <label className="form-check-label" htmlFor="groupToneChime">
                   <strong>Chime</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupTone"
                   id="groupToneSilent"
                   checked={chatSettings?.group_notification_tone === 'silent'}
                   onChange={() => handleSettingToggle('flat', 'group_notification_tone', 'silent')}
                 />
                 <label className="form-check-label" htmlFor="groupToneSilent">
                   <strong>Silent</strong>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Group Vibrate Modal */}
     <Modal show={showGroupVibrateModal} onHide={() => setShowGroupVibrateModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Group Vibrate</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="vibrate-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:mobile-vibration" className="fs-48 text-info mb-3" />
             <h5>Group Vibration Pattern</h5>
             <p className="text-muted">Choose vibration pattern for group messages.</p>
           </div>
           
           <div className="vibrate-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupVibrate"
                   id="groupVibrateOff"
                   checked={chatSettings?.group_vibrate === 'off' || !chatSettings?.group_vibrate}
                   onChange={() => handleSettingToggle('flat', 'group_vibrate', 'off')}
                 />
                 <label className="form-check-label" htmlFor="groupVibrateOff">
                   <strong>Off</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupVibrate"
                   id="groupVibrateDefault"
                   checked={chatSettings?.group_vibrate === 'default'}
                   onChange={() => handleSettingToggle('flat', 'group_vibrate', 'default')}
                 />
                 <label className="form-check-label" htmlFor="groupVibrateDefault">
                   <strong>Default</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupVibrate"
                   id="groupVibrateShort"
                   checked={chatSettings?.group_vibrate === 'short'}
                   onChange={() => handleSettingToggle('flat', 'group_vibrate', 'short')}
                 />
                 <label className="form-check-label" htmlFor="groupVibrateShort">
                   <strong>Short</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupVibrate"
                   id="groupVibrateLong"
                   checked={chatSettings?.group_vibrate === 'long'}
                   onChange={() => handleSettingToggle('flat', 'group_vibrate', 'long')}
                 />
                 <label className="form-check-label" htmlFor="groupVibrateLong">
                   <strong>Long</strong>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Group Light Modal */}
     <Modal show={showGroupLightModal} onHide={() => setShowGroupLightModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Group Light</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="light-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:bulb" className="fs-48 text-warning mb-3" />
             <h5>Group Light Color</h5>
             <p className="text-muted">Choose the light color for group notifications.</p>
           </div>
           
           <div className="light-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupLight"
                   id="groupLightDark"
                   checked={chatSettings?.group_light_color === 'dark' || !chatSettings?.group_light_color}
                   onChange={() => handleSettingToggle('flat', 'group_light_color', 'dark')}
                 />
                 <label className="form-check-label" htmlFor="groupLightDark">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: '#333'}}></div>
                     <strong>Dark</strong>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupLight"
                   id="groupLightWhite"
                   checked={chatSettings?.group_light_color === 'white'}
                   onChange={() => handleSettingToggle('flat', 'group_light_color', 'white')}
                 />
                 <label className="form-check-label" htmlFor="groupLightWhite">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: 'white', border: '1px solid #ddd'}}></div>
                     <strong>White</strong>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupLight"
                   id="groupLightBlue"
                   checked={chatSettings?.group_light_color === 'blue'}
                   onChange={() => handleSettingToggle('flat', 'group_light_color', 'blue')}
                 />
                 <label className="form-check-label" htmlFor="groupLightBlue">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: 'blue'}}></div>
                     <strong>Blue</strong>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="groupLight"
                   id="groupLightGreen"
                   checked={chatSettings?.group_light_color === 'green'}
                   onChange={() => handleSettingToggle('flat', 'group_light_color', 'green')}
                 />
                 <label className="form-check-label" htmlFor="groupLightGreen">
                   <div className="d-flex align-items-center">
                     <div className="rounded-circle me-2" style={{width: '20px', height: '20px', backgroundColor: 'green'}}></div>
                     <strong>Green</strong>
                   </div>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Call Ringtone Modal */}
     <Modal show={showCallRingtoneModal} onHide={() => setShowCallRingtoneModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Call Ringtone</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="ringtone-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:phone" className="fs-48 text-primary mb-3" />
             <h5>Select Call Ringtone</h5>
             <p className="text-muted">Choose the ringtone for incoming calls.</p>
           </div>
           
           <div className="ringtone-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callRingtone"
                   id="callRingtoneDefault"
                   checked={chatSettings?.call_ringtone === 'default' || !chatSettings?.call_ringtone}
                   onChange={() => handleSettingToggle('flat', 'call_ringtone', 'default')}
                 />
                 <label className="form-check-label" htmlFor="callRingtoneDefault">
                   <strong>Default ringtone</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callRingtone"
                   id="callRingtoneClassic"
                   checked={chatSettings?.call_ringtone === 'classic'}
                   onChange={() => handleSettingToggle('flat', 'call_ringtone', 'classic')}
                 />
                 <label className="form-check-label" htmlFor="callRingtoneClassic">
                   <strong>Classic ring</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callRingtone"
                   id="callRingtoneModern"
                   checked={chatSettings?.call_ringtone === 'modern'}
                   onChange={() => handleSettingToggle('flat', 'call_ringtone', 'modern')}
                 />
                 <label className="form-check-label" htmlFor="callRingtoneModern">
                   <strong>Modern ring</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callRingtone"
                   id="callRingtoneMusic"
                   checked={chatSettings?.call_ringtone === 'music'}
                   onChange={() => handleSettingToggle('flat', 'call_ringtone', 'music')}
                 />
                 <label className="form-check-label" htmlFor="callRingtoneMusic">
                   <strong>Music tone</strong>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Call Vibrate Modal */}
     <Modal show={showCallVibrateModal} onHide={() => setShowCallVibrateModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Call Vibrate</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="vibrate-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:mobile-vibration" className="fs-48 text-info mb-3" />
             <h5>Call Vibration Pattern</h5>
             <p className="text-muted">Choose vibration pattern for incoming calls.</p>
           </div>
           
           <div className="vibrate-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callVibrate"
                   id="callVibrateDefault"
                   checked={chatSettings?.call_vibrate === 'default' || !chatSettings?.call_vibrate}
                   onChange={() => handleSettingToggle('flat', 'call_vibrate', 'default')}
                 />
                 <label className="form-check-label" htmlFor="callVibrateDefault">
                   <strong>Default</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callVibrate"
                   id="callVibrateShort"
                   checked={chatSettings?.call_vibrate === 'short'}
                   onChange={() => handleSettingToggle('flat', 'call_vibrate', 'short')}
                 />
                 <label className="form-check-label" htmlFor="callVibrateShort">
                   <strong>Short</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callVibrate"
                   id="callVibrateLong"
                   checked={chatSettings?.call_vibrate === 'long'}
                   onChange={() => handleSettingToggle('flat', 'call_vibrate', 'long')}
                 />
                 <label className="form-check-label" htmlFor="callVibrateLong">
                   <strong>Long</strong>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="callVibrate"
                   id="callVibrateOff"
                   checked={chatSettings?.call_vibrate === 'off'}
                   onChange={() => handleSettingToggle('flat', 'call_vibrate', 'off')}
                 />
                 <label className="form-check-label" htmlFor="callVibrateOff">
                   <strong>Off</strong>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Storage and Data Modals */}
     
     {/* Manage Storage Modal */}
     <Modal show={showManageStorageModal} onHide={() => setShowManageStorageModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Manage Storage</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="storage-management">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:folder" className="fs-48 text-primary mb-3" />
             <h5>Storage Usage</h5>
             <p className="text-muted">Manage your chat data storage.</p>
           </div>
           
           <div className="storage-breakdown">
             <div className="mb-3">
               <div className="d-flex justify-content-between">
                 <span>Total Storage Used</span>
                 <strong>{formattedStorage?.storageUsed || '0 MB'}</strong>
               </div>
               <div className="progress mt-2" style={{height: '8px'}}>
                 <div className="progress-bar" role="progressbar" style={{width: '15%'}}></div>
               </div>
               <small className="text-muted">15% of available storage</small>
             </div>
             
             <hr />
             
             <div className="storage-categories">
               <div className="mb-2 d-flex justify-content-between">
                 <span>
                   <IconifyIcon icon="bx:message" className="me-2" />
                   Messages
                 </span>
                 <span>128 MB</span>
               </div>
               <div className="mb-2 d-flex justify-content-between">
                 <span>
                   <IconifyIcon icon="bx:image" className="me-2" />
                   Photos
                 </span>
                 <span>512 MB</span>
               </div>
               <div className="mb-2 d-flex justify-content-between">
                 <span>
                   <IconifyIcon icon="bx:video" className="me-2" />
                   Videos
                 </span>
                 <span>1.2 GB</span>
               </div>
               <div className="mb-2 d-flex justify-content-between">
                 <span>
                   <IconifyIcon icon="bx:file" className="me-2" />
                   Documents
                 </span>
                 <span>64 MB</span>
               </div>
               <div className="mb-2 d-flex justify-content-between">
                 <span>
                   <IconifyIcon icon="bx:music" className="me-2" />
                   Audio
                 </span>
                 <span>256 MB</span>
               </div>
             </div>
             
             <hr />
             
             <div className="storage-actions">
               <button className="btn btn-outline-warning w-100 mb-2">
                 <IconifyIcon icon="bx:trash" className="me-2" />
                 Clear Cache (45 MB)
               </button>
               <button className="btn btn-outline-danger w-100">
                 <IconifyIcon icon="bx:trash-alt" className="me-2" />
                 Clear All Media
               </button>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Network Usage Modal */}
     <Modal show={showNetworkUsageModal} onHide={() => setShowNetworkUsageModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Network Usage</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="network-usage">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:wifi" className="fs-48 text-info mb-3" />
             <h5>Data Usage Statistics</h5>
             <p className="text-muted">Monitor your network data consumption.</p>
           </div>
           
           <div className="usage-stats">
             <div className="row">
               <div className="col-6">
                 <div className="card bg-light border-0 text-center p-3">
                   <IconifyIcon icon="bx:upload" className="fs-32 text-success mb-2" />
                   <h6>Data Sent</h6>
                   <strong>{formattedStorage?.networkUsage?.sent || '0 MB'}</strong>
                 </div>
               </div>
               <div className="col-6">
                 <div className="card bg-light border-0 text-center p-3">
                   <IconifyIcon icon="bx:download" className="fs-32 text-primary mb-2" />
                   <h6>Data Received</h6>
                   <strong>{formattedStorage?.networkUsage?.received || '0 MB'}</strong>
                 </div>
               </div>
             </div>
             
             <hr />
             
             <div className="usage-breakdown">
               <h6>This Month</h6>
               <div className="mb-2 d-flex justify-content-between">
                 <span>Messages</span>
                 <span>12 MB</span>
               </div>
               <div className="mb-2 d-flex justify-content-between">
                 <span>Media Downloads</span>
                 <span>1.8 GB</span>
               </div>
               <div className="mb-2 d-flex justify-content-between">
                 <span>Voice Calls</span>
                 <span>256 MB</span>
               </div>
               <div className="mb-2 d-flex justify-content-between">
                 <span>Video Calls</span>
                 <span>1.2 GB</span>
               </div>
             </div>
             
             <hr />
             
             <div className="usage-actions">
               <button className="btn btn-outline-primary w-100">
                 <IconifyIcon icon="bx:reset" className="me-2" />
                 Reset Statistics
               </button>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Mobile Data Auto-Download Modal */}
     <Modal show={showMobileDataModal} onHide={() => setShowMobileDataModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Mobile Data Auto-Download</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="auto-download-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:mobile" className="fs-48 text-warning mb-3" />
             <h5>Mobile Data Settings</h5>
             <p className="text-muted">Choose what to auto-download when using mobile data.</p>
           </div>
           
           <div className="download-options">
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:image" className="me-2" />
                   <span>Photos</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                                         checked={(chatSettings?.auto_download_mobile as any)?.photos || false}
                    onChange={(e) => {
                      const currentSettings = (chatSettings?.auto_download_mobile as any) || {};
                      handleSettingToggle('flat', 'auto_download_mobile', {
                        ...currentSettings,
                        photos: e.target.checked
                      });
                    }}
                   />
                 </div>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:video" className="me-2" />
                   <span>Videos</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                                           checked={(chatSettings?.auto_download_mobile as any)?.videos || false}
                      onChange={(e) => {
                        const currentSettings = (chatSettings?.auto_download_mobile as any) || {};
                        handleSettingToggle('flat', 'auto_download_mobile', {
                          ...currentSettings,
                          videos: e.target.checked
                        });
                      }}
                   />
                 </div>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:music" className="me-2" />
                   <span>Audio</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_mobile?.audio !== false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_mobile as any || {};
                       handleSettingToggle('flat', 'auto_download_mobile', {
                         ...currentSettings,
                         audio: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
               <small className="text-muted">Voice messages are always downloaded</small>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:file" className="me-2" />
                   <span>Documents</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_mobile?.documents || false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_mobile as any || {};
                       handleSettingToggle('flat', 'auto_download_mobile', {
                         ...currentSettings,
                         documents: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Wi-Fi Auto-Download Modal */}
     <Modal show={showWifiModal} onHide={() => setShowWifiModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Wi-Fi Auto-Download</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="auto-download-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:wifi" className="fs-48 text-success mb-3" />
             <h5>Wi-Fi Settings</h5>
             <p className="text-muted">Choose what to auto-download when connected to Wi-Fi.</p>
           </div>
           
           <div className="download-options">
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:image" className="me-2" />
                   <span>Photos</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_wifi?.photos !== false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_wifi as any || {};
                       handleSettingToggle('flat', 'auto_download_wifi', {
                         ...currentSettings,
                         photos: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:video" className="me-2" />
                   <span>Videos</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_wifi?.videos || false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_wifi as any || {};
                       handleSettingToggle('flat', 'auto_download_wifi', {
                         ...currentSettings,
                         videos: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:music" className="me-2" />
                   <span>Audio</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_wifi?.audio !== false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_wifi as any || {};
                       handleSettingToggle('flat', 'auto_download_wifi', {
                         ...currentSettings,
                         audio: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
               <small className="text-muted">Voice messages are always downloaded</small>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:file" className="me-2" />
                   <span>Documents</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_wifi?.documents || false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_wifi as any || {};
                       handleSettingToggle('flat', 'auto_download_wifi', {
                         ...currentSettings,
                         documents: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Roaming Auto-Download Modal */}
     <Modal show={showRoamingModal} onHide={() => setShowRoamingModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Roaming Auto-Download</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="auto-download-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:globe" className="fs-48 text-danger mb-3" />
             <h5>Roaming Settings</h5>
             <p className="text-muted">Choose what to auto-download when roaming abroad.</p>
           </div>
           
           <div className="download-options">
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:image" className="me-2" />
                   <span>Photos</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_roaming?.photos || false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_roaming as any || {};
                       handleSettingToggle('flat', 'auto_download_roaming', {
                         ...currentSettings,
                         photos: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:video" className="me-2" />
                   <span>Videos</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_roaming?.videos || false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_roaming as any || {};
                       handleSettingToggle('flat', 'auto_download_roaming', {
                         ...currentSettings,
                         videos: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:music" className="me-2" />
                   <span>Audio</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_roaming?.audio !== false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_roaming as any || {};
                       handleSettingToggle('flat', 'auto_download_roaming', {
                         ...currentSettings,
                         audio: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
               <small className="text-muted">Voice messages are always downloaded</small>
             </div>
             
             <div className="mb-3">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <IconifyIcon icon="bx:file" className="me-2" />
                   <span>Documents</span>
                 </div>
                 <div className="form-check form-switch">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     checked={chatSettings?.auto_download_roaming?.documents || false}
                     onChange={(e) => {
                       const currentSettings = chatSettings?.auto_download_roaming as any || {};
                       handleSettingToggle('flat', 'auto_download_roaming', {
                         ...currentSettings,
                         documents: e.target.checked
                       });
                     }}
                   />
                 </div>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     
     {/* Photo Upload Quality Modal */}
     <Modal show={showPhotoQualityModal} onHide={() => setShowPhotoQualityModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Photo Upload Quality</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="photo-quality-settings">
           <div className="mb-4 text-center">
             <IconifyIcon icon="bx:image" className="fs-48 text-primary mb-3" />
             <h5>Upload Quality</h5>
             <p className="text-muted">Choose the quality of photos you send.</p>
           </div>
           
           <div className="quality-options">
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="photoQuality"
                   id="qualityAuto"
                   checked={chatSettings?.photo_upload_quality === 'auto' || !chatSettings?.photo_upload_quality}
                   onChange={() => handleSettingToggle('flat', 'photo_upload_quality', 'auto')}
                 />
                 <label className="form-check-label" htmlFor="qualityAuto">
                   <div>
                     <strong>Auto (recommended)</strong>
                     <div className="text-muted small">Automatically adjust quality based on network</div>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="photoQuality"
                   id="qualityHigh"
                   checked={chatSettings?.photo_upload_quality === 'high'}
                   onChange={() => handleSettingToggle('flat', 'photo_upload_quality', 'high')}
                 />
                 <label className="form-check-label" htmlFor="qualityHigh">
                   <div>
                     <strong>High quality</strong>
                     <div className="text-muted small">Best image quality, uses more data</div>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="photoQuality"
                   id="qualityMedium"
                   checked={chatSettings?.photo_upload_quality === 'medium'}
                   onChange={() => handleSettingToggle('flat', 'photo_upload_quality', 'medium')}
                 />
                 <label className="form-check-label" htmlFor="qualityMedium">
                   <div>
                     <strong>Medium quality</strong>
                     <div className="text-muted small">Balanced quality and file size</div>
                   </div>
                 </label>
               </div>
             </div>
             
             <div className="mb-3">
               <div className="form-check">
                 <input
                   className="form-check-input"
                   type="radio"
                   name="photoQuality"
                   id="qualityLow"
                   checked={chatSettings?.photo_upload_quality === 'low'}
                   onChange={() => handleSettingToggle('flat', 'photo_upload_quality', 'low')}
                 />
                 <label className="form-check-label" htmlFor="qualityLow">
                   <div>
                     <strong>Data saver</strong>
                     <div className="text-muted small">Smaller file size, reduced quality</div>
                   </div>
                 </label>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>

     {/* Help Center Modal */}
     <Modal show={showHelpCenterModal} onHide={() => setShowHelpCenterModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Help Center</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="help-center">
           <div className="mb-4">
             <h6 className="mb-3">Frequently Asked Questions</h6>
             <div className="row">
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <h6 className="card-title">How do I change my notification settings?</h6>
                     <p className="card-text small text-muted">Go to Settings &gt; Notifications to customize your notification preferences.</p>
                   </div>
                 </div>
               </div>
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <h6 className="card-title">How do I backup my chat history?</h6>
                     <p className="card-text small text-muted">Enable chat backup in Settings &gt; Chats &gt; Chat backup to automatically save your conversations.</p>
                   </div>
                 </div>
               </div>
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <h6 className="card-title">How do I manage my storage?</h6>
                     <p className="card-text small text-muted">Visit Settings &gt; Storage and Data to view and manage your storage usage.</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">My Favorites</h6>
             {chatSettings?.help_center_favorites && Array.isArray(chatSettings.help_center_favorites) && chatSettings.help_center_favorites.length > 0 ? (
               <div className="row">
                 {chatSettings.help_center_favorites.map((article: any, index: number) => (
                   <div key={index} className="col-12 mb-2">
                     <div className="d-flex align-items-center">
                       <IconifyIcon icon="bx:heart" className="fs-16 text-danger me-2" />
                       <div>
                         <div className="fw-medium">{article.title}</div>
                         <div className="text-muted small">{article.category} • {article.views} views</div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-muted text-center py-3">
                 <IconifyIcon icon="bx:heart" className="fs-24 mb-2" />
                 <div>No favorite articles yet</div>
               </div>
             )}
           </div>
           
           <div className="mb-3">
             <h6 className="mb-3">Recent Searches</h6>
             {chatSettings?.help_center_search_history && Array.isArray(chatSettings.help_center_search_history) && chatSettings.help_center_search_history.length > 0 ? (
               <div className="row">
                 {chatSettings.help_center_search_history.slice(0, 5).map((search: any, index: number) => (
                   <div key={index} className="col-12 mb-2">
                     <div className="d-flex align-items-center">
                       <IconifyIcon icon="bx:search" className="fs-16 text-primary me-2" />
                       <div>
                         <div className="fw-medium">{search.query}</div>
                         <div className="text-muted small">{search.results} results found</div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-muted text-center py-3">
                 <IconifyIcon icon="bx:search" className="fs-24 mb-2" />
                 <div>No recent searches</div>
               </div>
             )}
           </div>
         </div>
       </ModalBody>
     </Modal>

     {/* Contact Us Modal */}
     <Modal show={showContactUsModal} onHide={() => setShowContactUsModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Contact Us</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="contact-us">
           <div className="mb-4">
             <h6 className="mb-3">Get in Touch</h6>
             <div className="row">
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <div className="d-flex align-items-center">
                       <div className="flex-shrink-0">
                         <IconifyIcon icon="bx:envelope" className="fs-20 text-primary" />
                       </div>
                       <div className="flex-grow-1 ms-3">
                         <h6 className="mb-1">Email Support</h6>
                         <p className="mb-0 text-muted">support@example.com</p>
                         <small className="text-muted">Response time: 24 hours</small>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <div className="d-flex align-items-center">
                       <div className="flex-shrink-0">
                         <IconifyIcon icon="bx:phone" className="fs-20 text-success" />
                       </div>
                       <div className="flex-grow-1 ms-3">
                         <h6 className="mb-1">Phone Support</h6>
                         <p className="mb-0 text-muted">+1-800-SUPPORT</p>
                         <small className="text-muted">Available 24/7</small>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <div className="d-flex align-items-center">
                       <div className="flex-shrink-0">
                         <IconifyIcon icon="bx:chat" className="fs-20 text-info" />
                       </div>
                       <div className="flex-grow-1 ms-3">
                         <h6 className="mb-1">Live Chat</h6>
                         <p className="mb-0 text-muted">Available 9 AM - 5 PM</p>
                         <small className="text-muted">Get instant help</small>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">Contact Preferences</h6>
             <div className="row">
               <div className="col-12 mb-3">
                 <label className="form-label">Preferred Contact Method</label>
                 <select 
                   className="form-select"
                   value={chatSettings?.contact_preferences?.method || 'email'}
                   onChange={(e) => {
                     const preferences = chatSettings?.contact_preferences || {};
                     handleSettingToggle('flat', 'contact_preferences', { ...preferences, method: e.target.value });
                   }}
                 >
                   <option value="email">Email</option>
                   <option value="phone">Phone</option>
                   <option value="chat">Live Chat</option>
                 </select>
               </div>
               
               <div className="col-12 mb-3">
                 <label className="form-label">Language</label>
                 <select 
                   className="form-select"
                   value={chatSettings?.contact_preferences?.language || 'en'}
                   onChange={(e) => {
                     const preferences = chatSettings?.contact_preferences || {};
                     handleSettingToggle('flat', 'contact_preferences', { ...preferences, language: e.target.value });
                   }}
                 >
                   <option value="en">English</option>
                   <option value="es">Spanish</option>
                   <option value="fr">French</option>
                   <option value="de">German</option>
                 </select>
               </div>
               
               <div className="col-12 mb-3">
                 <label className="form-label">Priority</label>
                 <select 
                   className="form-select"
                   value={chatSettings?.contact_preferences?.priority || 'medium'}
                   onChange={(e) => {
                     const preferences = chatSettings?.contact_preferences || {};
                     handleSettingToggle('flat', 'contact_preferences', { ...preferences, priority: e.target.value });
                   }}
                 >
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                 </select>
               </div>
               
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="contactNotifications"
                     checked={chatSettings?.contact_preferences?.notifications || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.contact_preferences || {};
                       handleSettingToggle('flat', 'contact_preferences', { ...preferences, notifications: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="contactNotifications">
                     Receive notifications about my support requests
                   </label>
                 </div>
               </div>
               
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="businessHours"
                     checked={chatSettings?.contact_preferences?.business_hours_only || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.contact_preferences || {};
                       handleSettingToggle('flat', 'contact_preferences', { ...preferences, business_hours_only: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="businessHours">
                     Contact me only during business hours
                   </label>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>

     {/* Privacy Policy Modal */}
     <Modal show={showPrivacyPolicyModal} onHide={() => setShowPrivacyPolicyModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>Terms and Privacy Policy</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="privacy-policy">
           <div className="mb-4">
             <h6 className="mb-3">Privacy Policy Status</h6>
             <div className="card border-0 bg-light">
               <div className="card-body">
                 <div className="d-flex align-items-center">
                   <div className="flex-shrink-0">
                     <IconifyIcon 
                       icon={chatSettings?.privacy_policy_accepted ? "bx:check-circle" : "bx:x-circle"} 
                       className={`fs-20 ${chatSettings?.privacy_policy_accepted ? "text-success" : "text-danger"}`} 
                     />
                   </div>
                   <div className="flex-grow-1 ms-3">
                     <h6 className="mb-1">
                       {chatSettings?.privacy_policy_accepted ? "Accepted" : "Not Accepted"}
                     </h6>
                     <p className="mb-0 text-muted">
                       {chatSettings?.privacy_policy_last_viewed 
                         ? `Last viewed: ${new Date(chatSettings.privacy_policy_last_viewed).toLocaleDateString()}`
                         : "Never viewed"
                       }
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">Data Collection and Usage</h6>
             <div className="text-muted">
               <p>We collect and use your personal information to:</p>
               <ul>
                 <li>Provide and improve our chat services</li>
                 <li>Ensure security and prevent fraud</li>
                 <li>Comply with legal obligations</li>
                 <li>Analyze usage patterns to enhance user experience</li>
               </ul>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">Data Storage and Security</h6>
             <div className="text-muted">
               <p>Your data is:</p>
               <ul>
                 <li>Encrypted both in transit and at rest</li>
                 <li>Stored on secure servers with restricted access</li>
                 <li>Backed up regularly to prevent data loss</li>
                 <li>Retained only for as long as necessary</li>
               </ul>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">Your Rights</h6>
             <div className="text-muted">
               <p>You have the right to:</p>
               <ul>
                 <li>Access your personal data</li>
                 <li>Request corrections to inaccurate data</li>
                 <li>Delete your account and associated data</li>
                 <li>Export your data in a portable format</li>
               </ul>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">Third-Party Integrations</h6>
             <div className="text-muted">
               <p>We may share limited data with trusted third parties to:</p>
               <ul>
                 <li>Provide essential service functionality</li>
                 <li>Analyze usage patterns (anonymized data only)</li>
                 <li>Ensure service security and reliability</li>
               </ul>
             </div>
           </div>
           
           <div className="mb-3">
             <div className="form-check">
               <input
                 className="form-check-input"
                 type="checkbox"
                 id="acceptPrivacy"
                 checked={chatSettings?.privacy_policy_accepted || false}
                 onChange={(e) => {
                   handleSettingToggle('flat', 'privacy_policy_accepted', e.target.checked);
                   if (e.target.checked) {
                     handleSettingToggle('flat', 'privacy_policy_last_viewed', new Date().toISOString());
                   }
                 }}
               />
               <label className="form-check-label" htmlFor="acceptPrivacy">
                 I have read and accept the Terms and Privacy Policy
               </label>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>

     {/* App Info Modal */}
     <Modal show={showAppInfoModal} onHide={() => setShowAppInfoModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>App Information</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="app-info">
           <div className="mb-4">
             <h6 className="mb-3">Application Details</h6>
             <div className="row">
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <div className="d-flex justify-content-between align-items-center">
                       <div>
                         <div className="fw-medium">Version</div>
                         <div className="text-muted">2.4.1</div>
                       </div>
                       <div className="text-end">
                         <div className="fw-medium">Build</div>
                         <div className="text-muted">1234</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="col-12 mb-3">
                 <div className="card border-0 bg-light">
                   <div className="card-body">
                     <div className="d-flex justify-content-between align-items-center">
                       <div>
                         <div className="fw-medium">Release Date</div>
                         <div className="text-muted">January 15, 2024</div>
                       </div>
                       <div className="text-end">
                         <div className="fw-medium">Developer</div>
                         <div className="text-muted">BVerse Technologies</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">Key Features</h6>
             <div className="row">
               <div className="col-12 mb-2">
                 <div className="d-flex align-items-center">
                   <IconifyIcon icon="bx:message-dots" className="fs-16 text-primary me-2" />
                   <span>Real-time messaging</span>
                 </div>
               </div>
               <div className="col-12 mb-2">
                 <div className="d-flex align-items-center">
                   <IconifyIcon icon="bx:file" className="fs-16 text-success me-2" />
                   <span>File sharing</span>
                 </div>
               </div>
               <div className="col-12 mb-2">
                 <div className="d-flex align-items-center">
                   <IconifyIcon icon="bx:phone" className="fs-16 text-info me-2" />
                   <span>Voice & video calls</span>
                 </div>
               </div>
               <div className="col-12 mb-2">
                 <div className="d-flex align-items-center">
                   <IconifyIcon icon="bx:group" className="fs-16 text-warning me-2" />
                   <span>Group conversations</span>
                 </div>
               </div>
               <div className="col-12 mb-2">
                 <div className="d-flex align-items-center">
                   <IconifyIcon icon="bx:shield" className="fs-16 text-danger me-2" />
                   <span>End-to-end encryption</span>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">System Requirements</h6>
             <div className="text-muted">
               <div className="mb-2"><strong>Mobile:</strong> iOS 14+ or Android 8+</div>
               <div className="mb-2"><strong>Web:</strong> Modern browsers (Chrome, Firefox, Safari, Edge)</div>
               <div className="mb-2"><strong>Storage:</strong> 100 MB available space</div>
               <div className="mb-2"><strong>Network:</strong> Internet connection required</div>
             </div>
           </div>
           
           <div className="mb-4">
             <h6 className="mb-3">App Preferences</h6>
             <div className="row">
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="showVersion"
                     checked={chatSettings?.app_info_preferences?.show_version || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.app_info_preferences || {};
                       handleSettingToggle('flat', 'app_info_preferences', { ...preferences, show_version: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="showVersion">
                     Show version in app settings
                   </label>
                 </div>
               </div>
               
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="showUpdates"
                     checked={chatSettings?.app_info_preferences?.show_updates || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.app_info_preferences || {};
                       handleSettingToggle('flat', 'app_info_preferences', { ...preferences, show_updates: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="showUpdates">
                     Show update notifications
                   </label>
                 </div>
               </div>
               
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="autoUpdate"
                     checked={chatSettings?.app_info_preferences?.auto_update || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.app_info_preferences || {};
                       handleSettingToggle('flat', 'app_info_preferences', { ...preferences, auto_update: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="autoUpdate">
                     Automatic updates
                   </label>
                 </div>
               </div>
               
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="betaFeatures"
                     checked={chatSettings?.app_info_preferences?.beta_features || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.app_info_preferences || {};
                       handleSettingToggle('flat', 'app_info_preferences', { ...preferences, beta_features: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="betaFeatures">
                     Enable beta features
                   </label>
                 </div>
               </div>
               
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="crashReports"
                     checked={chatSettings?.app_info_preferences?.crash_reports || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.app_info_preferences || {};
                       handleSettingToggle('flat', 'app_info_preferences', { ...preferences, crash_reports: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="crashReports">
                     Send crash reports
                   </label>
                 </div>
               </div>
               
               <div className="col-12 mb-3">
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="usageAnalytics"
                     checked={chatSettings?.app_info_preferences?.usage_analytics || false}
                     onChange={(e) => {
                       const preferences = chatSettings?.app_info_preferences || {};
                       handleSettingToggle('flat', 'app_info_preferences', { ...preferences, usage_analytics: e.target.checked });
                     }}
                   />
                   <label className="form-check-label" htmlFor="usageAnalytics">
                     Share usage analytics
                   </label>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>

     {/* QR Code Modal */}
     <Modal show={showQRCodeModal} onHide={() => setShowQRCodeModal(false)} centered>
       <ModalHeader closeButton>
         <ModalTitle>My QR Code</ModalTitle>
       </ModalHeader>
       <ModalBody>
         <div className="qr-code-container text-center">
           <div className="mb-4">
             <div className="d-flex align-items-center justify-content-center mb-3">
               <Image
                 src={currentUserAvatar}
                 className="rounded-circle me-3"
                 height={50}
                 width={50}
                 alt="User Avatar"
               />
               <div>
                 <h6 className="mb-0">{currentUserName}</h6>
                 <p className="text-muted mb-0 small">{currentUserRole}</p>
               </div>
             </div>
           </div>
           <div className="mb-4">
             <div className="p-3 bg-white border rounded d-inline-block">
               {qrCodeDataUrl ? (
                 <Image
                   src={qrCodeDataUrl}
                   alt="QR Code"
                   width={200}
                   height={200}
                 />
               ) : (
                 <div className="d-flex align-items-center justify-content-center text-muted" style={{ width: 200, height: 200 }}>
                   <IconifyIcon icon="ri:qr-code-line" className="fs-1" />
                 </div>
               )}
             </div>
           </div>
           <div className="mb-3">
             <h6 className="mb-2">Scan to share my Nirvana Chat profile</h6>
             <p className="text-muted small mb-0">
               This QR code contains your live admin contact payload for internal sharing and support workflows.
             </p>
           </div>
           <div className="row">
             <div className="col-6">
               <button 
                 className="btn btn-outline-primary w-100 btn-sm"
                 onClick={async () => {
                   await navigator.clipboard.writeText(JSON.stringify(qrContactPayload));
                   toast.success("Contact payload copied.");
                 }}
               >
                 <IconifyIcon icon="bx:copy" className="me-1" />
                 Copy Data
               </button>
             </div>
             <div className="col-6">
               <button 
                 className="btn btn-primary w-100 btn-sm"
                 onClick={async () => {
                   if (navigator.share) {
                     await navigator.share({
                       title: `${currentUserName} on Nirvana Chat`,
                       text: `${currentUserName} (${currentUserRole})`,
                       url: typeof window !== "undefined" ? window.location.href : undefined,
                     });
                     return;
                   }

                   await navigator.clipboard.writeText(JSON.stringify(qrContactPayload));
                   toast.success("Contact payload copied.");
                 }}
               >
                 <IconifyIcon icon="bx:share" className="me-1" />
                 Share
               </button>
             </div>
           </div>
         </div>
       </ModalBody>
     </Modal>
     </>
   );
 };
 
 export default ChatLeftSidebar;
