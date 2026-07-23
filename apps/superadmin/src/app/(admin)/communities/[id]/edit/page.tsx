import PageTitle from "@/components/PageTitle";
import type { Metadata } from "next";
import CommunityAddForm from "../../add/components/CommunityAddForm";

export const metadata: Metadata = { title: "Edit Community | Casa Nirvana Admin" };

const CommunityEditPage = ({ params }: { params: { id: string } }) => (
  <>
    <PageTitle title="Edit Community" subName="Communities" />
    <CommunityAddForm editMode communityId={params.id} />
  </>
);

export default CommunityEditPage;
