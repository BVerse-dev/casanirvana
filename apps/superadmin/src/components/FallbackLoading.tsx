type FallbackLoadingProps = {
  label?: string;
};

const FallbackLoading = ({ label = "Loading" }: FallbackLoadingProps) => (
  <div className="d-flex min-vh-100 align-items-center justify-content-center bg-body" role="status" aria-live="polite">
    <div className="text-center">
      <span className="spinner-border text-primary" aria-hidden="true" />
      <p className="mt-3 mb-0 text-muted">{label}</p>
    </div>
  </div>
);

export default FallbackLoading;
