import React from "react";

import { reportClientIssue } from "../services/monitoringService";

class MonitoringErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    void reportClientIssue({
      source: "react.error-boundary",
      level: "error",
      message: error?.message || "Unhandled React render error",
      errorName: error?.name,
      stack: error?.stack,
      metadata: {
        componentStack: errorInfo?.componentStack || null,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}

export default MonitoringErrorBoundary;

