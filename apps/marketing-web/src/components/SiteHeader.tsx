"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  {
    label: "Products",
    href: "/our-products/",
    children: [
      { label: "Residents", href: "/residents/" },
      { label: "Security Guards", href: "/security-guards/" },
      { label: "Facility Managers", href: "/facility-managers/" },
      { label: "Marketplace", href: "/marketplace/" },
    ],
  },
  { label: "Core Features", href: "/core-features/" },
  { label: "Pricing", href: "/pricing-plans/" },
  { label: "Contact Us", href: "/contact-us/" },
  { label: "FAQs", href: "/faqs/" },
];

function isCurrent(pathname: string, href: string, children?: typeof menuItems[number]["children"]) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href) || Boolean(children?.some((item) => pathname.startsWith(item.href)));
}

function DesktopMenu({ pathname, suffix }: { pathname: string; suffix: string }) {
  return (
    <nav className="pxl-nav-menu pxl-nav-menu1 pxl-mega-boxed pxl-nav-horizontal fr-style-default show-effect-slideup sub-style-default" aria-label="Primary navigation">
      <ul id={`menu-new-menu-${suffix}`} className="pxl-menu-primary clearfix">
        {menuItems.map((item) => {
          const current = isCurrent(pathname, item.href, item.children);
          return (
            <li key={item.href} className={`menu-item${item.children ? " menu-item-has-children" : ""}${current ? " current-menu-item" : ""}`}>
              <a href={item.href} aria-current={current ? "page" : undefined}>
                <span className="pxl-menu-item-text">{item.label}{item.children ? <i className="pxl-arrow-arrow" aria-hidden="true" /> : null}</span>
              </a>
              {item.children ? (
                <ul className="sub-menu">
                  {item.children.map((child) => (
                    <li key={child.href} className={`menu-item${pathname.startsWith(child.href) ? " current-menu-item" : ""}`}>
                      <a href={child.href}><span className="pxl-menu-item-text">{child.label}</span></a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const syncStickyHeader = () => setScrolled(window.scrollY > 100);
    syncStickyHeader();
    window.addEventListener("scroll", syncStickyHeader, { passive: true });
    return () => window.removeEventListener("scroll", syncStickyHeader);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("body-overflow", mobileOpen);
    return () => document.body.classList.remove("body-overflow");
  }, [mobileOpen]);

  return (
    <header id="pxl-header-elementor" className="is-sticky pxl-header-show casa-mirrored-header">
      <div className="pxl-header-elementor-main px-header--transparent px-header-sidebar-style1">
        <div className="pxl-header-content">
          <div className="casa-header-container casa-header-main-shell">
            <div className="pxl-logo casa-header-main-logo">
              <a href="/" aria-label="Casa Nirvana home"><img src="/assets/uploads/2025/03/logo-light.png" alt="Casa Nirvana" /></a>
            </div>
            <DesktopMenu pathname={pathname} suffix="main" />
            <div className="pxl-button casa-header-outline-action">
              <a href="/get-started/" className="btn pxl-icon-active btn-block-inline btn-default pxl-icon--right">
                <span className="pxl--btn-text">Get Started</span><span className="pxl--btn-icon" aria-hidden="true">↘</span>
              </a>
            </div>
            <div className="pxl-icon--users icon-item h-btn-user style1 casa-header-primary-action">
              <a href="/get-started/community/"><span>Book a Demo</span><span className="pxl--btn-icon" aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </div>

      <div className={`pxl-header-elementor-sticky pxl-onepage-sticky pxl-sticky-stb${scrolled ? " pxl-header-fixed" : ""}`} aria-hidden={!scrolled}>
        <div className="pxl-header-content">
          <div className="casa-header-container casa-header-sticky-shell">
            <div className="pxl-logo casa-header-sticky-logo">
              <a href="/" aria-label="Casa Nirvana home"><img src="/assets/uploads/2025/02/logo-dark.png" alt="Casa Nirvana" /></a>
            </div>
            <DesktopMenu pathname={pathname} suffix="sticky" />
            <div className="pxl-icon--users icon-item h-btn-user style1 casa-header-demo-action">
              <a href="/get-started/community/">Book a Demo</a>
            </div>
            <div className="pxl-button casa-header-rollout-action">
              <a href="/get-started/" className="btn pxl-icon-active btn-block-inline btn-default pxl-icon--left">
                <span className="pxl--btn-text">Plan your rollout</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="pxl-header-mobile" className={`style-light${scrolled ? " pxl-header-mobile-fixed" : ""}`}>
        <div id="pxl-header-main" className="pxl-header-main">
          <div className="pxl-header-mobile-default">
            <div className="pxl-header-branding">
              <a href="/" title="Casa Nirvana"><img src="/wp-content/themes/saliver/assets/img/logo.png" alt="Casa Nirvana" /></a>
            </div>
            <div id="pxl-nav-mobile">
              <button className="pxl-nav-mobile-button pxl-anchor-divider" type="button" aria-label="Toggle navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>
                <span className="pxl-icon-line pxl-icon-line1" /><span className="pxl-icon-line pxl-icon-line2" /><span className="pxl-icon-line pxl-icon-line3" />
              </button>
            </div>
          </div>
          <div className={`pxl-header-menu${mobileOpen ? " active" : ""}`}>
            <div className="pxl-header-menu-scroll">
              <button type="button" className="pxl-menu-close pxl-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
              <div className="pxl-logo-mobile">
                <a className="pxl-logo--dark" href="/"><img src="/wp-content/themes/saliver/assets/img/logo.png" alt="Casa Nirvana" /></a>
              </div>
              <nav className="pxl-header-nav" aria-label="Mobile navigation">
                <ul className="pxl-menu-primary clearfix">
                  {menuItems.map((item) => (
                    <li key={item.href} className={`menu-item${item.children ? " menu-item-has-children" : ""}${isCurrent(pathname, item.href, item.children) ? " current-menu-item" : ""}`}>
                      <div className="casa-mobile-menu-row">
                        <a href={item.href}><span>{item.label}</span></a>
                        {item.children ? <button type="button" className="pxl-menu-toggle" aria-label="Toggle Products submenu" aria-expanded={productsOpen} onClick={() => setProductsOpen((open) => !open)}>+</button> : null}
                      </div>
                      {item.children ? (
                        <ul className={`sub-menu${productsOpen ? " active" : ""}`}>
                          {item.children.map((child) => <li key={child.href}><a href={child.href}><span>{child.label}</span></a></li>)}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </nav>
              <a className="casa-mobile-header-cta" href="/get-started/">Get Started</a>
            </div>
          </div>
          <button type="button" className={`pxl-header-menu-backdrop${mobileOpen ? " active" : ""}`} aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
        </div>
      </div>
    </header>
  );
}
