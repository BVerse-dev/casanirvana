'use client';

import { useParams } from 'next/navigation';
import PageTitle from "@/components/PageTitle";
import CommunityAddForm from "../../add/components/CommunityAddForm";
import { useGetCommunity } from "@/hooks/useCommunities";

const CommunityEditPage = () => {
  const params = useParams();
  const communityId = params.id as string;
  const { data: community } = useGetCommunity(communityId);

  return (
    <>
      <PageTitle 
        title={community?.name ? `Edit ${community.name}` : "Edit Community"}
        subName="Casa Nirvana" 
      />
      <CommunityAddForm editMode={true} communityId={communityId} />
    </>
  );
};

export default CommunityEditPage;
