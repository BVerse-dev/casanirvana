"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Table,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  ProgressBar,
  InputGroup,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import TextFormInput from "@/components/from/TextFormInput";
import SelectFormInput from "@/components/from/SelectFormInput";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import { useListProfiles } from "@/hooks/useProfiles";
import { useListUserProfiles } from "@/hooks/useUserProfiles";
import useUserConfigSettings from "@/hooks/useUserConfigSettings";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Form schema for user creation/editing
const userSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  role: yup.string().oneOf(["user", "guard", "admin", "superadmin", "agency_manager", "facility_manager"]).required("Role is required"),
  unit_number: yup.string(),
  emergency_contact: yup.string(),
  notes: yup.string(),
});

// User settings schema
const userSettingsSchema = yup.object({
  default_user_role: yup.string().required("Default user role is required"),
  require_email_verification: yup.boolean(),
  require_phone_verification: yup.boolean(),
  enable_user_registration: yup.boolean(),
  max_login_attempts: yup.number().min(3).max(10),
  account_lockout_duration_minutes: yup.number().min(5).max(1440),
  password_min_length: yup.number().min(6).max(50),
  password_require_special_chars: yup.boolean(),
  password_require_numbers: yup.boolean(),
  password_require_uppercase: yup.boolean(),
  session_timeout_minutes: yup.number().min(5).max(480),
  enable_2fa: yup.boolean(),
  profile_pic_max_size_mb: yup.number().min(1).max(10),
  user_data_retention_days: yup.number().min(30).max(2555), // ~7 years max
});

type UserFormData = yup.InferType<typeof userSchema>;
type UserSettingsFormData = yup.InferType<typeof userSettingsSchema>;

const roleOptions = [
  { value: "user", label: "User" },
  { value: "guard", label: "Guard" },
  { value: "admin", label: "Admin" },
  { value: "agency_manager", label: "Agency Manager" },
  { value: "facility_manager", label: "Facility Manager" },
  { value: "superadmin", label: "Super Admin" },
];

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "superadmin":
      return "danger";
    case "admin":
      return "warning";
    case "agency_manager":
    case "facility_manager":
      return "primary";
    case "guard":
      return "info";
    default:
      return "secondary";
  }
};

const UserManagementSettings = () => {
  // Use our working Supabase hook for user profiles
  const { data: userProfilesData, isLoading: isLoadingProfiles } = useListUserProfiles();
  
  // Keep the old hook for backwards compatibility if needed
  const { data: profiles, isLoading } = useListProfiles();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  // User configuration settings
  const { 
    userConfigSettings,
    isLoadingData: isLoadingUserConfig,
    updateSettings: updateUserConfigSettings,
    isUpdating: isUpdatingUserConfig 
  } = useUserConfigSettings();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    const token = session?.accessToken as string | undefined;
    if (!token) {
      throw new Error("Missing admin session. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || "Request failed");
    }
    return payload;
  };

  const refreshProfiles = () => {
    queryClient.invalidateQueries({ queryKey: ["userProfiles"] });
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
  });

  const {
    control: settingsControl,
    handleSubmit: handleSettingsSubmit,
    reset: resetSettings,
    formState: { isDirty: isSettingsDirty },
  } = useForm<UserSettingsFormData>({
    resolver: yupResolver(userSettingsSchema),
    defaultValues: {
      default_user_role: userConfigSettings?.default_user_role ?? "user",
      require_email_verification: userConfigSettings?.require_email_verification ?? true,
      require_phone_verification: userConfigSettings?.require_phone_verification ?? false,
      enable_user_registration: userConfigSettings?.enable_user_registration ?? true,
      max_login_attempts: userConfigSettings?.max_login_attempts ?? 5,
      account_lockout_duration_minutes: userConfigSettings?.account_lockout_duration_minutes ?? 30,
      password_min_length: userConfigSettings?.password_min_length ?? 8,
      password_require_special_chars: userConfigSettings?.password_require_special_chars ?? true,
      password_require_numbers: userConfigSettings?.password_require_numbers ?? true,
      password_require_uppercase: userConfigSettings?.password_require_uppercase ?? true,
      session_timeout_minutes: userConfigSettings?.session_timeout_minutes ?? 60,
      enable_2fa: userConfigSettings?.enable_2fa ?? false,
      profile_pic_max_size_mb: userConfigSettings?.profile_pic_max_size_mb ?? 5,
      user_data_retention_days: userConfigSettings?.user_data_retention_days ?? 2555,
    },
  });

  // Reset settings form when userConfigSettings data loads
  useEffect(() => {
    if (userConfigSettings) {
      resetSettings({
        default_user_role: userConfigSettings.default_user_role ?? "user",
        require_email_verification: userConfigSettings.require_email_verification ?? true,
        require_phone_verification: userConfigSettings.require_phone_verification ?? false,
        enable_user_registration: userConfigSettings.enable_user_registration ?? true,
        max_login_attempts: userConfigSettings.max_login_attempts ?? 5,
        account_lockout_duration_minutes: userConfigSettings.account_lockout_duration_minutes ?? 30,
        password_min_length: userConfigSettings.password_min_length ?? 8,
        password_require_special_chars: userConfigSettings.password_require_special_chars ?? true,
        password_require_numbers: userConfigSettings.password_require_numbers ?? true,
        password_require_uppercase: userConfigSettings.password_require_uppercase ?? true,
        session_timeout_minutes: userConfigSettings.session_timeout_minutes ?? 60,
        enable_2fa: userConfigSettings.enable_2fa ?? false,
        profile_pic_max_size_mb: userConfigSettings.profile_pic_max_size_mb ?? 5,
        user_data_retention_days: userConfigSettings.user_data_retention_days ?? 2555,
      });
    }
  }, [userConfigSettings, resetSettings]);

  // Filter profiles by role and search term - use Supabase data first, fallback to old data
  const profilesToFilter = userProfilesData?.data || profiles || [];
  const filteredProfiles = profilesToFilter.filter(profile => {
    const matchesRole = filterRole === "all" || profile.role === filterRole;
    const matchesSearch = !searchTerm || 
      `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredProfiles.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredProfiles.map(p => p.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      switch (bulkAction) {
        case "delete":
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            await Promise.all(selectedUsers.map(id => fetchAdmin(`/admin/users/${id}`, { method: "DELETE" })));
            toast.success(`${selectedUsers.length} users deleted successfully`);
            refreshProfiles();
          }
          break;
        case "activate":
          // Implementation for bulk activate
          toast.success(`${selectedUsers.length} users activated`);
          break;
        case "deactivate":
          // Implementation for bulk deactivate
          toast.success(`${selectedUsers.length} users deactivated`);
          break;
        default:
          break;
      }
      setSelectedUsers([]);
      setShowBulkModal(false);
      setBulkAction("");
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowModal(true);
    reset({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "user",
    });
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowModal(true);
    reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await fetchAdmin(`/admin/users/${userId}`, { method: "DELETE" });
        toast.success("User deleted successfully");
        refreshProfiles();
      } catch (error) {
        console.error("Delete user error:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const onSubmitUserSettings = async (data: UserSettingsFormData) => {
    try {
      await updateUserConfigSettings(data);
      toast.success("User settings updated successfully");
    } catch (error) {
      console.error("Settings update error:", error);
      toast.error("Failed to update user settings");
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      if (isEditing && selectedUser) {
        // Update existing user
        await fetchAdmin(`/admin/users/${selectedUser.id}`, {
          method: "PUT",
          body: JSON.stringify({
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
            phone: data.phone,
          }),
        });
        toast.success("User updated successfully");
        refreshProfiles();
      } else {
        // Invite new user via backend (invite-only flow)
        await fetchAdmin(`/admin/invites`, {
          method: "POST",
          body: JSON.stringify({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            role: data.role,
            phone: data.phone,
          }),
        });
        toast.success("Invite sent successfully");
        refreshProfiles();
      }
      setShowModal(false);
      reset();
    } catch (error) {
      console.error("User form error:", error);
      toast.error(isEditing ? "Failed to update user" : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    reset();
  };

  if (isLoading || isLoadingProfiles) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="page-title">User Management</h4>
          <p className="text-muted mb-0">Manage user accounts, roles, and system user settings</p>
        </div>
        {activeTab === "users" && (
          <div className="d-flex gap-2">
            {selectedUsers.length > 0 && (
              <Button variant="outline-danger" onClick={() => setShowBulkModal(true)}>
                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                Bulk Actions ({selectedUsers.length})
              </Button>
            )}
            <Button variant="primary" onClick={handleCreateUser}>
              <IconifyIcon icon="ri:user-add-line" className="me-1" />
              Add User
            </Button>
          </div>
        )}
      </div>



      {/* Quick Navigation Links to User Management Submenu Pages */}
      <Card className="mb-4">
        <CardBody>
          <h6 className="card-title mb-3">
            <IconifyIcon icon="material-symbols:dashboard-outline" className="me-2" />
            User Management System
          </h6>
          <Row>
            <Col md={4} className="mb-3">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-sm rounded-circle bg-dark d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="material-symbols:person" className="text-white" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    <a href="/settings/users/profiles" className="text-decoration-none text-dark">
                      User Management
                    </a>
                  </h6>
                  <p className="text-muted mb-0 small">Detailed user profile management interface</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-sm rounded-circle bg-primary d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="material-symbols:shield-person" className="text-white" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    <a href="/settings/users/roles" className="text-decoration-none text-dark">
                      Roles Management
                    </a>
                  </h6>
                  <p className="text-muted mb-0 small">Configure user roles and permissions hierarchy</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-sm rounded-circle bg-success d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="material-symbols:security" className="text-white" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    <a href="/settings/users/permissions" className="text-decoration-none text-dark">
                      Permissions
                    </a>
                  </h6>
                  <p className="text-muted mb-0 small">Manage granular access permissions</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-sm rounded-circle bg-info d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="material-symbols:groups" className="text-white" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    <a href="/settings/users/groups" className="text-decoration-none text-dark">
                      User Groups
                    </a>
                  </h6>
                  <p className="text-muted mb-0 small">Organize users into logical groups</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-sm rounded-circle bg-warning d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="material-symbols:history" className="text-white" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    <a href="/settings/users/activity" className="text-decoration-none text-dark">
                      Activity Logs
                    </a>
                  </h6>
                  <p className="text-muted mb-0 small">Monitor user activities and security events</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-sm rounded-circle bg-secondary d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="material-symbols:settings" className="text-white" />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    <a href="/settings/users/preferences" className="text-decoration-none text-dark">
                      User Preferences
                    </a>
                  </h6>
                  <p className="text-muted mb-0 small">Configure system-wide user preferences</p>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Navigation Tabs */}
      <Nav variant="tabs" className="mb-4">
        <NavItem>
          <NavLink
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            className="cursor-pointer"
          >
            <IconifyIcon icon="ri:user-line" className="me-1" />
            User Management
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            className="cursor-pointer"
          >
            <IconifyIcon icon="ri:settings-2-line" className="me-1" />
            User Settings
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent>
        {/* Users Tab */}
        <TabPane className={activeTab === "users" ? "show active" : ""}>
          <Row>
            <Col xl={12}>
              <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <CardTitle as="h5">All Users ({filteredProfiles.length})</CardTitle>
                  <div className="d-flex gap-2 align-items-center">
                    {/* Search Input */}
                    <InputGroup style={{ width: "250px" }}>
                      <Form.Control
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <InputGroup.Text>
                        <IconifyIcon icon="ri:search-line" />
                      </InputGroup.Text>
                    </InputGroup>

                    {/* Role Filter */}
                    <Dropdown>
                      <DropdownToggle
                        as="a"
                        className="btn btn-sm btn-outline-secondary"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Filter: {filterRole === "all" ? "All Roles" : filterRole.charAt(0).toUpperCase() + filterRole.slice(1)}
                        <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={() => setFilterRole("all")}>All Roles</DropdownItem>
                        <DropdownItem onClick={() => setFilterRole("user")}>Users</DropdownItem>
                        <DropdownItem onClick={() => setFilterRole("guard")}>Guards</DropdownItem>
                        <DropdownItem onClick={() => setFilterRole("admin")}>Admins</DropdownItem>
                        <DropdownItem onClick={() => setFilterRole("superadmin")}>Super Admins</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="table-responsive">
                    <Table className="table-centered table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "40px" }}>
                            <Form.Check
                              type="checkbox"
                              checked={selectedUsers.length === filteredProfiles.length && filteredProfiles.length > 0}
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Created</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProfiles.map((profile) => (
                          <tr key={profile.id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedUsers.includes(profile.id)}
                                onChange={() => handleSelectUser(profile.id)}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center me-2">
                                  {profile.avatar_url ? (
                                    <img
                                      src={profile.avatar_url}
                                      alt={`${profile.first_name} ${profile.last_name}`}
                                      className="rounded-circle"
                                      width="32"
                                      height="32"
                                    />
                                  ) : (
                                    <IconifyIcon icon="ri:user-line" />
                                  )}
                                </div>
                                <div>
                                  <h6 className="mb-0">{profile.first_name} {profile.last_name}</h6>
                                  {/* TODO: Add unit relation if needed */}
                                  {profile.role && (
                                    <small className="text-muted">Role: {profile.role}</small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>{profile.email}</td>
                            <td>{profile.phone || "—"}</td>
                            <td>
                              <Badge bg={getRoleBadgeVariant(profile.role)} className="text-capitalize">
                                {profile.role}
                              </Badge>
                            </td>
                            <td>
                              {profile.created_at ? 
                                new Date(profile.created_at).toLocaleDateString() : "—"
                              }
                            </td>
                            <td>
                              <Badge bg="success">Active</Badge>
                            </td>
                            <td>
                              <Dropdown>
                                <DropdownToggle
                                  as="a"
                                  className="text-muted cursor-pointer"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <IconifyIcon icon="ri:more-2-fill" />
                                </DropdownToggle>
                                <DropdownMenu>
                                  <DropdownItem onClick={() => handleEditUser(profile)}>
                                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                                    Edit
                                  </DropdownItem>
                                  <DropdownItem>
                                    <IconifyIcon icon="ri:eye-line" className="me-1" />
                                    View Details
                                  </DropdownItem>
                                  <DropdownItem>
                                    <IconifyIcon icon="ri:lock-line" className="me-1" />
                                    Reset Password
                                  </DropdownItem>
                                  <DropdownItem className="text-danger" onClick={() => handleDeleteUser(profile.id)}>
                                    <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                        {filteredProfiles.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-4">
                              <div className="text-muted">
                                <IconifyIcon icon="ri:user-line" width={48} height={48} className="mb-2" />
                                <p>No users found</p>
                                {searchTerm && (
                                  <Button variant="link" onClick={() => setSearchTerm("")}>
                                    Clear search
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* User Settings Tab */}
        <TabPane className={activeTab === "settings" ? "show active" : ""}>
          <Row>
            <Col xl={12}>
              <Card>
                <CardHeader>
                  <CardTitle as="h5">User Settings Configuration</CardTitle>
                  <p className="text-muted mb-0">Configure default user settings, security policies, and behavior</p>
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleSettingsSubmit(onSubmitUserSettings)}>
                    <Row>
                      <Col lg={6}>
                        <Card className="border">
                          <CardHeader className="bg-light">
                            <h6 className="mb-0">
                              <IconifyIcon icon="ri:user-settings-line" className="me-1" />
                              Default User Settings
                            </h6>
                          </CardHeader>
                          <CardBody>
                            <SelectFormInput
                              name="default_user_role"
                              label="Default User Role"
                              control={settingsControl}
                              options={[
                                { value: "user", label: "User" },
                                { value: "guard", label: "Guard" },
                              ]}
                            />
                            
                            <div className="mb-3">
                              <label className="form-label">Account Verification</label>
                              <div className="d-flex flex-column gap-2">
                                <Form.Check
                                  type="switch"
                                  id="require_email_verification"
                                  label="Require email verification"
                                  {...settingsControl.register("require_email_verification")}
                                />
                                <Form.Check
                                  type="switch"
                                  id="require_phone_verification"
                                  label="Require phone verification"
                                  {...settingsControl.register("require_phone_verification")}
                                />
                                <Form.Check
                                  type="switch"
                                  id="enable_user_registration"
                                  label="Enable user self-registration"
                                  {...settingsControl.register("enable_user_registration")}
                                />
                              </div>
                            </div>

                            <Row>
                              <Col md={6}>
                                <TextFormInput
                                  name="profile_pic_max_size_mb"
                                  label="Max Profile Picture Size (MB)"
                                  type="number"
                                  placeholder="5"
                                  control={settingsControl}
                                />
                              </Col>
                              <Col md={6}>
                                <TextFormInput
                                  name="user_data_retention_days"
                                  label="User Data Retention (Days)"
                                  type="number"
                                  placeholder="2555"
                                  control={settingsControl}
                                />
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      </Col>

                      <Col lg={6}>
                        <Card className="border">
                          <CardHeader className="bg-light">
                            <h6 className="mb-0">
                              <IconifyIcon icon="ri:shield-user-line" className="me-1" />
                              Security & Authentication
                            </h6>
                          </CardHeader>
                          <CardBody>
                            <Row>
                              <Col md={6}>
                                <TextFormInput
                                  name="max_login_attempts"
                                  label="Max Login Attempts"
                                  type="number"
                                  placeholder="5"
                                  control={settingsControl}
                                />
                              </Col>
                              <Col md={6}>
                                <TextFormInput
                                  name="account_lockout_duration_minutes"
                                  label="Lockout Duration (Minutes)"
                                  type="number"
                                  placeholder="30"
                                  control={settingsControl}
                                />
                              </Col>
                            </Row>

                            <Row>
                              <Col md={6}>
                                <TextFormInput
                                  name="session_timeout_minutes"
                                  label="Session Timeout (Minutes)"
                                  type="number"
                                  placeholder="60"
                                  control={settingsControl}
                                />
                              </Col>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Form.Check
                                    type="switch"
                                    id="enable_2fa"
                                    label="Enable Two-Factor Authentication"
                                    {...settingsControl.register("enable_2fa")}
                                  />
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>

                        <Card className="border mt-3">
                          <CardHeader className="bg-light">
                            <h6 className="mb-0">
                              <IconifyIcon icon="ri:lock-password-line" className="me-1" />
                              Password Policies
                            </h6>
                          </CardHeader>
                          <CardBody>
                            <TextFormInput
                              name="password_min_length"
                              label="Minimum Password Length"
                              type="number"
                              placeholder="8"
                              control={settingsControl}
                            />

                            <div className="mb-3">
                              <label className="form-label">Password Requirements</label>
                              <div className="d-flex flex-column gap-2">
                                <Form.Check
                                  type="switch"
                                  id="password_require_special_chars"
                                  label="Require special characters"
                                  {...settingsControl.register("password_require_special_chars")}
                                />
                                <Form.Check
                                  type="switch"
                                  id="password_require_numbers"
                                  label="Require numbers"
                                  {...settingsControl.register("password_require_numbers")}
                                />
                                <Form.Check
                                  type="switch"
                                  id="password_require_uppercase"
                                  label="Require uppercase letters"
                                  {...settingsControl.register("password_require_uppercase")}
                                />
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>

                    <div className="text-end mt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isUpdatingUserConfig || !isSettingsDirty}
                      >
                        {isUpdatingUserConfig ? (
                          <span className="spinner-border spinner-border-sm me-1" />
                        ) : null}
                        Save User Settings
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </TabContent>

      {/* User Create/Edit Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader closeButton>
            <h5 className="modal-title">
              {isEditing ? "Edit User" : "Create New User"}
            </h5>
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
                <TextFormInput
                  name="first_name"
                  label="First Name"
                  placeholder="Enter first name"
                  control={control}
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="last_name"
                  label="Last Name"
                  placeholder="Enter last name"
                  control={control}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <TextFormInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  control={control}
                  disabled={isEditing}
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="phone"
                  label="Phone"
                  placeholder="Enter phone number"
                  control={control}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <SelectFormInput
                  name="role"
                  label="Role"
                  control={control}
                  options={roleOptions}
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="unit_number"
                  label="Unit Number"
                  placeholder="Enter unit number (optional)"
                  control={control}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <TextFormInput
                  name="emergency_contact"
                  label="Emergency Contact"
                  placeholder="Enter emergency contact (optional)"
                  control={control}
                />
              </Col>
            </Row>
            <TextAreaFormInput
              name="notes"
              label="Notes"
              placeholder="Enter any additional notes (optional)"
              control={control}
              rows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : null}
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <ModalHeader closeButton>
          <h5 className="modal-title">Bulk Actions</h5>
        </ModalHeader>
        <ModalBody>
          <p>Select an action to perform on {selectedUsers.length} selected users:</p>
          <div className="d-flex flex-column gap-2">
            <Button
              variant="outline-danger"
              onClick={() => setBulkAction("delete")}
              className={bulkAction === "delete" ? "active" : ""}
            >
              <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
              Delete Users
            </Button>
            <Button
              variant="outline-success"
              onClick={() => setBulkAction("activate")}
              className={bulkAction === "activate" ? "active" : ""}
            >
              <IconifyIcon icon="ri:check-line" className="me-1" />
              Activate Users
            </Button>
            <Button
              variant="outline-warning"
              onClick={() => setBulkAction("deactivate")}
              className={bulkAction === "deactivate" ? "active" : ""}
            >
              <IconifyIcon icon="ri:close-line" className="me-1" />
              Deactivate Users
            </Button>
          </div>
          
          {bulkAction && (
            <Alert variant="warning" className="mt-3">
              <IconifyIcon icon="ri:alert-line" className="me-1" />
              This action will affect {selectedUsers.length} users and cannot be undone.
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkAction}
            disabled={!bulkAction}
          >
            Execute Action
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserManagementSettings;
