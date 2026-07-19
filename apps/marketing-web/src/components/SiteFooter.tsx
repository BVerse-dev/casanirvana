import Image from "next/image";

import { navigation, productLinks } from "@/content/site";

export function SiteFooter() {
  return (
    <footer id="pxl-footer-elementor" className="pxl-footer pxl-footer-show">
      <div className="pxl-container pxl-footer__main">
        <div className="pxl-footer__brand">
          <Image src="/assets/logo-dark.png" width={528} height={128} alt="Casa Nirvana" />
          <p>The connected operating system for safer, simpler and better-run residential communities.</p>
          <a className="pxl-footer__contact" href="mailto:hello@casanirvana.com">hello@casanirvana.com</a>
        </div>
        <div>
          <h3>Essential</h3>
          {navigation.slice(1).map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </div>
        <div>
          <h3>Products</h3>
          {productLinks.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </div>
        <div>
          <h3>Resources</h3>
          <a href="/core-features">Core Features</a>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
          <a href="/contact-us">Support</a>
        </div>
      </div>

      <div className="pxl-container pxl-footer__newsletter">
        <div>
          <span className="pxl-kicker">Stay connected</span>
          <h2>Get product news and community operations insights.</h2>
        </div>
        <form action="/contact-us" method="get">
          <label className="pxl-sr-only" htmlFor="footer-email">Email address</label>
          <input id="footer-email" name="email" type="email" placeholder="Enter your email address" required />
          <button type="submit" aria-label="Continue to contact Casa Nirvana">↗</button>
        </form>
      </div>

      <div className="pxl-footer__bottom pxl-container">
        <span>© {new Date().getFullYear()} Casa Nirvana. All rights reserved.</span>
        <span>Built for connected communities.</span>
      </div>
    </footer>
  );
}
