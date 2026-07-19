"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface ServiceMetricCardProps {
  title: string;
  value: string;
  trend: number | null;
  icon: string;
  variant: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary';
}

const ServiceMetricCard = ({ title, value, trend, icon, variant }: ServiceMetricCardProps) => {
  const hasTrend = typeof trend === 'number' && Number.isFinite(trend);
  const isPositiveTrend = hasTrend && trend >= 0;
  const trendColor = !hasTrend ? 'text-muted' : isPositiveTrend ? 'text-success' : 'text-danger';
  const trendIcon = !hasTrend ? 'ri:subtract-line' : isPositiveTrend ? 'ri:arrow-up-line' : 'ri:arrow-down-line';
  const trendLabel = hasTrend ? `${Math.abs(trend).toFixed(1)}%` : 'No prior period';

  return (
    <Card className="widget-flat mb-3">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className={`avatar-sm rounded-circle bg-${variant}-lighten me-3`}>
            <span className={`avatar-title rounded-circle bg-${variant}-lighten`}>
              <IconifyIcon icon={icon} className={`font-20 text-${variant}`} />
            </span>
          </div>
          <div className="flex-grow-1">
            <h5 className="fw-semibold my-0">{value}</h5>
            <p className="text-muted mb-0 fw-semibold">{title}</p>
          </div>
          <div className="flex-shrink-0">
            <div className={`${trendColor} d-flex align-items-center justify-content-end`}>
              <IconifyIcon icon={trendIcon} className="font-16 me-1" />
              {trendLabel}
            </div>
            <p className="text-muted mb-0 small">vs previous period</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceMetricCard;
