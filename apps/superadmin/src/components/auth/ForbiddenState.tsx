import { Icon } from "@iconify/react";
import Link from "next/link";

type ForbiddenStateProps = {
  unavailable?: boolean;
  onRetry?: () => void;
};

const ForbiddenState = ({ unavailable = false, onRetry }: ForbiddenStateProps) => (
  <section className="d-flex align-items-center justify-content-center py-5" aria-labelledby="access-state-title">
    <div className="card border-0 shadow-sm text-center p-4 p-md-5 w-100" style={{ maxWidth: 620 }}>
      <span className="avatar-xl rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mx-auto mb-3">
        <Icon icon={unavailable ? "solar:server-square-cloud-broken" : "solar:shield-warning-broken"} className="fs-36" />
      </span>
      <p className="text-uppercase text-muted small fw-semibold mb-2">{unavailable ? "Access check unavailable" : "403 Forbidden"}</p>
      <h1 id="access-state-title" className="h3">
        {unavailable ? "We could not verify your access" : "You do not have access to this workspace"}
      </h1>
      <p className="text-muted mb-4">
        {unavailable
          ? "The authorization service did not respond. Retry before continuing so your organization scope remains protected."
          : "Your administrator role does not include the capability required for this page. Contact a platform administrator if you believe this is incorrect."}
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        {unavailable && onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>Retry access check</button>
        )}
        <Link href="/dashboards/analytics" className={unavailable ? "btn btn-light" : "btn btn-primary"}>
          Return to dashboard
        </Link>
      </div>
    </div>
  </section>
);

export default ForbiddenState;
