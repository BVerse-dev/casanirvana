"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigation, productLinks } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 40);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header id="pxl-header-elementor" className="pxl-header pxl-header-show" data-menu-open={menuOpen} data-scrolled={scrolled}>
      <div className="pxl-header__inner">
        <Link className="pxl-logo" href="/" onClick={closeMenu} aria-label="Casa Nirvana home">
          <Image src="/assets/logo-dark.png" width={300} height={73} alt="Casa Nirvana" priority />
        </Link>
        <button
          className="pxl-menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav id="primary-navigation" className="pxl-navigation" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            if (item.href === "/our-products") {
              return (
                <div className="pxl-navigation__group" key={item.href}>
                  <Link className={active ? "is-active" : ""} href={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                  <div className="pxl-navigation__dropdown">
                    {productLinks.map((product) => (
                      <Link key={product.href} href={product.href} onClick={closeMenu}>
                        {product.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link className={active ? "is-active" : ""} key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link className="pxl-button pxl-button--header" href="/get-started" onClick={closeMenu}>
          Book a demo <span className="pxl-header-button__icon" aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
