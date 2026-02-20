import Link from "next/link";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useListChatUsers, useCreateProfile, type ChatUser } from "@/hooks/useProfiles";
import Image from "next/image";

interface ContactProps {
  onContactSelect?: (contactId: string, contactName: string) => void;
  onAddContact?: () => void;
}

const Contact = ({ onContactSelect, onAddContact }: ContactProps) => {
  const { data: allContacts, isLoading, error } = useListChatUsers();
  const createProfileMutation = useCreateProfile();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactFirstName, setNewContactFirstName] = useState("");
  const [newContactLastName, setNewContactLastName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRole, setNewContactRole] = useState("resident");

  const handleContactClick = (contactId: string, contactName: string) => {
    setSelectedContactId(contactId);
    if (onContactSelect) {
      onContactSelect(contactId, contactName);
    }
  };

  const handleAddContactClick = () => {
    if (onAddContact) {
      onAddContact();
    } else {
      setShowAddModal(true);
    }
  };

  const handleAddContact = async () => {
    if (!newContactFirstName.trim() || !newContactLastName.trim() || !newContactEmail.trim()) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    try {
      await createProfileMutation.mutateAsync({
        first_name: newContactFirstName.trim(),
        last_name: newContactLastName.trim(),
        email: newContactEmail.trim(),
        phone: newContactPhone.trim() || null,
        role: newContactRole,
        avatar_url: null, // Will use default avatar
      });
      
      // Reset form and close modal
      setShowAddModal(false);
      setNewContactFirstName("");
      setNewContactLastName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setNewContactRole("resident");
    } catch (error) {
      console.error("Failed to add contact:", error);
      alert('Failed to add contact. Please try again.');
    }
  };

  const resetForm = () => {
    setNewContactFirstName("");
    setNewContactLastName("");
    setNewContactEmail("");
    setNewContactPhone("");
    setNewContactRole("resident");
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  return (
    <SimplebarReactClient className="px-2 mb-3 chat-setting-height">
      <div className="d-flex flex-column h-100 border-bottom">
        <div className="d-block" style={{ cursor: 'pointer' }} onClick={handleAddContactClick}>
          <div className="d-flex align-items-center justify-content-between bg-light bg-opacity-75 p-2 mb-1 rounded">
            <div className="position-relative">
              <div className="avatar flex-shrink-0">
                <span className="avatar-title bg-primary text-white fs-4 rounded-circle">
                  <IconifyIcon icon="ri:user-add-line" />
                </span>
              </div>
            </div>
            <div className="d-block ms-3 flex-grow-1">
              <h5 className="mb-0 fw-medium">Add New Contact</h5>
            </div>
            <IconifyIcon
              icon="solar:qr-code-bold-duotone"
              className="fs-20 text-primary"
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-1 mb-0 text-muted fs-13">Loading contacts...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-3 text-danger">
          <IconifyIcon icon="ri:error-warning-line" className="fs-18 mb-1" />
          <p className="mb-0 fs-13">Error: {error.message}</p>
        </div>
      )}

      {/* Contacts List */}
      {allContacts?.map((contact: ChatUser, idx: number) => (
        <div
          className={`d-flex flex-column h-100 ${allContacts.length - 1 != idx && "border-bottom"} `}
          key={contact.id}
        >
          <div 
            className="d-block" 
            style={{ cursor: 'pointer' }} 
            onClick={() => handleContactClick(contact.id, contact.name)}
          >
            <div className={`d-flex align-items-center p-2 mb-1 rounded ${selectedContactId === contact.id ? 'bg-primary bg-opacity-10' : ''}`}>
              <div className="position-relative">
                <Image
                  src={contact.avatar}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="avatar rounded-circle flex-shrink-0"
                />
              </div>
              <div className="d-block ms-3 flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h5 className="mb-0">{contact.name}</h5>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="mb-0 text-muted d-flex align-items-center gap-1">
                    {contact.role === 'admin' ? 'System Administrator' : 
                     contact.role === 'resident' ? 'Resident' : 
                     contact.role === 'guard' ? 'Security Guard' : 
                     contact.role === 'staff' ? 'Staff Member' : 
                     'Contact'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!isLoading && !error && allContacts?.length === 0 && (
        <div className="text-center py-4">
          <IconifyIcon icon="ri:contacts-line" className="fs-48 text-muted mb-3" />
          <p className="text-muted">No contacts found</p>
          <p className="text-muted fs-13">Add your first contact to get started!</p>
        </div>
      )}

      {/* Add Contact Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:user-add-line" className="me-2" />
            Add New Contact
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    value={newContactFirstName}
                    onChange={(e) => setNewContactFirstName(e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    value={newContactLastName}
                    onChange={(e) => setNewContactLastName(e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number (Optional)</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                value={newContactRole}
                onChange={(e) => setNewContactRole(e.target.value)}
              >
                <option value="resident">Resident</option>
                <option value="staff">Staff Member</option>
                <option value="guard">Security Guard</option>
                <option value="admin">System Administrator</option>
              </Form.Select>
            </Form.Group>

            <div className="alert alert-info d-flex align-items-center">
              <IconifyIcon icon="ri:information-line" className="fs-20 me-2" />
              <div>
                <strong>Adding a Contact:</strong>
                <ul className="mb-0 mt-1">
                  <li>The contact will be added to your contact list immediately</li>
                  <li>They can start messaging once they accept the invitation</li>
                  <li>An invitation notification will be sent to their email</li>
                </ul>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddContact}
            disabled={!newContactFirstName.trim() || !newContactLastName.trim() || !newContactEmail.trim() || createProfileMutation.isPending}
          >
            {createProfileMutation.isPending ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Adding...</span>
                </div>
                Adding Contact...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:user-add-line" className="me-1" />
                Add Contact
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </SimplebarReactClient>
  );
};

export default Contact;
