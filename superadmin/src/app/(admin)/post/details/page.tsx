"use client";

import blogImg from "@/assets/images/blog/blog.jpg";
import avatarImg from "@/assets/images/users/avatar-6.jpg";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";
import Blogs from "./components/Blogs";
import Comments from "./components/Comments";
import PhotoCard from "./components/PhotoCard";
import { useGetNotice, useUpdateNotice, useDeleteNotice } from "@/hooks/useNotices";
import { useCreateComment } from "@/hooks/useComments";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";

// Notice Details Content Component
const NoticeDetailsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noticeId = searchParams.get('id');
  const staticId = searchParams.get('staticId');
  const [commentText, setCommentText] = useState('');
  
  // Extract all static notice data from URL parameters
  const staticData = staticId ? {
    staticId,
    title: searchParams.get('title') || '',
    description: searchParams.get('description') || '',
    name: searchParams.get('name') || '',
    date: searchParams.get('date') || '',
    tags: searchParams.get('tags') || '',
    link: searchParams.get('link') || '',
    image: searchParams.get('image') || '',
    type: searchParams.get('type') || ''
  } : null;
  
  const { data: notice, isLoading, error } = useGetNotice(noticeId || '');
  const updateNoticeMutation = useUpdateNotice();
  const deleteNoticeMutation = useDeleteNotice();
  const createCommentMutation = useCreateComment();

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    const currentNoticeId = noticeId || staticId || '';
    if (!currentNoticeId) return;
    
    try {
      await createCommentMutation.mutateAsync({
        notice_id: currentNoticeId,
        author_name: 'Administrator', // In production, get from user session
        author_avatar: '/images/users/avatar-6.jpg',
        content: commentText.trim()
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleLike = () => {
    if (notice) {
      updateNoticeMutation.mutate({
        id: notice.id,
        likes_count: (notice.likes_count || 0) + 1
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: notice?.title || 'Notice',
        text: notice?.body || 'Community Notice',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
  };

  const handleStar = () => {
    // In production, save to user favorites
    console.log('Starred notice:', notice?.id);
  };

  const handleEditNotice = () => {
    // Navigate to edit page or open edit modal
    router.push(`/post/edit?id=${notice?.id}`);
  };

  const handleDeleteNotice = async () => {
    if (!notice?.id) return;
    
    if (window.confirm('Are you sure you want to delete this notice? This action cannot be undone.')) {
      try {
        await deleteNoticeMutation.mutateAsync(notice.id);
        router.push('/post'); // Navigate back to notices list
      } catch (error) {
        console.error('Failed to delete notice:', error);
        alert('Failed to delete notice. Please try again.');
      }
    }
  };

  const handleViewAuthor = () => {
    // Navigate to author profile or open author modal
    console.log('View author profile:', notice?.author_name);
  };

  const handleViewStats = () => {
    // Open analytics/stats modal for this notice
    console.log('View notice statistics:', notice?.id);
  };

  const handleArchiveNotice = () => {
    // Archive the notice (soft delete or status change)
    if (window.confirm('Are you sure you want to archive this notice?')) {
      updateNoticeMutation.mutate({
        id: notice?.id || '',
        // Add archived status field when available in schema
      });
    }
  };

  // If this is a static notice (video post, article)
  if (staticData) {
    return <StaticNoticeContent staticData={staticData} />;
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !notice) {
    // Fallback to static content if no notice found
    return <StaticNoticeContent staticData={null} />;
  }

  // Format tags for display
  const displayTags = notice.tags && Array.isArray(notice.tags) ? notice.tags : ['General'];

  return (
    <>
      <PageTitle title="Notice Details" subName="Notice" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/post" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Notices
            </Link>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <Card>
            <CardBody>
              <div className="position-relative">
                {notice.image_url ? (
                  <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                    <Image 
                      src={notice.image_url}
                      alt={notice.title}
                      className="rounded"
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Image failed to load:', notice.image_url);
                        // Use fallback image on error
                        e.currentTarget.src = blogImg.src;
                      }}
                    />
                  </div>
                ) : notice.video_url ? (
                  <video 
                    src={notice.video_url}
                    className="img-fluid rounded"
                    controls
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                  />
                ) : (
                  <Image src={blogImg} alt="blog" className="img-fluid rounded" />
                )}
              </div>
              <div className="d-flex align-items-center gap-1 my-3">
                <div className="position-relative">
                  <Image
                    src={avatarImg}
                    alt="avatar"
                    className="avatar rounded-circle flex-shrink-0"
                  />
                </div>
                <div className="d-block ms-2 flex-grow-1">
                  <span>
                    <Link href="" className="text-dark fw-medium">
                      {notice.author_name || 'Administrator'}
                    </Link>
                  </span>
                  <p className="text-muted mb-0">
                    <IconifyIcon icon="ti:calendar-due" /> 
                    {new Date(notice.posted_at || notice.created_at || new Date()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="ms-auto">
                  <div>
                    <ul className="list-inline float-end d-flex gap-1 mb-0 align-items-center">
                      <li className="list-inline-item fs-20 dropdown">
                        <Button
                          variant="light"
                          className="avatar-sm d-flex align-items-center justify-content-center text-dark fs-20 icons-center"
                          onClick={handleShare}
                        >
                          <span>
                            <IconifyIcon icon="solar:share-bold-duotone" />
                          </span>
                        </Button>
                      </li>
                      <li className="list-inline-item fs-20 dropdown">
                        <Button
                          variant="light"
                          className="avatar-sm d-flex align-items-center justify-content-center text-danger fs-20 icons-center"
                          onClick={handleLike}
                        >
                          <span>
                            <IconifyIcon icon="solar:heart-angle-bold-duotone" />
                          </span>
                        </Button>
                      </li>
                      <li className="list-inline-item fs-20 dropdown">
                        <Button
                          variant="light"
                          className="avatar-sm d-flex align-items-center justify-content-center text-warning fs-20 icons-center"
                          onClick={handleStar}
                        >
                          <span>
                            <IconifyIcon icon="solar:star-bold-duotone" />
                          </span>
                        </Button>
                      </li>
                      <Dropdown
                        as={"li"}
                        className="list-inline-item fs-20 d-none d-md-flex"
                      >
                        <DropdownToggle
                          as={"a"}
                          className="arrow-none text-dark icons-center"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <span>
                            <IconifyIcon icon="ri:more-2-fill" />
                          </span>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem onClick={handleEditNotice}>
                            <IconifyIcon
                              icon="ri:edit-line"
                              className="me-2"
                            />
                            Edit Notice
                          </DropdownItem>
                          <DropdownItem onClick={handleViewAuthor}>
                            <IconifyIcon
                              icon="ri:user-6-line"
                              className="me-2"
                            />
                            View Author
                          </DropdownItem>
                          <DropdownItem onClick={handleViewStats}>
                            <IconifyIcon
                              icon="ri:bar-chart-line"
                              className="me-2"
                            />
                            View Statistics
                          </DropdownItem>
                          <DropdownItem onClick={handleArchiveNotice}>
                            <IconifyIcon
                              icon="ri:archive-line"
                              className="me-2"
                            />
                            Archive Notice
                          </DropdownItem>
                          <DropdownItem className="text-danger" onClick={handleDeleteNotice}>
                            <IconifyIcon
                              icon="ri:delete-bin-line"
                              className="me-2"
                            />
                            Delete Notice
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap my-2">
                {displayTags.map((tag, idx) => (
                  <span key={idx} className="badge bg-light text-dark px-2 py-1 fs-12">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-dark d-inline-block mb-2 mt-1">
                <Link href="" className="text-dark fs-4 fw-medium">
                  {notice.title}
                </Link>
              </span>
              <div className="text-muted" dangerouslySetInnerHTML={{ __html: notice.body }} />
              
              {/* Stats */}
              <div className="d-flex gap-3 my-3">
                <span className="text-muted fs-14">
                  <IconifyIcon icon="solar:eye-bold" className="me-1" />
                  {notice.views_count || 0} views
                </span>
                <span className="text-muted fs-14">
                  <IconifyIcon icon="solar:heart-bold" className="me-1" />
                  {notice.likes_count || 0} likes
                </span>
              </div>
              
              {/* Notice Comments Section - moved to main content area to match StaticNoticeContent layout */}
              <div className="border-start border-primary border-2 p-3 bg-primary bg-opacity-10 rounded mt-3">
                <h5>Notice Comments</h5>
                <p className="mb-0">
                  Share your thoughts and feedback about this notice with the community.
                </p>
              </div>
              <div className="d-flex bg-light border border-dashed gap-3 rounded my-4 p-3">
                <Link
                  href=""
                  className="d-flex align-items-center fs-16 text-dark"
                >
                  <IconifyIcon
                    icon="solar:like-bold-duotone"
                    className="me-1"
                  />{" "}
                  3,422
                </Link>
                <Link
                  href=""
                  className="d-flex align-items-center fs-16 text-dark"
                >
                  <IconifyIcon icon="solar:eye-bold" className="me-1" /> 4,565
                </Link>
                <Link
                  href=""
                  className="d-flex align-items-center fs-16 text-dark"
                >
                  <IconifyIcon
                    icon="solar:chat-square-call-bold"
                    className="me-1"
                  />{" "}
                  356
                </Link>
              </div>
              <CardTitle as={"h4"}>Notice Comments</CardTitle>
              <textarea
                className="form-control my-3"
                rows={5}
                placeholder="Write Comment ......"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="d-flex justify-content-end">
                <Button 
                  variant="primary" 
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || createCommentMutation.isPending}
                >
                  {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
              <CardTitle as={"h4"} className="d-flex align-items-center mt-3">
                <IconifyIcon
                  icon="solar:chat-square-like-outline"
                  className="me-1"
                />{" "}
                Comment
              </CardTitle>
              <Comments noticeId={notice.id} />
            </CardBody>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Blogs />
          <PhotoCard />
        </Col>
      </Row>
    </>
  );
};

// Static notice content component with dynamic data
const StaticNoticeContent = ({ staticData }: { staticData: any }) => {
  const [commentText, setCommentText] = useState('');
  const createCommentMutation = useCreateComment();
  const updateNoticeMutation = useUpdateNotice();
  
  const displayTitle = staticData?.title || "Important Community Update";
  const displayDescription = staticData?.description || "This is a community notice with important information for all community members.";
  const displayAuthor = staticData?.name || "Administrator";
  const displayDate = staticData?.date ? new Date(staticData.date) : new Date();
  const displayTags = staticData?.tags ? staticData.tags.split(',') : ['General'];
  const mediaUrl = staticData?.link || staticData?.image;
  
  // Use staticId as identifier for comments
  const staticNoticeId = staticData?.staticId || 'static-notice';
  
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    try {
      await createCommentMutation.mutateAsync({
        notice_id: staticNoticeId,
        author_name: 'Administrator', // In production, get from user session
        author_avatar: '/images/users/avatar-6.jpg',
        content: commentText.trim()
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleLike = () => {
    // For static notices, we can update local state or track in analytics
    console.log('Liked static notice:', staticNoticeId);
    // In production, you might want to track this in analytics or user preferences
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        text: displayDescription,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
      console.log('Link copied to clipboard');
    }
  };

  const handleStar = () => {
    // For static notices, track as favorite
    console.log('Starred notice:', staticNoticeId);
    // In production, save to user favorites
  };
  const isVideo = staticData?.type === 'video' && staticData?.link;
  
  // Check if image URL is valid (starts with http or is a valid path)
  const isValidImage = staticData?.image && (
    staticData.image.startsWith('http') || 
    staticData.image.startsWith('/') || 
    staticData.image.startsWith('_next')
  );
  const isImage = isValidImage && !isVideo;
  
  return (
    <>
      <PageTitle title="Notice Details" subName="Notice" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/post" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Notices
            </Link>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <Card>
            <CardBody>
              <div className="position-relative">
                {isVideo ? (
                  <iframe 
                    src={mediaUrl}
                    className="img-fluid rounded"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '400px' }}
                  />
                ) : isImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                    <Image 
                      src={staticData.image}
                      alt={displayTitle}
                      className="rounded"
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Image failed to load:', staticData.image);
                        // Use fallback image on error
                        e.currentTarget.src = blogImg.src;
                      }}
                    />
                  </div>
                ) : (
                  <Image src={blogImg} alt="blog" className="img-fluid rounded" />
                )}
              </div>
              <div className="d-flex align-items-center gap-1 my-3">
                <div className="position-relative">
                  <Image
                    src={avatarImg}
                    alt="avatar"
                    className="avatar rounded-circle flex-shrink-0"
                  />
                </div>
                <div className="d-block ms-2 flex-grow-1">
                  <span>
                    <span className="text-dark fw-medium">
                      {displayAuthor}
                    </span>
                  </span>
                  <p className="text-muted mb-0">
                    <IconifyIcon icon="ti:calendar-due" /> 
                    {displayDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="ms-auto">
                  <div>
                    <ul className="list-inline float-end d-flex gap-1 mb-0 align-items-center">
                      <li className="list-inline-item fs-20 dropdown">
                        <Button
                          variant="light"
                          className="avatar-sm d-flex align-items-center justify-content-center text-dark fs-20 icons-center"
                          onClick={handleShare}
                        >
                          <span>
                            {" "}
                            <IconifyIcon icon="solar:share-bold-duotone" />{" "}
                          </span>
                        </Button>
                      </li>
                      <li className="list-inline-item fs-20 dropdown">
                        <Button
                          variant="light"
                          className=" avatar-sm d-flex align-items-center justify-content-center text-danger fs-20 icons-center"
                          onClick={handleLike}
                        >
                          <span>
                            {" "}
                            <IconifyIcon icon="solar:heart-angle-bold-duotone" />{" "}
                          </span>
                        </Button>
                      </li>
                      <li className="list-inline-item fs-20 dropdown">
                        <button
                          className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-warning fs-20 icons-center"
                          onClick={handleStar}
                        >
                          <span>
                            {" "}
                            <IconifyIcon icon="solar:star-bold-duotone" />{" "}
                          </span>
                        </button>
                      </li>
                      <Dropdown
                        as={"li"}
                        className="list-inline-item fs-20 d-none d-md-flex"
                      >
                        <DropdownToggle
                          as={"a"}
                          className="arrow-none text-dark icons-center"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <span>
                            {" "}
                            <IconifyIcon icon="ri:more-2-fill" />{" "}
                          </span>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem>
                            <IconifyIcon
                              icon="ri:edit-line"
                              className="me-2"
                            />
                            Edit Notice
                          </DropdownItem>
                          <DropdownItem>
                            <IconifyIcon
                              icon="ri:user-6-line"
                              className="me-2"
                            />
                            View Author
                          </DropdownItem>
                          <DropdownItem>
                            <IconifyIcon
                              icon="ri:bar-chart-line"
                              className="me-2"
                            />
                            View Statistics
                          </DropdownItem>
                          <DropdownItem>
                            <IconifyIcon
                              icon="ri:archive-line"
                              className="me-2"
                            />
                            Archive Notice
                          </DropdownItem>
                          <DropdownItem className="text-danger">
                            <IconifyIcon
                              icon="ri:delete-bin-line"
                              className="me-2"
                            />
                            Delete Notice
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap my-2">
                {displayTags.map((tag: string, idx: number) => (
                  <span key={idx} className="badge bg-light text-dark px-2 py-1 fs-12">
                    {tag.trim()}
                  </span>
                ))}
              </div>
              <span className="text-dark d-inline-block mb-2 mt-1">
                <span className="text-dark fs-4 fw-medium">
                  {displayTitle}
                </span>
              </span>
              <p className="text-muted">
                {displayDescription}
              </p>
              <p className="mb-2 text-muted">
                <span className="text-dark fw-semibold mb-0">
                  Additional Information :{" "}
                </span>
                This notice contains important information for all community members. 
                Please review the details carefully and contact management if you have any questions.
              </p>
              
              {/* Stats */}
              <div className="d-flex gap-3 my-3">
                <span className="text-muted fs-14">
                  <IconifyIcon icon="solar:eye-bold" className="me-1" />
                  {Math.floor(Math.random() * 500) + 100} views
                </span>
                <span className="text-muted fs-14">
                  <IconifyIcon icon="solar:heart-bold" className="me-1" />
                  {Math.floor(Math.random() * 50) + 10} likes
                </span>
              </div>
              <div className="border-start border-primary border-2 p-3 bg-primary bg-opacity-10 rounded mt-3">
                <h5>Important Reminder</h5>
                <p className="mb-0">
                  Community management is committed to maintaining a safe and secure environment for all community members. 
                  Please report any safety concerns immediately to the management office.
                </p>
              </div>
              <div className="d-flex bg-light border border-dashed gap-3 rounded my-4 p-3">
                <Link
                  href=""
                  className="d-flex align-items-center fs-16 text-dark"
                >
                  <IconifyIcon
                    icon="solar:like-bold-duotone"
                    className="me-1"
                  />{" "}
                  3,422
                </Link>
                <Link
                  href=""
                  className="d-flex align-items-center fs-16 text-dark"
                >
                  <IconifyIcon icon="solar:eye-bold" className="me-1" /> 4,565
                </Link>
                <Link
                  href=""
                  className="d-flex align-items-center fs-16 text-dark"
                >
                  <IconifyIcon
                    icon="solar:chat-square-call-bold"
                    className="me-1"
                  />{" "}
                  356
                </Link>
              </div>
              <CardTitle as={"h4"}>Notice Comments</CardTitle>
              <textarea
                className="form-control my-3"
                rows={5}
                placeholder="Write Comment ......"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="d-flex justify-content-end">
                <Button 
                  variant="primary"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || createCommentMutation.isPending}
                >
                  {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
              <CardTitle as={"h4"} className="d-flex align-items-center mt-3">
                <IconifyIcon
                  icon="solar:chat-square-like-outline"
                  className="me-1"
                />{" "}
                Comment
              </CardTitle>
              <Comments noticeId={staticNoticeId} />
            </CardBody>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Blogs />
          <PhotoCard />
        </Col>
      </Row>
    </>
  );
};

// Main component with Suspense wrapper
const PostDetailsPage = () => {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    }>
      <NoticeDetailsContent />
    </Suspense>
  );
};

export default PostDetailsPage;
