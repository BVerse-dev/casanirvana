import PageTitle from "@/components/PageTitle";
import React from "react";
import EmailView from "./components/EmailView";
import EmailOverview from "./components/EmailOverview";
import { Card } from "react-bootstrap";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Email Management" };

const InboxPage = () => {
  return (
    <>
      <PageTitle title="Email Management" subName="Casa Nirvana" />
      <EmailOverview />
      <Card>
        <EmailView />
      </Card>
    </>
  );
};

export default InboxPage;
