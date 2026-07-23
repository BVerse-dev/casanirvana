"use client";

import { Icon } from "@iconify/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from "react-bootstrap";

const getInitials = (name?: string | null, email?: string | null) => {
  const source = name?.trim() || email?.trim() || "Administrator";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const ProfileDropdown = () => {
  const { data: session } = useSession();
  const displayName = session?.user?.name?.trim() || "Administrator";
  const email = session?.user?.email || "Signed-in administrator";
  const supportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://casanirvana.app"}/contact-us/?reason=Support`;

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle as="button" className="topbar-link drop-arrow-none px-2 border-0" aria-label="Open account menu">
        <span className="avatar-sm rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-semibold">
          {getInitials(displayName, email)}
        </span>
      </DropdownToggle>
      <DropdownMenu align="end" className="dropdown-menu-end profile-dropdown">
        <DropdownHeader className="noti-title">
          <h6 className="text-overflow m-0">{displayName}</h6>
          <small className="text-muted text-truncate d-block">{email}</small>
        </DropdownHeader>
        <DropdownItem as={Link} href="/dashboards/analytics">
          <Icon icon="solar:home-2-broken" className="me-1 fs-18 align-middle" />
          <span className="align-middle">Dashboard</span>
        </DropdownItem>
        <DropdownItem as="a" href={supportUrl} target="_blank" rel="noreferrer">
          <Icon icon="solar:help-broken" className="me-1 fs-18 align-middle" />
          <span className="align-middle">Help &amp; support</span>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          as="button"
          className="text-danger fw-semibold"
          onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
        >
          <Icon icon="solar:logout-2-broken" className="me-1 fs-18 align-middle" />
          <span className="align-middle">Sign out</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
