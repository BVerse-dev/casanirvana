"use client";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import TextFormInput from "@/components/from/TextFormInput";
import SelectFormInput from "@/components/from/SelectFormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { useCreateNotice, useGetNotice, useUpdateNotice, type CreateNoticeData } from "@/hooks/useNotices";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

interface NoticeFormData {
  title: string;
  body: string;
  tags: string[];
  author_name: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  image_url: string;
  video_url: string;
}

interface CreatePostProps {
  mode?: "create" | "edit";
  noticeId?: string;
}

const normalizeCategory = (value?: string | null) => (value || "").toLowerCase();

const CreatePost = ({ mode = "create", noticeId }: CreatePostProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditMode = mode === "edit";
  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const { data: existingNotice, isLoading: isNoticeLoading, error: noticeLoadError } = useGetNotice(
    isEditMode && noticeId ? noticeId : ""
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const scopedCommunityId = useMemo(() => {
    const directCommunityId = session?.user?.communityId;
    if (typeof directCommunityId === "string" && directCommunityId.length > 0) {
      return directCommunityId;
    }

    const firstScopedCommunityId = session?.user?.scopedCommunityIds?.find(
      (id): id is string => typeof id === "string" && id.length > 0
    );

    return firstScopedCommunityId || null;
  }, [session?.user?.communityId, session?.user?.scopedCommunityIds]);

  const noticeSchema = yup.object({
    title: yup.string().required("Please enter notice title"),
    body: yup.string().required("Please enter notice content"),
    author_name: yup.string().required("Please enter author name"),
    category: yup.string().required("Please select a category"),
    priority: yup.string().oneOf(['low', 'medium', 'high', 'urgent']).required("Please select priority"),
    tags: yup.array().of(yup.string().required()).min(1, "Please select at least one tag").required(),
    image_url: yup.string().url("Please enter a valid URL").optional().default(''),
    video_url: yup.string().url("Please enter a valid URL").optional().default(''),
  });

  const { handleSubmit, control, reset, formState: { isSubmitting } } = useForm<NoticeFormData>({
    resolver: yupResolver(noticeSchema),
    defaultValues: {
      title: '',
      body: '',
      author_name: 'Administrator',
      category: '',
      priority: 'medium',
      tags: [],
      image_url: '',
      video_url: '',
    }
  });

  useEffect(() => {
    if (!isEditMode || !existingNotice) return;

    reset({
      title: existingNotice.title || "",
      body: existingNotice.body || "",
      author_name: existingNotice.author_name || "Administrator",
      category: normalizeCategory(existingNotice.category),
      priority: ((existingNotice.priority || "medium") as NoticeFormData["priority"]),
      tags: Array.isArray(existingNotice.tags) ? existingNotice.tags : [],
      image_url: existingNotice.image_url || "",
      video_url: existingNotice.video_url || "",
    });
  }, [isEditMode, existingNotice, reset]);

  const onSubmit = async (formData: NoticeFormData) => {
    try {
      setSubmitError(null);
      const targetCommunityId = existingNotice?.community_id || scopedCommunityId;

      if (!targetCommunityId) {
        setSubmitError("No community scope is assigned to this admin account. Contact superadmin.");
        return;
      }
      
      // Prepare notice data for Supabase
      const noticeData: CreateNoticeData = {
        community_id: targetCommunityId,
        title: formData.title,
        body: formData.body,
        author_name: formData.author_name,
        author_avatar: '/images/users/avatar-6.jpg', // Default avatar
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags,
        image_url: formData.image_url || undefined,
        video_url: formData.video_url || undefined,
        is_featured: false,
      };

      if (isEditMode) {
        if (!noticeId) {
          setSubmitError("Missing notice ID for edit operation.");
          return;
        }

        await updateNoticeMutation.mutateAsync({
          id: noticeId,
          ...noticeData,
        });
        router.push(`/post/details?id=${noticeId}`);
      } else {
        await createNoticeMutation.mutateAsync(noticeData);
        router.push('/post');
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} notice:`, error);
      setSubmitError(error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} notice`);
    }
  };

  if (isEditMode && isNoticeLoading) {
    return (
      <Alert variant="info" className="mb-3">
        Loading notice details...
      </Alert>
    );
  }

  if (isEditMode && noticeLoadError) {
    return (
      <Alert variant="danger" className="mb-3">
        Failed to load notice for editing.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-notice-form>
      {submitError && (
        <Alert variant="danger" className="mb-3">
          {submitError}
        </Alert>
      )}
      {!isEditMode && !scopedCommunityId && (
        <Alert variant="warning" className="mb-3">
          No community scope was found for your admin account. Assign a community before creating notices.
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Notice Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="title"
                  placeholder="Enter notice title"
                  label="Notice Title *"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label htmlFor="notice-tags" className="form-label">
                  Notice Tags *
                </label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <select 
                        {...field}
                        multiple
                        className="form-control"
                        style={{ height: '140px' }}
                        value={field.value || []}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          field.onChange(values);
                        }}
                      >
                        <option value="Important">Important</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Notice">Notice</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Community Guidelines">Community Guidelines</option>
                        <option value="Safety & Security">Safety & Security</option>
                        <option value="Maintenance Updates">Maintenance Updates</option>
                        <option value="Community Events">Community Events</option>
                        <option value="Amenity Management">Amenity Management</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Monthly Updates">Monthly Updates</option>
                        <option value="Billing & Payments">Billing & Payments</option>
                        <option value="Community Rules">Community Rules</option>
                        <option value="Parking">Parking</option>
                        <option value="Water Supply">Water Supply</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Waste Management">Waste Management</option>
                        <option value="Gym & Fitness">Gym & Fitness</option>
                        <option value="Swimming Pool">Swimming Pool</option>
                        <option value="Clubhouse">Clubhouse</option>
                        <option value="Garden & Landscaping">Garden & Landscaping</option>
                        <option value="Pest Control">Pest Control</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Elevator Maintenance">Elevator Maintenance</option>
                        <option value="CCTV & Surveillance">CCTV & Surveillance</option>
                        <option value="Visitor Management">Visitor Management</option>
                        <option value="Intercom System">Intercom System</option>
                        <option value="Fire Safety">Fire Safety</option>
                        <option value="Power Backup">Power Backup</option>
                        <option value="WiFi & Internet">WiFi & Internet</option>
                        <option value="Children's Play Area">Children&apos;s Play Area</option>
                        <option value="Senior Citizens">Senior Citizens</option>
                        <option value="Pet Policy">Pet Policy</option>
                        <option value="Festivals & Celebrations">Festivals & Celebrations</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Environment">Environment</option>
                        <option value="Meeting & AGM">Meeting & AGM</option>
                        <option value="Committee Updates">Committee Updates</option>
                        <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                        <option value="New Community Members">New Community Members</option>
                        <option value="Legal Matters">Legal Matters</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Weather Alert">Weather Alert</option>
                        <option value="Traffic & Transportation">Traffic & Transportation</option>
                      </select>
                      {fieldState.error && (
                        <div className="invalid-feedback d-block">
                          {fieldState.error.message}
                        </div>
                      )}
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple tags</small>
                    </div>
                  )}
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput
                  control={control}
                  name="body"
                  label="Notice Content *"
                  className="Customer-address"
                  id="schedule-textarea"
                  rows={5}
                  placeholder="Enter detailed notice content..."
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Additional Settings</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="author_name"
                  placeholder="Author name"
                  label="Author Name *"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="priority"
                  label="Priority Level *"
                  placeholder="Select priority level"
                  options={[
                    { value: 'low', label: 'Low Priority' },
                    { value: 'medium', label: 'Medium Priority' },
                    { value: 'high', label: 'High Priority' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <SelectFormInput
                  control={control}
                  name="category"
                  label="Category *"
                  placeholder="Select category"
                  options={[
                    { value: '', label: 'Select Category' },
                    { value: 'general', label: 'General Announcements' },
                    { value: 'maintenance', label: 'Maintenance & Repairs' },
                    { value: 'events', label: 'Community Events' },
                    { value: 'security', label: 'Security & Safety' },
                    { value: 'amenities', label: 'Amenities Management' },
                    { value: 'administrative', label: 'Administrative' },
                    { value: 'emergency', label: 'Emergency Alerts' },
                    { value: 'financial', label: 'Financial & Billing' },
                    { value: 'rules', label: 'Rules & Regulations' },
                    { value: 'social', label: 'Social Activities' },
                    { value: 'health', label: 'Health & Wellness' },
                    { value: 'environment', label: 'Environmental' },
                    { value: 'technology', label: 'Technology Updates' },
                    { value: 'parking', label: 'Parking Management' },
                    { value: 'visitors', label: 'Visitor Management' },
                    { value: 'utilities', label: 'Utilities & Services' },
                    { value: 'legal', label: 'Legal Matters' },
                    { value: 'newsletter', label: 'Newsletter' },
                    { value: 'feedback', label: 'Feedback & Suggestions' },
                    { value: 'celebration', label: 'Celebrations & Festivals' },
                  ]}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="image_url"
                  placeholder="https://example.com/image.jpg"
                  label="Image URL (Optional)"
                />
                <small className="text-muted">
                  Enter image URL if you have an external image link
                </small>
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="video_url"
                  placeholder="https://example.com/video.mp4"
                  label="Video URL (Optional)"
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button 
              variant="outline-primary" 
              type="submit" 
              className="w-100"
              disabled={isSubmitting || (!isEditMode && !scopedCommunityId)}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Notice" : "Create Notice"
              )}
            </Button>
          </Col>
          <Col lg={2}>
            <Button 
              variant="danger" 
              className="w-100"
              onClick={() => router.push('/post')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  );
};

export default CreatePost;
