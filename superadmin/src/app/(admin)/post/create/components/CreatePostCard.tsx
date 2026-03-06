"use client";

import { Card, CardBody, CardHeader, CardTitle, ListGroup } from "react-bootstrap";

interface CreatePostCardProps {
  mode?: "create" | "edit";
}

const CreatePostCard = ({ mode = "create" }: CreatePostCardProps) => {
  const isEditMode = mode === "edit";

  return (
    <Card className="h-100">
      <CardHeader>
        <CardTitle as="h4" className="mb-0">
          {isEditMode ? "Edit Workflow" : "Publishing Checklist"}
        </CardTitle>
      </CardHeader>
      <CardBody>
        <p className="text-muted">
          {isEditMode
            ? "Update the notice content, publication status, and featured flag carefully so resident communication stays accurate."
            : "Create a tenant-scoped notice with clean publication metadata so it renders correctly across the apps."}
        </p>
        <ListGroup variant="flush">
          <ListGroup.Item className="px-0">Use a clear title and complete body copy.</ListGroup.Item>
          <ListGroup.Item className="px-0">Set the correct category, priority, and publication status.</ListGroup.Item>
          <ListGroup.Item className="px-0">Only attach valid image or video URLs that residents can access.</ListGroup.Item>
          <ListGroup.Item className="px-0">Use featured only for high-visibility community communication.</ListGroup.Item>
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default CreatePostCard;
