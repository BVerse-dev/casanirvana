"use client";
import { useState } from "react";
import { Col, Offcanvas, Card, CardBody, Modal, Button } from "react-bootstrap";

import { useListChatUsers, useGetChatUser, type ChatUser } from "@/hooks/useProfiles";
import ChatArea from "./ChatArea";
import GroupChatArea from "./GroupChatArea";
import ChatLeftSidebar from "./ChatLeftSidebar";
import { useChatContext } from "@/context/useChatContext";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";

const ChatApp = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'user' | 'group'>('user');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const { data: users, isLoading: usersLoading, error: usersError } = useListChatUsers();
  const { data: selectedUser, isLoading: userLoading } = useGetChatUser(selectedUserId || "");
  const { data: selectedContact, isLoading: contactLoading } = useGetChatUser(selectedContactId || "");
  const { chatList } = useChatContext();

  // Show loading state
  if (usersLoading) {
    return (
      <Col xs={12}>
        <Card>
          <CardBody className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading users...</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  // Show error state
  if (usersError) {
    return (
      <Col xs={12}>
        <Card>
          <CardBody className="text-center text-danger">
            <IconifyIcon icon="ri:error-warning-line" className="fs-24 mb-2" />
            <p>Error loading users: {usersError.message}</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  // Default to first user if none selected
  const firstUser = users?.[0];
  const currentSelectedUser = selectedUser || firstUser;
  const currentSelectedUserId = selectedUserId || firstUser?.id;

  const onUserChange = (user: ChatUser) => {
    setSelectedUserId(user.id);
    setSelectedGroupId(null);
    setChatMode('user');
  };

  const onGroupSelect = (groupId: string, groupName: string) => {
    setSelectedGroupId(groupId);
    setSelectedUserId(null);
    setChatMode('group');
    console.log(`Selected group: ${groupName} (${groupId})`);
    
    // Close the sidebar on mobile after selection
    if (chatList.open) {
      chatList.toggle();
    }
  };

  const onCreateGroup = () => {
    // For now, just show an alert - could open a modal later
    alert('Create Group functionality - coming soon!\n\nThis will open a modal to:\n- Enter group name\n- Select members\n- Create the group');
  };

  const onContactSelect = (contactId: string, contactName: string) => {
    setSelectedContactId(contactId);
    setShowContactDetails(true);
  };



  return (
    <>
      <Col xxl={3}>
        {users && currentSelectedUser && (
          <>
            <Offcanvas
              show={chatList.open}
              onHide={chatList.toggle}
              className="offcanvas-xxl offcanvas-start h-100"
              tabIndex={-1}
              id="Contactoffcanvas"
              aria-labelledby="ContactoffcanvasLabel"
            >
              <ChatLeftSidebar
                users={users}
                onUserSelect={onUserChange}
                selectedUser={currentSelectedUser}
                onGroupSelect={onGroupSelect}
                onCreateGroup={onCreateGroup}
                onContactSelect={onContactSelect}
              />
            </Offcanvas>
            <div className="d-none d-xxl-block">
              <ChatLeftSidebar
                users={users}
                onUserSelect={onUserChange}
                selectedUser={currentSelectedUser}
                onGroupSelect={onGroupSelect}
                onCreateGroup={onCreateGroup}
                onContactSelect={onContactSelect}
              />
            </div>
          </>
        )}
      </Col>

      <Col xxl={9}>
        {chatMode === 'group' && selectedGroupId ? (
          <GroupChatArea groupId={selectedGroupId} />
        ) : currentSelectedUser ? (
          <ChatArea 
            selectedUser={currentSelectedUser} 
            selectedUserId={currentSelectedUserId}
          />
        ) : (
          <Card className="h-100">
            <CardBody className="d-flex align-items-center justify-content-center">
              <div className="text-center">
                <IconifyIcon icon="ri:chat-3-line" className="fs-48 text-muted mb-3" />
                <h4 className="text-muted">
                  {chatMode === 'group' ? 'Select a group to start messaging' : 'Select a contact to start messaging'}
                </h4>
                <p className="text-muted mb-0">
                  {chatMode === 'group' 
                    ? 'Choose a group from your groups to start a conversation.' 
                    : 'Choose someone from your contacts to start a conversation.'}
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </Col>

      {/* Contact Details Modal */}
      <Modal 
        show={showContactDetails} 
        onHide={() => setShowContactDetails(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:user-line" className="me-2" />
            Contact Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contactLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading contact details...</p>
            </div>
          ) : selectedContact ? (
            <div className="row">
              <div className="col-md-4 text-center">
                                 <div className="position-relative d-inline-block mb-3">
                   <Image
                     src={selectedContact.avatar}
                     alt={selectedContact.name}
                     width={120}
                     height={120}
                     className="rounded-circle border"
                     style={{ objectFit: 'cover' }}
                   />
                   <div className={`position-absolute bottom-0 end-0 p-1 rounded-circle border border-white ${selectedContact.activityStatus === 'online' ? 'bg-success' : 'bg-secondary'}`} style={{ width: '20px', height: '20px' }}>
                   </div>
                 </div>
                <h5 className="mb-1">{selectedContact.name}</h5>
                <p className="text-muted mb-0">
                  {selectedContact.role === 'admin' ? 'System Administrator' : 
                   selectedContact.role === 'resident' ? 'Resident' : 
                   selectedContact.role === 'guard' ? 'Security Guard' : 
                   selectedContact.role === 'staff' ? 'Staff Member' : 
                   'Contact'}
                </p>
              </div>
              <div className="col-md-8">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <IconifyIcon icon="ri:mail-line" className="me-2" />
                      Email Address
                    </label>
                    <div className="form-control-plaintext">{selectedContact.email}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <IconifyIcon icon="ri:phone-line" className="me-2" />
                      Phone Number
                    </label>
                    <div className="form-control-plaintext">{selectedContact.phone || 'Not provided'}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <IconifyIcon icon="ri:map-pin-line" className="me-2" />
                      Location
                    </label>
                    <div className="form-control-plaintext">{selectedContact.location}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <IconifyIcon icon="ri:global-line" className="me-2" />
                      Languages
                    </label>
                    <div className="form-control-plaintext">
                      {selectedContact.languages?.join(', ') || 'Not specified'}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                      Status
                    </label>
                    <div className="form-control-plaintext">
                      <span className={`badge ${selectedContact.activityStatus === 'online' ? 'bg-success' : 'bg-secondary'}`}>
                        {selectedContact.activityStatus === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <IconifyIcon icon="ri:user-line" className="fs-48 text-muted mb-3" />
              <p className="text-muted">Contact not found</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactDetails(false)}>
            Close
          </Button>
          {selectedContact && (
            <Button variant="primary" onClick={() => {
              setSelectedUserId(selectedContact.id);
              setChatMode('user');
              setShowContactDetails(false);
            }}>
              <IconifyIcon icon="ri:message-line" className="me-1" />
              Start Chat
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChatApp;
