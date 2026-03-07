import React, { useEffect, useRef } from "react";

import { useIncomingCallSignal } from "../hooks/useCalls";
import { supabase } from "../utils/supabase";

const ACTIVE_INCOMING_CALL_STATUSES = new Set(["initiated", "ringing"]);

const buildCallerName = (profile) => {
  const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  return fullName || "Incoming Call";
};

export const IncomingCallNavigationHandler = ({ navigationRef }) => {
  const incomingCall = useIncomingCallSignal();
  const lastHandledCallIdRef = useRef(null);

  useEffect(() => {
    if (!incomingCall?.id || !ACTIVE_INCOMING_CALL_STATUSES.has(incomingCall.status)) {
      if (!incomingCall?.id) {
        lastHandledCallIdRef.current = null;
      }
      return;
    }

    if (!navigationRef.current?.isReady?.()) {
      return;
    }

    const currentRoute = navigationRef.current.getCurrentRoute?.();
    if (currentRoute?.name === "callScreen" || lastHandledCallIdRef.current === incomingCall.id) {
      return;
    }

    let cancelled = false;

    const openIncomingCall = async () => {
      const { data: callerProfile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, phone")
        .eq("id", incomingCall.caller_id)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      lastHandledCallIdRef.current = incomingCall.id;

      navigationRef.current?.navigate?.("callScreen", {
        mode: "incoming",
        callId: incomingCall.id,
        id: callerProfile?.id || incomingCall.caller_id,
        memberId: callerProfile?.id || incomingCall.caller_id,
        name: buildCallerName(callerProfile),
        image: callerProfile?.avatar_url || null,
        phone: callerProfile?.phone || null,
        memberPhone: callerProfile?.phone || null,
      });
    };

    openIncomingCall();

    return () => {
      cancelled = true;
    };
  }, [incomingCall, navigationRef]);

  useEffect(() => {
    if (!incomingCall?.id || !ACTIVE_INCOMING_CALL_STATUSES.has(incomingCall.status)) {
      lastHandledCallIdRef.current = null;
    }
  }, [incomingCall?.id, incomingCall?.status]);

  return null;
};
