"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteHeaderBehavior() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("#pxl-header-elementor");
    const sticky = header?.querySelector<HTMLElement>(".pxl-header-elementor-sticky.pxl-sticky-stb");
    const mobile = header?.querySelector<HTMLElement>("#pxl-header-mobile");
    const mobileButton = header?.querySelector<HTMLElement>(".pxl-nav-mobile-button");
    const mobileMenu = header?.querySelector<HTMLElement>(".pxl-header-menu");
    const closeButton = header?.querySelector<HTMLElement>(".pxl-menu-close");
    const backdrop = header?.querySelector<HTMLElement>(".pxl-header-menu-backdrop");

    const syncSticky = () => {
      const fixed = window.scrollY > 100;
      sticky?.classList.toggle("pxl-header-fixed", fixed);
      mobile?.classList.toggle("pxl-header-mobile-fixed", fixed);
    };

    const setMobileMenu = (open: boolean) => {
      document.body.classList.toggle("body-overflow", open);
      mobileMenu?.classList.toggle("active", open);
      backdrop?.classList.toggle("active", open);
      mobileButton?.setAttribute("aria-expanded", String(open));
    };

    const openMobileMenu = () => setMobileMenu(true);
    const closeMobileMenu = () => setMobileMenu(false);
    const handleMobileKey = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        openMobileMenu();
      }
    };

    const submenuParent = header?.querySelector<HTMLElement>("#pxl-header-mobile .menu-item-has-children");
    const submenu = submenuParent?.querySelector<HTMLElement>(":scope > .sub-menu");
    const submenuToggle = document.createElement("button");
    submenuToggle.type = "button";
    submenuToggle.className = "pxl-menu-toggle";
    submenuToggle.setAttribute("aria-label", "Toggle Products submenu");
    submenuToggle.setAttribute("aria-expanded", "false");
    submenuToggle.innerHTML = '<span aria-hidden="true">+</span>';
    const toggleSubmenu = () => {
      const open = !submenu?.classList.contains("active");
      submenu?.classList.toggle("active", open);
      submenuToggle.classList.toggle("active", open);
      submenuToggle.setAttribute("aria-expanded", String(open));
    };

    if (submenuParent && submenu) {
      submenuParent.appendChild(submenuToggle);
      submenuToggle.addEventListener("click", toggleSubmenu);
    }

    document.body.classList.add("pxl-header-sticky");
    syncSticky();
    setMobileMenu(false);
    window.addEventListener("scroll", syncSticky, { passive: true });
    mobileButton?.addEventListener("click", openMobileMenu);
    mobileButton?.addEventListener("keydown", handleMobileKey);
    closeButton?.addEventListener("click", closeMobileMenu);
    backdrop?.addEventListener("click", closeMobileMenu);

    return () => {
      window.removeEventListener("scroll", syncSticky);
      mobileButton?.removeEventListener("click", openMobileMenu);
      mobileButton?.removeEventListener("keydown", handleMobileKey);
      closeButton?.removeEventListener("click", closeMobileMenu);
      backdrop?.removeEventListener("click", closeMobileMenu);
      submenuToggle.removeEventListener("click", toggleSubmenu);
      submenuToggle.remove();
      document.body.classList.remove("body-overflow", "pxl-header-sticky");
    };
  }, [pathname]);

  return null;
}
