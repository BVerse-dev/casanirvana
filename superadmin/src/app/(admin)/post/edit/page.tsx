import Link from "next/link";
import { Alert, Col, Row } from "react-bootstrap";
import { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import CreatePost from "../create/components/CreatePost";
import CreatePostCard from "../create/components/CreatePostCard";

export const metadata: Metadata = { title: "Edit Notice" };

interface PostEditPageProps {
  searchParams?: {
    id?: string;
  };
}

const PostEditPage = ({ searchParams }: PostEditPageProps) => {
  const noticeId = searchParams?.id;

  return (
    <>
      <PageTitle title="Edit Notice" subName="Communication" />
      {!noticeId ? (
        <>
          <Alert variant="warning">Missing notice ID. Select a notice from the list and retry edit.</Alert>
          <Link href="/post" className="btn btn-outline-secondary btn-sm">
            Back to Notices
          </Link>
        </>
      ) : (
        <Row className="g-4">
          <Col xl={4} lg={5}>
            <CreatePostCard mode="edit" />
          </Col>
          <Col xl={8} lg={7}>
            <CreatePost mode="edit" noticeId={noticeId} />
          </Col>
        </Row>
      )}
    </>
  );
};

export default PostEditPage;
