import FileUpload from "@/components/FileUpload";
import PageTitle from "@/components/PageTitle";
import { Alert, Col, Row } from "react-bootstrap";
import { Metadata } from "next";
import Link from "next/link";
import CreatePost from "../create/components/CreatePost";
import CreatePostCard from "../create/components/CreatePostCard";

export const metadata: Metadata = { title: "Notice Edit" };

interface PostEditPageProps {
  searchParams?: {
    id?: string;
  };
}

const PostEditPage = ({ searchParams }: PostEditPageProps) => {
  const noticeId = searchParams?.id;

  return (
    <>
      <PageTitle title="Notice Edit" subName="Notice" />
      {!noticeId ? (
        <>
          <Alert variant="warning">
            Missing notice ID. Select a notice from the list and retry edit.
          </Alert>
          <Link href="/post" className="btn btn-primary">
            Back to Notices
          </Link>
        </>
      ) : (
        <Row>
          <Col xl={3} lg={4}>
            <CreatePostCard mode="edit" />
          </Col>
          <Col xl={9} lg={8}>
            <FileUpload title="Update Notice Image" />
            <CreatePost mode="edit" noticeId={noticeId} />
          </Col>
        </Row>
      )}
    </>
  );
};

export default PostEditPage;
