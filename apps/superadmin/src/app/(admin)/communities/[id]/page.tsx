import type { Metadata } from "next";
import CommunityDetails from "../components/CommunityDetails";

export const metadata: Metadata = { title: "Community Details | Casa Nirvana Admin" };

const CommunityDetailsPage = ({ params }: { params: { id: string } }) => <CommunityDetails communityId={params.id} />;

export default CommunityDetailsPage;
