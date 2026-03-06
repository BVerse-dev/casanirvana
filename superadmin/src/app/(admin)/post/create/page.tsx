import { Col, Row } from "react-bootstrap";
import { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import CreatePost from "./components/CreatePost";
import CreatePostCard from "./components/CreatePostCard";

export const metadata: Metadata = { title: "Create Notice" };

const PostCreatePage = () => {
  return (
    <>
      <PageTitle title="Create Notice" subName="Communication" />
      <Row className="g-4">
        <Col xl={4} lg={5}>
          <CreatePostCard />
        </Col>
        <Col xl={8} lg={7}>
          <CreatePost />
        </Col>
      </Row>
    </>
  );
};

export default PostCreatePage;
