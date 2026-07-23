"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { DirectoryViewMode } from "@/hooks/useDirectoryView";
import type { ReactNode } from "react";
import { Button, ButtonGroup } from "react-bootstrap";

type DirectoryToolbarProps = {
  title: string;
  description: string;
  view: DirectoryViewMode;
  onViewChange: (view: DirectoryViewMode) => void;
  actions?: ReactNode;
};

const DirectoryToolbar = ({ title, description, view, onViewChange, actions }: DirectoryToolbarProps) => (
  <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
    <div>
      <h4 className="mb-1">{title}</h4>
      <p className="text-muted mb-0">{description}</p>
    </div>
    <div className="d-flex flex-wrap align-items-center gap-2">
      {actions}
      <ButtonGroup aria-label="Directory view">
        <Button
          variant={view === "grid" ? "primary" : "outline-primary"}
          aria-label="Grid view"
          title="Grid view"
          aria-pressed={view === "grid"}
          onClick={() => onViewChange("grid")}
        >
          <IconifyIcon icon="ri:grid-line" />
        </Button>
        <Button
          variant={view === "list" ? "primary" : "outline-primary"}
          aria-label="List view"
          title="List view"
          aria-pressed={view === "list"}
          onClick={() => onViewChange("list")}
        >
          <IconifyIcon icon="ri:list-check" />
        </Button>
      </ButtonGroup>
    </div>
  </div>
);

export default DirectoryToolbar;
