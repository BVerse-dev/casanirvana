import FileUpload from "@/components/FileUpload";
import PageTitle from "@/components/PageTitle";
import { Col, Row } from "react-bootstrap";
import CreatePost from "./components/CreatePost";
import CreatePostCard from "./components/CreatePostCard";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Notice Create" };

const PostCreatePage = () => {
  return (
    <>
      <PageTitle title="Notice Create" subName="Notice" />
      <Row>
        <Col xl={3} lg={4}>
          <CreatePostCard />
        </Col>
        <Col xl={9} lg={8}>
          <FileUpload title="Add Notice Image" />
          <CreatePost />
        </Col>
      </Row>
    </>
  );
};

export default PostCreatePage;
