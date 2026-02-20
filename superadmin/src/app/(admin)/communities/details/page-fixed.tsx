'use client';

import PageTitle from "@/components/PageTitle";
import CommunityDetails from "./components/CommunityDetails";
import CommunityUnits from "./components/CommunityUnits";
import { Col, Row } from "react-bootstrap";
import { useSearchParams } from 'next/navigation';
import { societiesDummyData } from "@/assets/data/communities-dummy";

const CommunityDetailsPage = () => {
  const searchParams = useSearchParams();
  const societyId = searchParams.get('id');
  
  // Find society from dummy data
  const society = societiesDummyData.find(s => s.id === societyId);

  if (!society) {
    return (
      <>
        <PageTitle title="Society Overview" subName="Casa Nirvana" />
        <div className="alert alert-warning">
          Society not found
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Society Overview" subName="Casa Nirvana" />
      <Row>
        <CommunityDetails society={society} />
        <CommunityUnits society={society} />
      </Row>
      <Row>
        <Col lg={12}>
          <div className="mapouter">
            <div className="gmap_canvas mb-2">
              <iframe
                className="gmap_iframe rounded"
                width="100%"
                style={{ height: 400 }}
                frameBorder={0}
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?width=1980&height=400&hl=en&q=${encodeURIComponent(society.address || society.name)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
              />
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default CommunityDetailsPage;
