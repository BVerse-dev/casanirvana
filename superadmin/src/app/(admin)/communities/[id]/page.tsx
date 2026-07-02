'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CommunityDetailsRedirect = () => {
  const params = useParams();
  const router = useRouter();
  const societyId = params.id as string;

  useEffect(() => {
    if (societyId) {
      router.replace(`/communities/details?id=${societyId}`);
    }
  }, [societyId, router]);

  // Show loading while redirecting
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Redirecting...</span>
      </div>
    </div>
  );
};

export default CommunityDetailsRedirect;
