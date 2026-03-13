"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Spinner } from "react-bootstrap";

import { useListCommunities } from "@/hooks/useCommunities";
import { useCreateNotice, useGetNotice, useUpdateNotice, type CreateNoticeData } from "@/hooks/useNotices";

interface NoticeFormData {
  community_id: string;
  title: string;
  body: string;
  author_name: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "published" | "archived";
  tags: string;
  image_url: string;
  video_url: string;
  is_featured: boolean;
}

interface CreatePostProps {
  mode?: "create" | "edit";
  noticeId?: string;
}

const noticeSchema = yup.object({
  community_id: yup.string().required("Please select a community"),
  title: yup.string().required("Please enter notice title"),
  body: yup.string().required("Please enter notice content"),
  author_name: yup.string().required("Please enter author name"),
  category: yup.string().required("Please select a category"),
  priority: yup.string().oneOf(["low", "medium", "high", "urgent"]).required(),
  status: yup.string().oneOf(["draft", "published", "archived"]).required(),
  tags: yup.string().default(""),
  image_url: yup.string().url("Please enter a valid image URL").nullable().transform((value) => value || null),
  video_url: yup.string().url("Please enter a valid video URL").nullable().transform((value) => value || null),
  is_featured: yup.boolean().required(),
});

const CreatePost = ({ mode = "create", noticeId }: CreatePostProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditMode = mode === "edit";
  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const { data: existingNotice, isLoading: isNoticeLoading, error: noticeLoadError } = useGetNotice(isEditMode && noticeId ? noticeId : "");
  const { data: communitiesPayload, isLoading: isCommunitiesLoading } = useListCommunities({ pageSize: 200 });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const communities = communitiesPayload?.data || [];

  const scopedCommunityId = useMemo(() => {
    const directCommunityId = (session?.user as any)?.communityId;
    if (typeof directCommunityId === "string" && directCommunityId.length > 0) {
      return directCommunityId;
    }

    const scopedIds = (session?.user as any)?.scopedCommunityIds;
    if (Array.isArray(scopedIds)) {
      const first = scopedIds.find((value) => typeof value === "string" && value.length > 0);
      if (first) return first;
    }

    return null;
  }, [session?.user]);

  const availableCommunities = useMemo(() => {
    if (existingNotice?.community_id && existingNotice.communities?.name) {
      const alreadyListed = communities.some((community) => community.id === existingNotice.community_id);
      if (!alreadyListed) {
        return [
          ...communities,
          {
            id: existingNotice.community_id,
            name: existingNotice.communities.name,
          },
        ];
      }
    }

    return communities;
  }, [communities, existingNotice?.communities?.name, existingNotice?.community_id]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormData>({
    resolver: yupResolver(noticeSchema),
    defaultValues: {
      community_id: scopedCommunityId || "",
      title: "",
      body: "",
      author_name: session?.user?.name || session?.user?.email || "Administrator",
      category: "general",
      priority: "medium",
      status: "published",
      tags: "",
      image_url: "",
      video_url: "",
      is_featured: false,
    },
  });
  const selectedCommunityId = watch("community_id");

  useEffect(() => {
    if (!isEditMode || !existingNotice) return;

    reset({
      community_id: existingNotice.community_id || "",
      title: existingNotice.title || "",
      body: existingNotice.body || "",
      author_name: existingNotice.author_name || session?.user?.name || session?.user?.email || "Administrator",
      category: existingNotice.category || "general",
      priority: (existingNotice.priority as NoticeFormData["priority"]) || "medium",
      status: ((existingNotice.status || "published") as NoticeFormData["status"]),
      tags: Array.isArray(existingNotice.tags) ? existingNotice.tags.join(", ") : "",
      image_url: existingNotice.image_url || "",
      video_url: existingNotice.video_url || "",
      is_featured: Boolean(existingNotice.is_featured),
    });
  }, [existingNotice, isEditMode, reset, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (isEditMode || selectedCommunityId) return;

    const preferredCommunityId =
      scopedCommunityId && availableCommunities.some((community) => community.id === scopedCommunityId)
        ? scopedCommunityId
        : availableCommunities.length === 1
          ? availableCommunities[0].id
          : "";

    if (preferredCommunityId) {
      setValue("community_id", preferredCommunityId, { shouldDirty: false });
    }
  }, [availableCommunities, isEditMode, scopedCommunityId, selectedCommunityId, setValue]);

  const onSubmit = async (formData: NoticeFormData) => {
    setSubmitError(null);

    if (!formData.community_id) {
      setSubmitError("Select a community before publishing this notice.");
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const noticeData: CreateNoticeData = {
      community_id: formData.community_id,
      title: formData.title.trim(),
      body: formData.body.trim(),
      author_name: formData.author_name.trim(),
      author_avatar: session?.user?.image || undefined,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      tags,
      image_url: formData.image_url || undefined,
      video_url: formData.video_url || undefined,
      is_featured: formData.is_featured,
      posted_at: formData.status === "published" ? existingNotice?.posted_at || new Date().toISOString() : null,
    };

    try {
      if (isEditMode) {
        if (!noticeId) {
          setSubmitError("Missing notice ID for edit operation.");
          return;
        }
        await updateNoticeMutation.mutateAsync({ id: noticeId, ...noticeData });
        router.push(`/post/details?id=${noticeId}`);
      } else {
        const createdNotice = await createNoticeMutation.mutateAsync(noticeData);
        router.push(`/post/details?id=${createdNotice.id}`);
      }
    } catch (submitMutationError) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} notice:`, submitMutationError);
      setSubmitError(submitMutationError instanceof Error ? submitMutationError.message : `Failed to ${isEditMode ? "update" : "create"} notice.`);
    }
  };

  if (isEditMode && isNoticeLoading) {
    return <Alert variant="info">Loading notice details...</Alert>;
  }

  if (isEditMode && noticeLoadError) {
    return <Alert variant="danger">Failed to load notice for editing.</Alert>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-notice-form>
      {submitError ? <Alert variant="danger">{submitError}</Alert> : null}
      {!availableCommunities.length && !isCommunitiesLoading ? (
        <Alert variant="warning">No publishable communities are available for this admin account. Assign a community before creating notices.</Alert>
      ) : null}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4">Notice Content</CardTitle>
        </CardHeader>
        <CardBody>
          <Row className="g-3">
            <Col lg={8}>
              <Form.Label>Title *</Form.Label>
              <Controller name="title" control={control} render={({ field }) => <Form.Control {...field} placeholder="Enter notice title" isInvalid={Boolean(errors.title)} />} />
              <Form.Control.Feedback type="invalid" className={errors.title ? "d-block" : ""}>{errors.title?.message}</Form.Control.Feedback>
            </Col>
            <Col lg={4}>
              <Form.Label>Author *</Form.Label>
              <Controller name="author_name" control={control} render={({ field }) => <Form.Control {...field} placeholder="Author name" isInvalid={Boolean(errors.author_name)} />} />
              <Form.Control.Feedback type="invalid" className={errors.author_name ? "d-block" : ""}>{errors.author_name?.message}</Form.Control.Feedback>
            </Col>
            <Col lg={12}>
              <Form.Label>Body *</Form.Label>
              <Controller name="body" control={control} render={({ field }) => <Form.Control as="textarea" rows={8} {...field} placeholder="Write the notice content..." isInvalid={Boolean(errors.body)} />} />
              <Form.Control.Feedback type="invalid" className={errors.body ? "d-block" : ""}>{errors.body?.message}</Form.Control.Feedback>
            </Col>
            <Col lg={12}>
              <Form.Label>Tags</Form.Label>
              <Controller name="tags" control={control} render={({ field }) => <Form.Control {...field} placeholder="Comma-separated tags, e.g. Security, Community Update" />} />
              <Form.Text className="text-muted">Use comma-separated tags for filtering and discovery.</Form.Text>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4">Publication Settings</CardTitle>
        </CardHeader>
        <CardBody>
          <Row className="g-3">
            <Col lg={12}>
              <Form.Label>Community *</Form.Label>
              <Controller
                name="community_id"
                control={control}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={Boolean(errors.community_id)} disabled={isCommunitiesLoading || !availableCommunities.length}>
                    <option value="">{isCommunitiesLoading ? "Loading communities..." : "Select community"}</option>
                    {availableCommunities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name || "Unnamed Community"}
                      </option>
                    ))}
                  </Form.Select>
                )}
              />
              <Form.Control.Feedback type="invalid" className={errors.community_id ? "d-block" : ""}>
                {errors.community_id?.message}
              </Form.Control.Feedback>
            </Col>
            <Col lg={4}>
              <Form.Label>Category *</Form.Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={Boolean(errors.category)}>
                    <option value="general">General Announcements</option>
                    <option value="maintenance">Maintenance & Repairs</option>
                    <option value="events">Community Events</option>
                    <option value="security">Security & Safety</option>
                    <option value="amenities">Amenities Management</option>
                    <option value="administrative">Administrative</option>
                    <option value="emergency">Emergency Alerts</option>
                    <option value="financial">Financial & Billing</option>
                    <option value="rules">Rules & Regulations</option>
                    <option value="visitors">Visitor Management</option>
                    <option value="utilities">Utilities & Services</option>
                  </Form.Select>
                )}
              />
            </Col>
            <Col lg={4}>
              <Form.Label>Priority *</Form.Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={Boolean(errors.priority)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                )}
              />
            </Col>
            <Col lg={4}>
              <Form.Label>Status *</Form.Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Form.Select {...field} isInvalid={Boolean(errors.status)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                )}
              />
            </Col>
            <Col lg={6}>
              <Form.Label>Image URL</Form.Label>
              <Controller name="image_url" control={control} render={({ field }) => <Form.Control {...field} placeholder="https://example.com/image.jpg" isInvalid={Boolean(errors.image_url)} />} />
              <Form.Control.Feedback type="invalid" className={errors.image_url ? "d-block" : ""}>{errors.image_url?.message}</Form.Control.Feedback>
            </Col>
            <Col lg={6}>
              <Form.Label>Video URL</Form.Label>
              <Controller name="video_url" control={control} render={({ field }) => <Form.Control {...field} placeholder="https://example.com/video.mp4" isInvalid={Boolean(errors.video_url)} />} />
              <Form.Control.Feedback type="invalid" className={errors.video_url ? "d-block" : ""}>{errors.video_url?.message}</Form.Control.Feedback>
            </Col>
            <Col lg={12}>
              <Controller
                name="is_featured"
                control={control}
                render={({ field }) => (
                  <Form.Check
                    type="switch"
                    id="notice-featured"
                    label="Mark as featured notice"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={() => router.push("/post")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedCommunityId}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="me-2" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : isEditMode ? (
            "Update Notice"
          ) : (
            "Create Notice"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreatePost;
