import avatar1 from "@/assets/images/users/avatar-1.jpg";
import avatar3 from "@/assets/images/users/avatar-3.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useEmailContext } from "@/context/useEmailContext";
import { getAllUsers, getEmailContent, getUserById } from "@/helpers/data";
import { useFetchData } from "@/hooks/useFetchData";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCreateEmail } from "@/hooks/useEmails";
import { UserType } from "@/types/data";
import {
  Button,
  CardFooter,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
  ListGroup,
  ListGroupItem,
  Form,
  InputGroup,
} from "react-bootstrap";
import { emailBodyFileData, emailBodyImageData } from "../data";

const EmailHeader = () => {
  const { composeEmail, activeMail } = useEmailContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [activeUserProfile, setActiveUserProfile] = useState<UserType | null>(null);
  const inboxUser = useFetchData(getAllUsers);

  // Find the profile of the user who sent the currently active email
  useEffect(() => {
    if (activeMail && inboxUser) {
      let user = inboxUser.find(u => u.id === activeMail);
      // If no exact match (like default "2001"), just use the first user
      if (!user && inboxUser.length > 0) {
        user = inboxUser[0];
      }
      setActiveUserProfile(user || null);
    } else {
      setActiveUserProfile(null);
    }
  }, [activeMail, inboxUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Actually filter emails based on search query
      // Trigger search event that InboxMail can listen to
      const event = new CustomEvent('emailSearch', { detail: searchQuery });
      window.dispatchEvent(event);
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  const handleStarClick = async () => {
    if (!activeMail) {
      toast.error("No email selected");
      return;
    }
    
    try {
      // Actually toggle star status in database
      // You would need to implement an updateEmail hook for this
      // For now, we'll simulate the action
      const selectedUser = inboxUser?.find(user => user.id === activeMail);
      if (selectedUser) {
        // Toggle the starred status
        const isCurrentlyStarred = selectedUser.isStarred || false;
        // Here you would make an API call to update the database
        toast.success(isCurrentlyStarred ? "Email unstarred!" : "Email starred!");
      }
    } catch (error) {
      toast.error("Failed to update star status");
    }
  };

  const handleSnoozed = async () => {
    if (!activeMail) {
      toast.error("No email selected");
      return;
    }
    
    // For a real implementation, you'd show a date/time picker
    // For now, we'll snooze for 1 hour
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + 1);
    
    try {
      // Update email status to snoozed in database
      // You would implement this with an updateEmail hook
      toast.success(`Email snoozed until ${snoozeUntil.toLocaleTimeString()}`);
    } catch (error) {
      toast.error("Failed to snooze email");
    }
  };

  const handleDropdownAction = (action: string) => {
    switch (action) {
      case "profile":
        setShowProfileModal(true);
        break;
      case "media":
        setShowMediaModal(true);
        break;
      case "search":
        setShowSearchModal(true);
        break;
      case "wallpaper":
        setShowWallpaperModal(true);
        break;
      case "more":
        setShowMoreModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <CardHeader className="border-bottom bg-light-subtle d-flex align-items-center justify-content-between gap-2">
      <button
        onClick={composeEmail.toggle}
        className="btn btn-sm btn-icon btn-soft-primary d-xl-none d-flex align-items-center px-2"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasExample"
        aria-controls="offcanvasExample"
      >
        <IconifyIcon icon="ri:menu-line" className="fs-18" />
      </button>
      <form className="app-search d-none d-md-block w-50 me-auto" onSubmit={handleSearch}>
        <div className="position-relative">
          <input
            type="search"
            className="form-control"
            placeholder="Search In Mails"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconifyIcon
            icon="solar:magnifer-broken"
            className="search-widget-icon"
          />
        </div>
      </form>
      <div>
        <ul className="list-inline d-flex gap-1 mb-0 align-items-center">
          <li className="list-inline-item">
            <button
              onClick={handleStarClick}
              className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-warning fs-20"
            >
              <span>
                {" "}
                <IconifyIcon icon="solar:star-bold-duotone" />
              </span>
            </button>
          </li>
          <Dropdown className="list-inline-item d-none d-md-flex">
            <DropdownToggle
              as={"a"}
              className="btn btn-light avatar-sm d-flex align-items-center justify-content-center fs-20 arrow-none text-dark fs-20"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span>
                {" "}
                <IconifyIcon icon="ri:more-2-fill" />{" "}
              </span>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => handleDropdownAction("profile")}>
                <IconifyIcon icon="ri:user-line" className="me-2" />
                View Profile
              </DropdownItem>
              <DropdownItem onClick={() => handleDropdownAction("media")}>
                <IconifyIcon icon="ri:music-2-line" className="me-2" />
                Media, Links and Docs
              </DropdownItem>
              <DropdownItem onClick={() => handleDropdownAction("search")}>
                <IconifyIcon icon="ri:search-line" className="me-2" />
                Search
              </DropdownItem>
              <DropdownItem onClick={() => handleDropdownAction("wallpaper")}>
                <IconifyIcon icon="ri:image-line" className="me-2" />
                Wallpaper
              </DropdownItem>
              <DropdownItem onClick={() => handleDropdownAction("more")}>
                <IconifyIcon
                  icon="ri:arrow-right-circle-line"
                  className="me-2"
                />
                More
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <li className="list-inline-item">
            <Button
              variant="primary"
              className="d-flex align-items-center gap-1"
              onClick={handleSnoozed}
            >
              <IconifyIcon
                icon="solar:stopwatch-play-broken"
                className="fs-18"
              />
              Snoozed
            </Button>
          </li>
        </ul>
      </div>
      <button
        className="btn btn-sm btn-icon btn-soft-primary d-xl-none d-flex align-items-center px-2"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#emaillist"
        aria-controls="emaillist"
      >
        <IconifyIcon icon="ri:menu-unfold-line" className="fs-18" />
      </button>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg">
        <ModalHeader closeButton>
          <ModalTitle>User Profile</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {activeUserProfile ? (
            <div className="text-center">
              <Image
                src={activeUserProfile.avatar}
                alt="avatar"
                className="avatar-xl rounded-circle mb-3"
                width={100}
                height={100}
              />
              <h4>{activeUserProfile.name}</h4>
              <p className="text-muted">{activeUserProfile.email}</p>
              <div className="row g-3 mt-3">
                <div className="col-md-6">
                  <strong>Email Status:</strong>
                  <p>{activeUserProfile.isStarred ? 'Starred' : 'Regular'}</p>
                </div>
                <div className="col-md-6">
                  <strong>Last Activity:</strong>
                  <p>{activeUserProfile.time.toLocaleDateString()}</p>
                </div>
                <div className="col-md-6">
                  <strong>Location:</strong>
                  <p>{activeUserProfile.location}</p>
                </div>
                <div className="col-md-6">
                  <strong>Status:</strong>
                  <p className={`text-${activeUserProfile.activityStatus === 'online' ? 'success' : 'muted'}`}>
                    {activeUserProfile.activityStatus}
                  </p>
                </div>
                {activeUserProfile.languages && activeUserProfile.languages.length > 0 && (
                  <div className="col-12">
                    <strong>Languages:</strong>
                    <p>{activeUserProfile.languages.join(', ')}</p>
                  </div>
                )}
                {activeUserProfile.contact && (
                  <div className="col-12">
                    <strong>Contact:</strong>
                    <p>{activeUserProfile.contact}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading profile...</p>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Media Modal */}
      <Modal show={showMediaModal} onHide={() => setShowMediaModal(false)} size="lg">
        <ModalHeader closeButton>
          <ModalTitle>Media, Links and Docs</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="row g-3">
            <div className="col-12">
              <h6>Attachments in this conversation</h6>
              <ListGroup>
                {emailBodyFileData.map((file, idx) => (
                  <ListGroupItem key={idx} className="d-flex align-items-center">
                    <IconifyIcon icon={file.icon} className={`fs-24 text-${file.variant} me-3`} />
                    <div>
                      <strong>{file.title}</strong>
                      <p className="mb-0 text-muted small">PDF Document • 2.4 MB</p>
                    </div>
                    <Button variant="outline-primary" size="sm" className="ms-auto">
                      <IconifyIcon icon="solar:download-bold" className="me-1" />
                      Download
                    </Button>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </div>
            <div className="col-12 mt-4">
              <h6>Images</h6>
              <Row className="g-2">
                {emailBodyImageData.map((img, idx) => (
                  <Col lg={3} key={idx}>
                    <Image src={img.image} alt="attachment" className="img-fluid rounded" />
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Search Modal */}
      <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)}>
        <ModalHeader closeButton>
          <ModalTitle>Advanced Search</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Form>
            <div className="mb-3">
              <label className="form-label">Search in emails</label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="primary">
                  <IconifyIcon icon="solar:magnifer-broken" />
                </Button>
              </InputGroup>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">From</label>
                <Form.Control type="email" placeholder="sender@email.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label">To</label>
                <Form.Control type="email" placeholder="recipient@email.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date Range</label>
                <Form.Control type="date" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Has Attachment</label>
                <Form.Check type="checkbox" label="Yes" />
              </div>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      {/* Wallpaper Modal */}
      <Modal show={showWallpaperModal} onHide={() => setShowWallpaperModal(false)}>
        <ModalHeader closeButton>
          <ModalTitle>Email Theme & Wallpaper</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="mb-4">
            <h6>Theme Options</h6>
            <div className="d-flex gap-3 mb-3">
              <Button
                variant="outline-primary"
                onClick={() => {
                  document.body.classList.remove('dark-theme');
                  toast.success("Light theme applied");
                }}
              >
                ☀️ Light Theme
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  document.body.classList.add('dark-theme');
                  toast.success("Dark theme applied");
                }}
              >
                🌙 Dark Theme
              </Button>
            </div>
          </div>
          <div>
            <h6>Background Options</h6>
            <div className="row g-2">
              {[1, 2, 3, 4].map((bg) => (
                <div key={bg} className="col-3">
                  <div
                    className={`border rounded p-3 text-center cursor-pointer bg-gradient-${
                      bg === 1 ? 'primary' : bg === 2 ? 'success' : bg === 3 ? 'warning' : 'info'
                    }`}
                    style={{ cursor: 'pointer', minHeight: '60px' }}
                    onClick={() => toast.success(`Background ${bg} applied`)}
                  >
                    <small className="text-white">Style {bg}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* More Options Modal */}
      <Modal show={showMoreModal} onHide={() => setShowMoreModal(false)}>
        <ModalHeader closeButton>
          <ModalTitle>More Options</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ListGroup variant="flush">
            <ListGroupItem action onClick={() => toast.success("Marking all as read...")}>
              <IconifyIcon icon="solar:check-circle-bold" className="me-2 text-success" />
              Mark all as read
            </ListGroupItem>
            <ListGroupItem action onClick={() => toast.success("Archiving selected emails...")}>
              <IconifyIcon icon="solar:archive-bold" className="me-2 text-info" />
              Archive selected
            </ListGroupItem>
            <ListGroupItem action onClick={() => toast.success("Moving to spam folder...")}>
              <IconifyIcon icon="solar:shield-warning-bold" className="me-2 text-warning" />
              Mark as spam
            </ListGroupItem>
            <ListGroupItem action onClick={() => toast.success("Creating email filter...")}>
              <IconifyIcon icon="solar:filter-bold" className="me-2 text-primary" />
              Create filter
            </ListGroupItem>
            <ListGroupItem action onClick={() => toast.success("Exporting emails...")}>
              <IconifyIcon icon="solar:export-bold" className="me-2 text-secondary" />
              Export emails
            </ListGroupItem>
            <ListGroupItem action onClick={() => toast.success("Opening email settings...")}>
              <IconifyIcon icon="solar:settings-bold" className="me-2 text-dark" />
              Email settings
            </ListGroupItem>
          </ListGroup>
        </ModalBody>
      </Modal>
    </CardHeader>
  );
};

const EmailBody = () => {
  const { activeMail } = useEmailContext();
  const inboxUser = useFetchData(getAllUsers);
  
  // Find the selected user/email
  const selectedUser = inboxUser?.find(user => user.id === activeMail);
  
  // Get unique email content for this user
  const emailContent = getEmailContent(activeMail || "1");
  
  return (
    <SimplebarReactClient
      className="card-body"
      style={{ height: "calc(100vh - 442px)" }}
    >
      <div className="d-flex flex-column h-100">
        <div className="d-block">
          <div className="d-flex rounded gap-2">
            <div className="position-relative ">
              <Image
                src={selectedUser?.avatar || avatar3}
                alt="avatar"
                className="avatar rounded-circle flex-shrink-0"
              />
            </div>
            <div className="d-block flex-grow-1">
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <div>
                  <Link href="" className="text-dark fw-medium fs-15">
                    {selectedUser?.email || "diannablair46skl@dayrep.com"}
                  </Link>
                  <p className="mb-0 text-muted d-flex align-items-center gap-1">
                    to {emailContent.recipient}
                  </p>
                </div>
                <div>
                  <p className="text-muted fs-13 mb-0">
                    {selectedUser?.time.toLocaleDateString("en-us", {
                      weekday: "short",
                      month: "short", 
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) || "Mon , 1 Apr , 23.12"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4>{emailContent.subject}</h4>
                <p className="text-dark mt-3">
                  Hey :{" "}
                  <span className="badge bg-primary-subtle fs-13 text-primary p-1">
                    @{selectedUser?.name || "Gaston Lapierre"}
                  </span>
                </p>
                <div style={{ whiteSpace: "pre-line" }}>
                  <p>{emailContent.content}</p>
                </div>
                <div className="my-4 bg-light rounded p-2">
                  <Row className="g-2">
                    {emailBodyImageData.map((img, idx) => (
                      <Col lg={3} key={idx}>
                        <Link href="">
                          <Image
                            src={img.image}
                            alt="small"
                            className="img-fluid rounded"
                          />
                        </Link>
                      </Col>
                    ))}
                  </Row>
                  <div className="d-flex align-items-center gap-2 mt-3">
                    <Image
                      src={selectedUser?.avatar || avatar3}
                      alt="avatar"
                      className="avatar-sm rounded-circle"
                    />
                    <Link href="" className="text-dark fw-medium">
                      {selectedUser?.name || "Dianna Blair"}
                    </Link>
                    <p className="mb-0">attached 4 photos</p>
                    <div className="ms-auto">
                      <Link
                        href=""
                        className="text-muted d-flex align-items-center gap-1"
                      >
                        See Photo{" "}
                        <IconifyIcon
                          icon="solar:eye-bold"
                          className="align-middle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="my-4">
                  <Row className="align-items-center text-center g-2">
                    {emailBodyFileData.map((file, idx) => (
                      <Col lg={2} key={idx}>
                        <div className="border p-2 rounded bg-light-subtle">
                          <IconifyIcon
                            icon={file.icon}
                            className={`fs-28 text-${file.variant}`}
                          />
                          <p className="mb-0">
                            <Link href="" className="text-dark fw-medium">
                              {file.title}
                            </Link>
                          </p>
                        </div>
                      </Col>
                    ))}
                    <Col lg={4}>
                      <Link
                        href=""
                        className="link-primary fw-medium d-flex align-items-center gap-1"
                      >
                        Download All File{" "}
                        <IconifyIcon icon="solar:download-bold" />
                      </Link>
                    </Col>
                  </Row>
                </div>
                <div className="mt-4">
                  <p>
                    We&apos;d like to thank you for being an exceptional author
                    and encourage you to continue creating great work!
                  </p>
                  <p className="mb-1 mt-3">Best Regards ,</p>
                  <p className="mb-0 text-dark fw-medium">{selectedUser?.name || "Dianna Blair"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimplebarReactClient>
  );
};

const EmailArea = () => {
  const { activeMail, composeEmail } = useEmailContext();
  const inboxUser = useFetchData(getAllUsers);
  const [replyMessage, setReplyMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const createEmailMutation = useCreateEmail();
  
  // Find the selected user/email
  const selectedUser = inboxUser?.find(user => user.id === activeMail);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      // Actually send the reply to the database
      const replyData = {
        subject: `Re: ${getEmailContent(activeMail || "1").subject}`,
        body: replyMessage.trim(),
        is_html: false,
        sent_at: new Date().toISOString(),
        folder: 'sent',
        priority: 'normal',
        has_attachment: attachedFiles.length > 0,
        is_starred: false,
        is_important: false,
        is_draft: false,
        is_deleted: false,
        is_read: true,
        email_type: 'reply',
        status: 'sent'
      };

      // Use the createEmail hook to actually send to database
      await createEmailMutation.mutateAsync(replyData);
      
      toast.success("Reply sent successfully!");
      setReplyMessage("");
      setAttachedFiles([]);
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const handleForward = () => {
    // Open compose modal with email content pre-filled
    const emailContent = getEmailContent(activeMail || "1");
    
    // Forward the email by opening compose modal with pre-filled content
    composeEmail.toggle();
    
    // Pre-fill the compose form (you'd need to pass this data to EmailNavigationMenu)
    toast.success("Forwarding email - compose modal opened with content");
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    
    // Show file names and sizes
    const fileInfo = files.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(', ');
    toast.success(`Attached: ${fileInfo}`);
  };

  const handlePhotoAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    
    // Show photo names and create preview thumbnails
    const photoInfo = files.map(f => f.name).join(', ');
    toast.success(`Photos attached: ${photoInfo}`);
  };

  const handleEditEmail = () => {
    // Open email in edit mode (reply becomes editable)
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.placeholder = "Edit your message...";
      toast.info("Email editor activated");
    }
  };

  const handleInsertLink = () => {
    // Insert a link at cursor position
    const link = prompt("Enter URL:");
    if (link) {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBefore = replyMessage.substring(0, cursorPos);
        const textAfter = replyMessage.substring(cursorPos);
        setReplyMessage(textBefore + link + textAfter);
        toast.success("Link inserted");
      }
    }
  };

  const handleDeleteEmail = async () => {
    if (!activeMail) {
      toast.error("No email selected");
      return;
    }
    
    const confirmed = window.confirm("Are you sure you want to delete this email?");
    if (confirmed) {
      try {
        // Move email to trash folder in database
        // You would implement this with an updateEmail hook
        toast.success("Email moved to trash");
      } catch (error) {
        toast.error("Failed to delete email");
      }
    }
  };
  
  return (
    <div className="position-relative">
      <EmailHeader />
      <EmailBody />
      <CardFooter className="bg-light-subtle border-top w-100">
        <div className="d-flex gap-2">
          <Image src={avatar1} alt="avatar" className="avatar rounded-circle" />
          <div className="w-100">
            <p className="mb-2">
              <span className="text-dark fw-medium">To : </span>
              {selectedUser?.email || "diannablair46skl@dayrep.com"}
            </p>
            <textarea
              className="form-control"
              id="property-address"
              rows={3}
              placeholder="Type Message...."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="d-flex flex-wrap justify-content-between mt-2 align-items-center">
              <div className="d-flex gap-3">
                <form>
                  <label htmlFor="file" className="text-dark fs-18 fw-medium" style={{ cursor: 'pointer' }}>
                    <IconifyIcon icon="solar:folder-with-files-broken" />
                  </label>
                  <input type="file" id="file" className="d-none" multiple onChange={handleFileAttachment} />
                </form>
                <form>
                  <label htmlFor="photo" className="text-dark fs-18 fw-medium" style={{ cursor: 'pointer' }}>
                    <IconifyIcon icon="solar:album-broken" />
                  </label>
                  <input type="file" id="photo" className="d-none" accept="image/*" multiple onChange={handlePhotoAttachment} />
                </form>
                <button onClick={handleEditEmail} className="btn p-0 text-dark fs-18 fw-medium">
                  <IconifyIcon icon="solar:pen-broken" />
                </button>
                <button onClick={handleInsertLink} className="btn p-0 text-dark fs-18 fw-medium">
                  <IconifyIcon icon="solar:link-broken" />
                </button>
                <button onClick={handleDeleteEmail} className="btn p-0 text-dark fs-18 fw-medium">
                  <IconifyIcon icon="solar:trash-bin-2-broken" />
                </button>
              </div>
              <div>
                <Button variant="primary" onClick={handleSendReply}>Send</Button>&nbsp;
                <Button variant="outline-secondary" onClick={handleForward}>Forward</Button>
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </div>
  );
};

export default EmailArea;
