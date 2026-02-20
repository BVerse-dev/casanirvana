import PageTitle from "@/components/PageTitle";
import { Row } from "react-bootstrap";
import Articles from "./components/Articles";
import FreshArticles from "./components/FreshArticles";
import Posts from "./components/Posts";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Notice Grid" };

const PostPage = () => {
  return (
    <>
      <PageTitle title="Notice Grid" subName="Notice" />
      <Row>
        <FreshArticles />
        <Articles />
      </Row>
      <Row>
        <Posts />
      </Row>
    </>
  );
};

export default PostPage;
