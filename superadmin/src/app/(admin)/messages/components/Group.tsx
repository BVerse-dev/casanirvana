import Link from "next/link";
import { useState } from "react";
import { Modal, Button, Form, ListGroup } from "react-bootstrap";
import Image from "next/image";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useListGroups, useCreateGroup, type ChatGroup } from "@/hooks/useGroups";
import { useListChatUsers } from "@/hooks/useProfiles";
import { timeSince } from "@/utils/date";

interface GroupProps {
  onGroupSelect?: (groupId: string, groupName: string) => void;
  onCreateGroup?: () => void;
}

const Group = ({ onGroupSelect, onCreateGroup }: GroupProps) => {
  // Only use Supabase data since all groups have been migrated
  const { data: supabaseGroups, isLoading, error } = useListGroups();
  const { data: availableUsers } = useListChatUsers();
  const createGroupMutation = useCreateGroup();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Use only Supabase groups - they already have last_message and last_message_time
  const allGroups = supabaseGroups || [];

  const handleGroupClick = (groupId: string, groupName: string) => {
    setSelectedGroupId(groupId);
    if (onGroupSelect) {
      onGroupSelect(groupId, groupName);
    }
  };

  const handleCreateGroupClick = () => {
    setShowCreateModal(true);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        member_ids: selectedMembers,
      });
      
      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setSelectedMembers([]);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <SimplebarReactClient className="px-2 mb-3 chat-setting-height">
      {/* Create New Group Option */}
      <div className="d-flex flex-column h-100 border-bottom">
        <Link href="" className="d-block">
          <div 
            className="d-flex align-items-center px-2 pb-2 mb-1 rounded"
            onClick={handleCreateGroupClick}
          >
            <div className="position-relative">
              <div className="avatar flex-shrink-0">
                <span className="avatar-title bg-primary text-white fs-4 rounded-circle">
                  <IconifyIcon icon="ri:add-line" />
                </span>
              </div>
            </div>
            <div className="d-block ms-3 flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="mb-0">New Group</h5>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0 text-muted">Create a new group chat</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Show loading state for Supabase groups */}
      {isLoading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-1 mb-0 text-muted fs-13">Loading groups...</p>
        </div>
      )}
      
      {/* Show error if any */}
      {error && (
        <div className="text-center py-3 text-danger">
          <IconifyIcon icon="ri:error-warning-line" className="fs-18 mb-1" />
          <p className="mb-0 fs-13">Error: {error.message}</p>
        </div>
      )}
      
      {/* Groups List - Match Chat component layout exactly */}
      {allGroups?.map((group: ChatGroup, idx: number) => {
        if (!group.id) return null;
        const groupName = group.name || 'Unknown Group';
        const lastMessageTime = group.last_message_time ? new Date(group.last_message_time) : new Date();
        const lastMessage = group.last_message || "No messages yet";
        const lastMessageSender = group.last_message_sender || "";
        const unreadCount = group.unread_count || 0;
        
        return (
          <div
            className={`d-flex flex-column h-100 ${allGroups.length - 1 != idx && "border-bottom"}`}
            key={group.id}
          >
            <Link href="" className="d-block">
              <div
                className={`d-flex align-items-center px-2 pb-2 mb-1 ${idx == 0 ? "" : "p-2"} rounded ${
                  selectedGroupId === group.id ? 'bg-primary bg-opacity-10' : ''
                }`}
                onClick={() => handleGroupClick(group.id!, groupName)}
              >
                <div className="position-relative">
                  <div className="avatar flex-shrink-0">
                    <span className="avatar-title bg-primary text-white fs-4 rounded-circle">
                      {group.avatar_url ? (
                        <Image
                          src={group.avatar_url}
                          alt={groupName}
                          width={40}
                          height={40}
                          className="rounded-circle"
                        />
                      ) : (
                        <IconifyIcon icon="ri:group-line" />
                      )}
                    </span>
                  </div>
                  <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-light border-2 rounded-circle">
                    <span className="visually-hidden">Active group</span>
                  </span>
                </div>
                <div className="d-block ms-3 flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="mb-0">{groupName}</h5>
                    <div>
                      <p className="text-muted fs-13 mb-0">
                        {timeSince(lastMessageTime)}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="mb-0 text-muted d-flex align-items-center gap-1">
                      <IconifyIcon icon="ri:group-line" className="text-primary fs-14" />
                      {lastMessageSender && lastMessage !== "No messages yet" ? (
                        <>
                          <span className="fw-medium text-dark">{lastMessageSender}:</span>
                          {` ${lastMessage}`.length > 25 ? ` ${lastMessage.substring(0, 25)}...` : ` ${lastMessage}`}
                        </>
                      ) : (
                        lastMessage.length > 30 ? `${lastMessage.substring(0, 30)}...` : lastMessage
                      )}
                    </p>
                    <div>
                      {unreadCount > 0 ? (
                        <span className="badge bg-danger badge-pill">
                          {unreadCount}
                        </span>
                      ) : (
                        <IconifyIcon
                          icon="ri:check-double-line"
                          className="fs-18 text-primary"
                        />
                      )}
                      {idx === 0 && (
                        <IconifyIcon
                          icon="ri:pushpin-2-fill"
                          className="text-success ms-1"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}

      {/* Show empty state if no groups */}
      {!isLoading && !error && allGroups?.length === 0 && (
        <div className="text-center py-4">
          <IconifyIcon icon="ri:group-line" className="fs-48 text-muted mb-3" />
          <p className="text-muted">No groups found</p>
          <p className="text-muted fs-13">Create your first group to get started!</p>
        </div>
      )}

      {/* Create Group Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:group-line" className="me-2" />
            Create New Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter group description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
            </Form.Group>
            
            {/* Member Selection */}
            <Form.Group className="mb-3">
              <Form.Label>
                Add Members
                {selectedMembers.length > 0 && (
                  <span className="badge bg-primary ms-2">
                    {selectedMembers.length} selected
                  </span>
                )}
              </Form.Label>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="border rounded p-2">
                {availableUsers && availableUsers.length > 0 ? (
                  availableUsers.map((user: any) => (
                    <div 
                      key={user.id} 
                      className={`d-flex align-items-center p-2 rounded mb-1 cursor-pointer ${
                        selectedMembers.includes(user.id) ? 'bg-primary bg-opacity-10' : 'hover-bg-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleMemberToggle(user.id)}
                    >
                      <div className="form-check me-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedMembers.includes(user.id)}
                          onChange={() => handleMemberToggle(user.id)}
                        />
                      </div>
                      <img
                        src={user.avatar?.src || '/default-avatar.png'}
                        alt={user.name}
                        className="rounded-circle me-3"
                        width="40"
                        height="40"
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{user.name}</h6>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3">
                    <p className="text-muted mb-0">No users available</p>
                  </div>
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || createGroupMutation.isPending}
          >
            {createGroupMutation.isPending ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Creating...</span>
                </div>
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </SimplebarReactClient>
  );
};

export default Group;
