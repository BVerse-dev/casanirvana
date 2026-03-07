"use client";
import { createContext, useContext, useState } from "react";

import type { ChildrenType } from "@/types/component-props";
import type {
  EmailContextType,
  EmailOffcanvasStatesType,
  OffcanvasControlType,
} from "@/types/context";
import type { EmailLabelType, EmailType } from "@/types/data";

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const useEmailContext = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmailContext can only be used within EmailProvider");
  }
  return context;
};

export const EmailProvider = ({ children }: ChildrenType) => {
  const [activeLabel, setActiveLabel] = useState<EmailLabelType>("inbox");
  const [activeMail, setActiveMail] = useState<EmailType["id"]>("");
  const [offcanvasStates, setOffcanvasStates] =
    useState<EmailOffcanvasStatesType>({
      showNavigationMenu: false,
      showEmailDetails: false,
      showComposeEmail: false,
    });

  const changeActiveLabel: EmailContextType["changeActiveLabel"] = (
    newLabel,
  ) => {
    setActiveLabel(newLabel);
  };

  const changeActiveMail: EmailContextType["changeActiveMail"] = (newMail) => {
    setActiveMail(newMail);
    setOffcanvasStates((previous) => ({
      ...previous,
      showEmailDetails: true,
    }));
  };

  const toggleNavigationMenu: OffcanvasControlType["toggle"] = () => {
    setOffcanvasStates((previous) => ({
      ...previous,
      showNavigationMenu: !previous.showNavigationMenu,
    }));
  };

  const toggleEmailDetails: OffcanvasControlType["toggle"] = () => {
    setOffcanvasStates((previous) => ({
      ...previous,
      showEmailDetails: !previous.showEmailDetails,
    }));
  };

  const toggleComposeEmail: OffcanvasControlType["toggle"] = () => {
    setOffcanvasStates((previous) => ({
      ...previous,
      showComposeEmail: !previous.showComposeEmail,
    }));
  };

  const navigationBar: EmailContextType["navigationBar"] = {
    open: offcanvasStates.showNavigationMenu,
    toggle: toggleNavigationMenu,
  };

  const emailDetails: EmailContextType["emailDetails"] = {
    open: offcanvasStates.showEmailDetails,
    toggle: toggleEmailDetails,
  };

  const composeEmail: EmailContextType["composeEmail"] = {
    open: offcanvasStates.showComposeEmail,
    toggle: toggleComposeEmail,
  };

  return (
    <EmailContext.Provider
      value={{
        activeLabel,
        changeActiveLabel,
        activeMail,
        changeActiveMail,
        navigationBar,
        emailDetails,
        composeEmail,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};
