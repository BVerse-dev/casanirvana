import Link from "next/link";
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useListChatUsers, type ChatUser } from "@/hooks/useProfiles";
import Image from "next/image";

interface ContactProps {
  onContactSelect?: (contactId: string, contactName: string) => void;
  onAddContact?: () => void;
}

const Contact = ({ onContactSelect, onAddContact }: ContactProps) => {
  const { data: allContacts, isLoading, error } = useListChatUsers();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const contactCreationLinks = [
    { href: "/residents/add", label: "Add Resident", description: "Create a resident profile that will appear in chat contacts.", icon: "ri:user-add-line" },
    { href: "/guards/add", label: "Add Guard", description: "Register a guard and make them available in messaging.", icon: "ri:shield-user-line" },
    { href: "/agencies/add", label: "Add Agency", description: "Create an agency profile for operational conversations.", icon: "ri:building-line" },
    { href: "/settings/admin/users", label: "Admin Users", description: "Manage platform admin accounts and access.", icon: "ri:admin-line" },
  ];

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
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:user-add-line" className="me-2" />
            Create Platform Contact
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info d-flex align-items-start">
            <IconifyIcon icon="ri:information-line" className="fs-20 me-2 mt-1" />
            <div>
              Contacts in messaging sync from existing platform profiles. Create the user in the appropriate management area, then return here to start the conversation.
            </div>
          </div>
          <div className="row g-3">
            {contactCreationLinks.map((item) => (
              <div className="col-md-6" key={item.href}>
                <Link href={item.href} className="text-decoration-none">
                  <div className="border rounded p-3 h-100 bg-light bg-opacity-50 hover-shadow-sm">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <IconifyIcon icon={item.icon} className="fs-20 text-primary" />
                      <h6 className="mb-0 text-dark">{item.label}</h6>
                    </div>
                    <p className="mb-0 text-muted fs-13">{item.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Link
            href="/residents/add"
            className="btn btn-primary"
            onClick={() => setShowAddModal(false)}
          >
            <IconifyIcon icon="ri:arrow-right-line" className="me-1" />
            Open Resident Add Flow
          </Link>
        </Modal.Footer>
      </Modal>
    </SimplebarReactClient>
  );
};

export default Contact;
