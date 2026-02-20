import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useEmailContext } from "@/context/useEmailContext";
import { getAllUsers, getUsersByEmailCategory } from "@/helpers/data";
import { useFetchData } from "@/hooks/useFetchData";
import { useEffect, useState } from "react";
import { UserType } from "@/types/data";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
  ListGroup,
  ListGroupItem,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";

const InboxMail = () => {
  const { activeMail, changeActiveMail, activeLabel } = useEmailContext();
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Actually filter the displayed emails
      const filtered = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
      toast.success(`Found ${filtered.length} emails matching "${searchQuery}"`);
    } else {
      // Reset to show all emails for current category
      const fetchFilteredUsers = async () => {
        setLoading(true);
        try {
          const users = await getUsersByEmailCategory(activeLabel);
          setFilteredUsers(users);
        } catch (error) {
          console.error("Error fetching filtered users:", error);
          const allUsers = await getAllUsers();
          setFilteredUsers(allUsers);
        } finally {
          setLoading(false);
        }
      };
      fetchFilteredUsers();
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

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      setLoading(true);
      try {
        const users = await getUsersByEmailCategory(activeLabel);
        setFilteredUsers(users);
      } catch (error) {
        console.error("Error fetching filtered users:", error);
        // Fallback to all users if filtering fails
        const allUsers = await getAllUsers();
        setFilteredUsers(allUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredUsers();
  }, [activeLabel]);

  const inboxUser = filteredUsers;
  
  return (
    <div
      className="offcanvas-xl offcanvas-end"
      tabIndex={-1}
      id="emaillist"
      aria-labelledby="emaillistLabel"
    >
      <div className="border-start border-light border-end h-100">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <button
              type="button"
              className="btn p-0 d-lg-none d-flex"
              data-bs-dismiss="offcanvas"
              data-bs-target="#emaillist"
              aria-label="Close"
            >
              <IconifyIcon icon="ri:expand-right-line" className="fs-22" />
            </button>
            <h5 className="mb-0 text-dark d-flex align-items-center gap-1">
              <IconifyIcon
                icon="solar:inbox-bold-duotone"
                className="align-middle"
              />{" "}
              Inbox Mail
            </h5>
            <Dropdown>
              <DropdownToggle
                as={"a"}
                className="arrow-none text-dark"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <IconifyIcon icon="ri:more-2-fill" className="fs-18" />
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
          </div>
          <div className="d-flex justify-content-between mt-3">
            <form className="app-search d-none d-md-block w-100" onSubmit={handleSearch}>
              <div className="position-relative">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search"
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
          </div>
        </CardBody>
        <div className="border-top border-light overflow-hidden">
          <SimplebarReactClient style={{ maxHeight: "calc(100vh - 301px)" }}>
            <ul className="list-unstyled email-list-group mb-0">
              {inboxUser?.map((item, idx) => (
                <li className="email-read-done" key={idx}>
                  <div className="d-flex flex-column h-100 border-bottom">
                    <Link 
                      href="" 
                      className="d-block" 
                      onClick={(e) => {
                        e.preventDefault();
                        changeActiveMail(item.id);
                      }}
                    >
                      <div
                        className={`mail-select d-flex align-items-center p-3 ${activeMail === item.id ? "selected" : ""} m-1 rounded`}
                      >
                        <div className="position-relative">
                          <Image
                            src={item.avatar}
                            alt="avatar"
                            className="avatar rounded-circle flex-shrink-0"
                          />
                        </div>
                        <div className="d-block ms-3 flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <h5 className={`mb-0 ${activeMail === item.id ? "text-white" : ""}`}>
                              {item.name}
                            </h5>
                            <div>
                              <p
                                className={`fs-13 mb-0 ${activeMail === item.id ? "text-white" : "text-muted"}`}
                              >
                                {item.time.toLocaleString("en-us", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <p
                              className={`mb-0  d-flex align-items-center gap-1 ${activeMail === item.id ? "text-white" : "text-muted"}`}
                            >
                              {item.emailMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </li>
              ))}
              {loading && (
                <li>
                  <div className="d-flex justify-content-center my-2">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </SimplebarReactClient>
        </div>

        {/* Profile Modal */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg">
          <ModalHeader closeButton>
            <ModalTitle>Email Users Profile</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {filteredUsers.length > 0 ? (
              <div>
                <h6 className="mb-3">Recent Email Contacts ({filteredUsers.length})</h6>
                <ListGroup>
                  {filteredUsers.slice(0, 5).map((user, idx) => (
                    <ListGroupItem key={idx} className="d-flex align-items-center">
                      <Image
                        src={user.avatar}
                        alt="avatar"
                        className="avatar rounded-circle me-3"
                      />
                      <div className="flex-grow-1">
                        <strong>{user.name}</strong>
                        <p className="mb-0 text-muted small">{user.email}</p>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        View Details
                      </Button>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </div>
            ) : (
              <p className="text-center">No users available</p>
            )}
          </ModalBody>
        </Modal>

        {/* Media Modal */}
        <Modal show={showMediaModal} onHide={() => setShowMediaModal(false)} size="lg">
          <ModalHeader closeButton>
            <ModalTitle>Media & Links Overview</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="row g-3">
              <div className="col-12">
                <h6>Recent Attachments</h6>
                <ListGroup>
                  <ListGroupItem className="d-flex align-items-center">
                    <IconifyIcon icon="solar:file-text-bold" className="fs-24 text-primary me-3" />
                    <div className="flex-grow-1">
                      <strong>Project_Report.pdf</strong>
                      <p className="mb-0 text-muted small">From: John Doe • 2.4 MB</p>
                    </div>
                    <Button variant="outline-primary" size="sm">Download</Button>
                  </ListGroupItem>
                  <ListGroupItem className="d-flex align-items-center">
                    <IconifyIcon icon="solar:gallery-bold" className="fs-24 text-success me-3" />
                    <div className="flex-grow-1">
                      <strong>Screenshots.zip</strong>
                      <p className="mb-0 text-muted small">From: Sarah Martinez • 5.1 MB</p>
                    </div>
                    <Button variant="outline-primary" size="sm">Download</Button>
                  </ListGroupItem>
                </ListGroup>
              </div>
              <div className="col-12 mt-4">
                <h6>Shared Links</h6>
                <ListGroup>
                  <ListGroupItem>
                    <IconifyIcon icon="solar:link-bold" className="me-2 text-info" />
                    <a href="#" className="text-decoration-none">https://example.com/document</a>
                    <small className="text-muted d-block">Shared by Robert V. Leavitt</small>
                  </ListGroupItem>
                </ListGroup>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* Search Modal */}
        <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)}>
          <ModalHeader closeButton>
            <ModalTitle>Advanced Email Search</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Form>
              <div className="mb-3">
                <label className="form-label">Search Keywords</label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search in emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="primary" onClick={() => toast.success("Search executed")}>
                    <IconifyIcon icon="solar:magnifer-broken" />
                  </Button>
                </InputGroup>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Email Folder</label>
                  <Form.Select>
                    <option>All Folders</option>
                    <option>Inbox</option>
                    <option>Sent</option>
                    <option>Draft</option>
                    <option>Trash</option>
                  </Form.Select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date Range</label>
                  <Form.Control type="date" />
                </div>
                <div className="col-12">
                  <Form.Check type="checkbox" label="Has attachments" className="mb-2" />
                  <Form.Check type="checkbox" label="Unread only" className="mb-2" />
                  <Form.Check type="checkbox" label="Starred emails" />
                </div>
              </div>
            </Form>
          </ModalBody>
        </Modal>

        {/* Wallpaper Modal */}
        <Modal show={showWallpaperModal} onHide={() => setShowWallpaperModal(false)}>
          <ModalHeader closeButton>
            <ModalTitle>Email List Appearance</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <h6>List Theme</h6>
              <div className="d-flex gap-3 mb-3">
                <Button
                  variant="outline-light"
                  className="border"
                  onClick={() => {
                    document.getElementById('emaillist')?.classList.remove('dark-theme');
                    toast.success("Light theme applied to email list");
                  }}
                >
                  ☀️ Light
                </Button>
                <Button
                  variant="outline-dark"
                  onClick={() => {
                    document.getElementById('emaillist')?.classList.add('dark-theme');
                    toast.success("Dark theme applied to email list");
                  }}
                >
                  🌙 Dark
                </Button>
              </div>
            </div>
            <div>
              <h6>Email Density</h6>
              <Form.Check
                type="radio"
                name="density"
                label="Compact view"
                className="mb-2"
                onChange={() => toast.success("Compact view enabled")}
              />
              <Form.Check
                type="radio"
                name="density"
                label="Comfortable view"
                defaultChecked
                onChange={() => toast.success("Comfortable view enabled")}
              />
            </div>
          </ModalBody>
        </Modal>

        {/* More Options Modal */}
        <Modal show={showMoreModal} onHide={() => setShowMoreModal(false)}>
          <ModalHeader closeButton>
            <ModalTitle>Email Management Options</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <ListGroup variant="flush">
              <ListGroupItem action onClick={() => toast.success("Marking all emails as read...")}>
                <IconifyIcon icon="solar:check-circle-bold" className="me-2 text-success" />
                Mark all as read
              </ListGroupItem>
              <ListGroupItem action onClick={() => toast.success("Selecting all emails...")}>
                <IconifyIcon icon="solar:checklist-bold" className="me-2 text-primary" />
                Select all emails
              </ListGroupItem>
              <ListGroupItem action onClick={() => toast.success("Archiving selected emails...")}>
                <IconifyIcon icon="solar:archive-bold" className="me-2 text-info" />
                Archive selected
              </ListGroupItem>
              <ListGroupItem action onClick={() => toast.success("Deleting selected emails...")}>
                <IconifyIcon icon="solar:trash-bin-minimalistic-bold" className="me-2 text-danger" />
                Delete selected
              </ListGroupItem>
              <ListGroupItem action onClick={() => toast.success("Refreshing email list...")}>
                <IconifyIcon icon="solar:refresh-bold" className="me-2 text-secondary" />
                Refresh list
              </ListGroupItem>
              <ListGroupItem action onClick={() => toast.success("Opening email settings...")}>
                <IconifyIcon icon="solar:settings-bold" className="me-2 text-dark" />
                Email preferences
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default InboxMail;
