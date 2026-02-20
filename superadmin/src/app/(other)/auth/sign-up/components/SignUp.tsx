"use client";
// Import from centralized image loader
import { logos } from "@/utils/imageLoader";
import TextFormInput from "@/components/from/TextFormInput";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Form, Modal, ModalBody, ModalHeader, ModalFooter, Row } from "react-bootstrap";
import useSignUp from "./useSignUp";

const SignUp = () => {
  useEffect(() => {
    document.body.classList.add("authentication-bg");
    return () => {
      document.body.classList.remove("authentication-bg");
    };
  }, []);

  const { control, loading, signUp, errors, inviteMode, inviteEmail, inviteLoading, setInvitePassword } = useSignUp();
  const isInviteOnly = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_DISABLED === "true";
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePassword, setInvitePasswordValue] = useState("");
  const [invitePasswordConfirm, setInvitePasswordConfirm] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (inviteMode) {
      setShowInviteModal(true);
    }
  }, [inviteMode]);

  const handleInviteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviteError(null);

    if (!invitePassword || !invitePasswordConfirm) {
      setInviteError("Please enter and confirm your new password.");
      return;
    }
    if (invitePassword !== invitePasswordConfirm) {
      setInviteError("Passwords do not match.");
      return;
    }

    try {
      await setInvitePassword(invitePassword);
      setShowInviteModal(false);
    } catch {
      // Errors handled in hook notifications
    }
  };

  return (
    <>
    <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
      <Container>
        <Row className="justify-content-center">
          <Col xl={5}>
            <Card className="auth-card">
              <CardBody className="px-3 py-5">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <Link href="/dashboards/analytics" className="logo-dark">
                    <Image src={logos.logoDark} height={32} alt="logo dark" />
                  </Link>
                  <Link href="/dashboards/analytics" className="logo-light">
                    <Image src={logos.logoLight} height={28} alt="logo light" />
                  </Link>
                </div>
                <h2 className="fw-bold text-uppercase text-center fs-18">
                  Free Account
                </h2>
                <p className="text-muted text-center mt-1 mb-4">
                  New to our platform? Sign up now! It only takes a minute.
                </p>
                {isInviteOnly && (
                  <p className="text-muted text-center mb-4">
                    Sign up is invite-only. Please request an invite from your administrator.
                  </p>
                )}
                <div className="px-4">
                  <form
                    onSubmit={signUp}
                    className="authentication-form"
                  >
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="name"
                        placeholder="Enter your Name"
                        className="bg-light bg-opacity-50 border-light py-2"
                        label="Name"
                      />
                    </div>
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="email"
                        placeholder="Enter your email"
                        className="bg-light bg-opacity-50 border-light py-2"
                        label="Email"
                      />
                    </div>
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="bg-light bg-opacity-50 border-light py-2"
                        label="Password"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="checkbox-signin"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkbox-signin"
                        >
                          I accept Terms and Condition
                        </label>
                      </div>
                    </div>
                    <div className="mb-1 text-center d-grid">
                      <button 
                        className="btn btn-danger py-2" 
                        type="submit"
                        disabled={loading || isInviteOnly || inviteMode}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </div>
                  </form>
                  <p className="mt-3 fw-semibold no-span">OR sign with</p>
                  <div className="text-center">
                    <Button variant="outline-light" className="shadow-none">
                      <IconifyIcon icon="bxl:google" className="fs-20" />
                    </Button>
                    &nbsp;
                    <Button variant="outline-light" className="shadow-none">
                      <IconifyIcon
                        icon="ri:facebook-fill"
                        height={32}
                        width={20}
                        className=""
                      />
                    </Button>
                    &nbsp;
                    <Button variant="outline-light" className="shadow-none">
                      <IconifyIcon icon="bxl:github" className="fs-20" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
            <p className="mb-0 text-center text-white">
              I already have an account{" "}
              <Link
                href="/auth/sign-in"
                className="text-reset text-unline-dashed fw-bold ms-1"
              >
                Sign In
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
    <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
      <Form onSubmit={handleInviteSubmit}>
        <ModalHeader closeButton>
          <h5 className="modal-title">Set Your Password</h5>
        </ModalHeader>
        <ModalBody>
          <p className="text-muted">
            Complete your invite by setting a password for{" "}
            <strong>{inviteEmail || "your account"}</strong>.
          </p>
          {inviteError && (
            <div className="alert alert-danger py-2">{inviteError}</div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={invitePassword}
              onChange={(e) => setInvitePasswordValue(e.target.value)}
              placeholder="Enter new password"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={invitePasswordConfirm}
              onChange={(e) => setInvitePasswordConfirm(e.target.value)}
              placeholder="Confirm new password"
            />
          </Form.Group>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={inviteLoading}>
            {inviteLoading ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : null}
            Set Password
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
    </>
  );
};

export default SignUp;
