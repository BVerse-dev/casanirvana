"use client";
import { Col, TabContainer } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import EmergencyAlertsArea from "./EmergencyAlertsArea";
import EmergencyAlertsNavigationMenu from "./EmergencyAlertsNavigationMenu";
import AlertsList from "./AlertsList";

// Define the alert type structure
type Alert = {
  id: string;
  title: string;
  description: string | null;
  alert_type: string;
  priority: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

const EmergencyAlertsView = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const queryClient = useQueryClient();

  // Set up real-time subscription for emergency alerts
  useEffect(() => {
    const channel = supabase
      .channel('public:emergency_alerts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emergency_alerts' 
      }, (payload) => {
        console.log('Emergency alerts real-time update:', payload);
        
        // Invalidate and refetch emergency alerts queries
        queryClient.invalidateQueries({ queryKey: ['emergency_alerts'] });
        
        // If an alert was deleted and it's currently selected, clear selection
        if (payload.eventType === 'DELETE' && selectedAlert?.id === payload.old?.id) {
          setSelectedAlert(null);
        }
        
        // If an alert was updated and it's currently selected, update the selection
        if (payload.eventType === 'UPDATE' && selectedAlert?.id === payload.new?.id) {
          setSelectedAlert(payload.new as Alert);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, selectedAlert]);

  const handleAlertSelect = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  return (
    <>
      <TabContainer mountOnEnter defaultActiveKey="active">
        <Col xl={2}>
          <EmergencyAlertsNavigationMenu />
        </Col>
        <Col xl={3}>
          <AlertsList onAlertSelect={handleAlertSelect} selectedAlert={selectedAlert} />
        </Col>
        <Col xl={7}>
          <EmergencyAlertsArea selectedAlert={selectedAlert} />
        </Col>
      </TabContainer>
    </>
  );
};

export default EmergencyAlertsView;
