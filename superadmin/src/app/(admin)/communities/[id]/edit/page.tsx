'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageTitle from "@/components/PageTitle";
import CommunityAddForm from "../../add/components/CommunityAddForm";
import { Metadata } from "next";

const CommunityEditPage = () => {
  const params = useParams();
  const communityId = params.id as string;
  const [communityName, setCommunityName] = useState('Community');

  // In a real implementation, you would fetch the community data here
  // and pass it to the form component as initial values
  useEffect(() => {
    if (communityId) {
      // TODO: Fetch community data and set the name
      // For now, we'll use a placeholder
      setCommunityName(`Community ${communityId}`);
    }
  }, [communityId]);

  return (
    <>
      <PageTitle 
        title={`Edit ${communityName}`} 
        subName="Casa Nirvana" 
      />
      {/* Pass the communityId to the form component for edit mode */}
      <CommunityAddForm editMode={true} communityId={communityId} />
    </>
  );
};

export default CommunityEditPage;
