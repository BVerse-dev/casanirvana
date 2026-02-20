"use client";

import dynamic from "next/dynamic";
import type { Props as ApexChartProps } from "react-apexcharts";

// Dynamically import ApexCharts to prevent SSR issues
const ApexChartsBase = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div style={{ height: 300 }} className="d-flex align-items-center justify-content-center"><span className="text-muted">Loading chart...</span></div>,
});

// Safe wrapper that handles undefined/null data
const ReactApexChart = (props: ApexChartProps) => {
  // Defensive handling: ensure series is always an array
  const safeSeries = props.series ?? [];

  // Defensive handling: ensure options has required properties
  const safeOptions = props.options ?? {};

  // Don't render chart if series is empty (prevents toString error)
  if (!safeSeries.length) {
    return (
      <div style={{ height: props.height ?? 300 }} className="d-flex align-items-center justify-content-center">
        <span className="text-muted">No data available</span>
      </div>
    );
  }

  return <ApexChartsBase {...props} series={safeSeries} options={safeOptions} />;
};

export default ReactApexChart;
