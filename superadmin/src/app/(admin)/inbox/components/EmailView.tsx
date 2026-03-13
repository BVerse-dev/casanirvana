'use client';

import { Col, Row } from 'react-bootstrap';

import { EmailProvider } from '@/context/useEmailContext';

import EmailArea from './EmailArea';
import EmailNavigationMenu from './EmailNavigationMenu';
import InboxMail from './InboxMail';

const EmailWorkspace = () => {
  return (
    <Row className="g-0">
      <Col xl={2}>
        <EmailNavigationMenu />
      </Col>
      <Col xl={3}>
        <InboxMail />
      </Col>
      <Col xl={7}>
        <EmailArea />
      </Col>
    </Row>
  );
};

const EmailView = () => {
  return (
    <EmailProvider>
      <EmailWorkspace />
    </EmailProvider>
  );
};

export default EmailView;
