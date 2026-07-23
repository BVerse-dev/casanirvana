import React from "react";
import IconifyIcon from "../wrappers/IconifyIcon";
import { Col, Container, Row } from "react-bootstrap";
import Link from "next/link";
import { currentYear } from "@/context/constants";

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col xs={12} className="text-center">
            {currentYear} © Casa Nirvana. Crafted with love by{" "}
            <IconifyIcon
              icon="solar:hearts-bold-duotone"
              className="fs-18 align-middle text-danger"
            />{" "}
              <Link href="https://casanirvana.app" className="fw-bold footer-text" target="_blank" rel="noreferrer">
                Casa Nirvana
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
