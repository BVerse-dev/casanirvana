import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  Tab,
  Tabs,
} from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper/modules";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useMessageStats } from "@/hooks/useMessages";
import type { ChatUser } from "@/hooks/useProfiles";
import Chat from "./Chat";
import Contact from "./Contact";
import Group from "./Group";
import Image from "next/image";
import "swiper/css";
import "swiper/css/free-mode";

const activeContactStyles = `
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

  .active-contacts-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    padding: 4px 8px;
  }

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

  .active-contact-container {
    padding: 6px;
    border-radius: 12px;
    transition: all 0.2s ease;
    position: relative;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

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
`;

type ChatUsersProps = {
  onUserSelect: (value: ChatUser) => void;
  users: ChatUser[];
  selectedUser: ChatUser;
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
  const [searchText, setSearchText] = useState("");
  const { data: messageStats, isLoading: statsLoading } = useMessageStats();

  const filteredUsers = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();
    if (!normalized) {
      return users;
    }

    return users.filter((user) => user.name.toLowerCase().includes(normalized));
  }, [searchText, users]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: activeContactStyles }} />

      <Card className="position-relative overflow-hidden">
        <CardHeader className="border-0 d-flex justify-content-between align-items-center gap-3">
          <form
            className="chat-search pb-0 flex-grow-1"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="chat-search-box">
              <input
                className="form-control"
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                name="search"
                placeholder="Search conversations..."
              />
              <button
                type="button"
                className="btn btn-sm btn-link search-icon p-0 fs-15"
              >
                <IconifyIcon icon="ri:search-eye-line" />
              </button>
            </div>
          </form>
          <span className="text-muted fs-12 d-inline-flex align-items-center">
            <IconifyIcon icon="ri:settings-5-line" className="me-1" />
            Settings finalize later
          </span>
        </CardHeader>

        <CardTitle as={"h4"} className="mx-3 mb-3 d-flex align-items-center justify-content-between">
          <span>Active</span>
          <small className="text-muted fs-12">
            <IconifyIcon icon="ri:drag-move-2-line" className="fs-12 me-1" />
            Scroll
          </small>
        </CardTitle>

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
                      style={{ cursor: "pointer" }}
                      onClick={() => onUserSelect(user)}
                      title={user.name}
                    >
                      <span className="position-relative d-inline-block">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="avatar rounded-circle flex-shrink-0 border border-2 border-white shadow-sm"
                        />
                        <span
                          className={`position-absolute bottom-0 end-0 p-1 ${user.activityStatus === "online" ? "bg-success" : "bg-secondary"} border border-white border-2 rounded-circle`}
                        >
                          <span className="visually-hidden">{user.activityStatus}</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <CardTitle as={"h4"} className="mx-3 mt-4 mb-3 d-flex align-items-center justify-content-between">
          <span>
            Message{" "}
            {statsLoading ? (
              <span className="badge bg-secondary badge-pill message-stats-badge">
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                  style={{ width: "10px", height: "10px" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </span>
            ) : (
              <span
                className={`badge badge-pill message-stats-badge ${
                  (messageStats?.activeChats || 0) > 0 ? "bg-danger" : "bg-secondary"
                }`}
              >
                {messageStats?.activeChats || 0}
              </span>
            )}
          </span>
          {messageStats && (
            <small className="text-muted fs-12 d-flex align-items-center">
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
            <Chat onUserSelect={onUserSelect} users={filteredUsers} selectedUser={selectedUser} />
          </Tab>
          <Tab title="Group" eventKey={"group-tab"}>
            <Group onGroupSelect={onGroupSelect} />
          </Tab>
          <Tab title="Contact" eventKey={"contact-tab"}>
            <Contact onContactSelect={onContactSelect} />
          </Tab>
        </Tabs>
      </Card>
    </>
  );
};

export default ChatLeftSidebar;
