"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Col } from "react-bootstrap";

import type { EmergencyAlertRecord, EmergencyAlertStatus } from "@/hooks/useEmergencyAlerts";
import { normalizeEmergencyAlertStatus, useListEmergencyAlerts } from "@/hooks/useEmergencyAlerts";
import { normalizeEmergencyAlertType } from "@/lib/emergencyAlertTypes";

import AlertsList from "./AlertsList";
import EmergencyAlertsArea from "./EmergencyAlertsArea";
import EmergencyAlertsNavigationMenu from "./EmergencyAlertsNavigationMenu";

export type EmergencyAlertFilterState = {
  status: EmergencyAlertStatus | "all";
  type: string;
  query: string;
};

const EmergencyAlertsView = () => {
  const { data: alerts = [], isLoading, error } = useListEmergencyAlerts();
  const [filters, setFilters] = useState<EmergencyAlertFilterState>({
    status: "active",
    type: "all",
    query: "",
  });
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesStatus = filters.status === "all" || normalizeEmergencyAlertStatus(alert.status) === filters.status;
      const matchesType = filters.type === "all" || normalizeEmergencyAlertType(alert.alert_type) === filters.type;
      const matchesQuery =
        !query ||
        alert.title.toLowerCase().includes(query) ||
        String(alert.description || "").toLowerCase().includes(query) ||
        String(alert.communities?.name || "").toLowerCase().includes(query) ||
        String(alert.units?.block || "").toLowerCase().includes(query) ||
        String(alert.units?.number || alert.units?.unit_number || "").toLowerCase().includes(query);

      return matchesStatus && matchesType && matchesQuery;
    });
  }, [alerts, filters]);

  const selectedAlert = useMemo<EmergencyAlertRecord | null>(() => {
    if (!selectedAlertId) {
      return filteredAlerts[0] || null;
    }

    return filteredAlerts.find((alert) => alert.id === selectedAlertId) || null;
  }, [filteredAlerts, selectedAlertId]);

  useEffect(() => {
    if (!filteredAlerts.length) {
      setSelectedAlertId(null);
      return;
    }

    if (!selectedAlertId || !filteredAlerts.some((alert) => alert.id === selectedAlertId)) {
      setSelectedAlertId(filteredAlerts[0].id);
    }
  }, [filteredAlerts, selectedAlertId]);

  const handleFilterChange = (nextFilters: Partial<EmergencyAlertFilterState>) => {
    setFilters((current) => ({
      ...current,
      ...nextFilters,
    }));
  };

  return (
    <>
      <Col xl={2} className="border-end">
        <EmergencyAlertsNavigationMenu alerts={alerts} filters={filters} onFilterChange={handleFilterChange} />
      </Col>
      <Col xl={3} className="border-end">
        <AlertsList
          alerts={filteredAlerts}
          isLoading={isLoading}
          error={error}
          query={filters.query}
          selectedAlertId={selectedAlertId}
          onAlertSelect={(alert) => setSelectedAlertId(alert.id)}
          onQueryChange={(query) => handleFilterChange({ query })}
        />
      </Col>
      <Col xl={7}>
        {error ? (
          <div className="p-4">
            <Alert variant="danger" className="mb-0">
              Failed to load emergency alerts.
            </Alert>
          </div>
        ) : (
          <EmergencyAlertsArea selectedAlert={selectedAlert} />
        )}
      </Col>
    </>
  );
};

export default EmergencyAlertsView;
