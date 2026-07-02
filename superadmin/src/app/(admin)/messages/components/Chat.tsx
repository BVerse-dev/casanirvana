import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import type { ChatUser } from "@/hooks/useProfiles";
import { timeSince } from "@/utils/date";
import Image from "next/image";

type ChatUsersProps = {
  onUserSelect: (value: ChatUser) => void;
  users: ChatUser[];
  selectedUser: ChatUser;
};

const Chat = ({ onUserSelect, users, selectedUser }: ChatUsersProps) => {
  return (
    <SimplebarReactClient className="px-2 mb-3 chat-setting-height">
      {users.map((user, idx) => (
        <div
          className={`d-flex flex-column h-100 ${users.length - 1 != idx && "border-bottom"}`}
          key={idx}
        >
          <button
            type="button"
            className="d-block w-100 border-0 bg-transparent text-start p-0"
            onClick={() => {
              onUserSelect(user);
            }}
          >
            <div
              className={`d-flex align-items-center px-2 pb-2 mb-1 ${idx == 0 ? "" : "p-2"} rounded`}
            >
              <div className="position-relative">
                <Image
                  src={user.avatar}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="avatar rounded-circle flex-shrink-0"
                />
                <span className={`position-absolute bottom-0 end-0 p-1 ${user.activityStatus === "online" ? "bg-success" : "bg-secondary"} border border-light border-2 rounded-circle`}>
                  <span className="visually-hidden">{user.activityStatus}</span>
                </span>
              </div>
              <div className="d-block ms-3 flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h5 className="mb-0">{user.name}</h5>
                  <div>
                    <p className="text-muted fs-13 mb-0">
                      {timeSince(new Date(user.time))}
                    </p>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  {user.message?.toLowerCase() === "typing..." &&
                  selectedUser.id === user.id ? (
                    <span className="w-75 text-primary">typing...</span>
                  ) : (
                    <>
                      <p className="mb-0 text-muted d-flex align-items-center gap-1 d-flex align-items-center gap-1">
                        {user.chatIcon && (
                          <IconifyIcon
                            icon={user.chatIcon}
                            className="text-warning fs-18"
                          />
                        )}{" "}
                        {user.message}
                      </p>
                      <div>
                        {typeof (user as any).unreadCount === "number" && (user as any).unreadCount > 0 ? (
                          <span className="badge bg-danger">{(user as any).unreadCount}</span>
                        ) : (
                          <IconifyIcon icon="ri:check-double-line" className="fs-18 text-primary" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
      ))}
    </SimplebarReactClient>
  );
};

export default Chat;
