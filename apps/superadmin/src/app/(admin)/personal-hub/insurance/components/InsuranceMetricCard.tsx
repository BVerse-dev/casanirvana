"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface InsuranceMetricCardProps {
  title: string;
  value: string;
  growth: string;
  icon: string;
  variant: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary';
}

const InsuranceMetricCard = ({ title, value, growth, icon, variant }: InsuranceMetricCardProps) => {
  // Determine if growth is positive or negative
  const isPositiveGrowth = growth.startsWith('+');
  const growthColor = isPositiveGrowth ? 'text-success' : 'text-danger';
  const growthIcon = isPositiveGrowth ? 'ri:arrow-up-line' : 'ri:arrow-down-line';
  
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
            <div className={`${growthColor} d-flex align-items-center`}>
              <IconifyIcon icon={growthIcon} className="font-16 me-1" />
              {growth}
            </div>
            <p className="text-muted mb-0 small">vs. last month</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InsuranceMetricCard;
