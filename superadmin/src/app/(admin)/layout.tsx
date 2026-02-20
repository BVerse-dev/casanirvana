import Footer from "@/components/layout/Footer";
import AuthProtectionWrapper from "@/components/wrappers/AuthProtectionWrapper";
import { ChildrenType } from "@/types/component-props";
import dynamicImport from "next/dynamic";
import { Suspense } from "react";
import { Container } from "react-bootstrap";

// Force dynamic rendering for all admin pages to prevent SSR issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TopNavigationBar = dynamicImport(
  () => import("@/components/layout/TopNavigationBar/page"),
);
const VerticalNavigationBar = dynamicImport(
  () => import("@/components/layout/VerticalNavigationBar/page"),
);

const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <AuthProtectionWrapper>
      <div className="wrapper">
        <Suspense>
          <TopNavigationBar />
        </Suspense>
        <VerticalNavigationBar />
        <div className="page-content">
          <Container fluid>{children}</Container>
          <Footer />
        </div>
      </div>
    </AuthProtectionWrapper>
  );
};

export default AdminLayout;
