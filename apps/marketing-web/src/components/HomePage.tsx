import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/ArrowIcon";
import { productCards } from "@/content/site";

const trustPoints = ["Resident experience", "Gate security", "Facility operations", "Payments", "Marketplace"];

const reasons = [
  ["Lifestyle convenience", "Manage visitors, requests, payments, communication and trusted services in one place."],
  ["Instant transparency", "Every payment, request and visitor event carries a clear status and accountable history."],
  ["Built for real communities", "Casa Nirvana is designed around estates, apartments and gated residential communities."],
  ["Smart security", "QR visitor passes, gate verification and emergency coordination help protect communities around the clock."],
] as const;

const integrations = [
  ["Payments and billing", "Community charges, hosted checkout and settlement visibility."],
  ["Telecom and utilities", "Supported airtime, data and bill services inside the resident experience."],
  ["Access operations", "Visitor verification and accountable entry records for security teams."],
] as const;

export function HomePage() {
  return (
    <main>
      <section className="pxl-hero pxl-hero--home">
        <div className="pxl-hero__background" aria-hidden="true" />
        <div className="pxl-container pxl-hero__content">
          <div className="pxl-heading px-sub-title-shape1-style">
            <div className="pxl-heading--inner">
              <div className="pxl-item--subtitle wow fadeInUp"><span className="pxl-item--subtext"><span>Smart. Secure. Seamless.</span></span></div>
              <h1 className="pxl-item--title style-default highlight-default wow clarityRise"><span className="pxl-heading--text">Managing your community<br />just got <span>better.</span></span></h1>
            </div>
          </div>
          <p className="pxl-hero__lead pxl-reveal pxl-reveal--delay-2">
            Casa Nirvana brings residents, security guards and facility teams together in one trusted platform designed for safety, simplicity and peace of mind.
          </p>
          <form className="pxl-hero-capture pxl-reveal pxl-reveal--delay-3" action="/get-started" method="get">
            <label className="pxl-sr-only" htmlFor="hero-email">Work email address</label>
            <input id="hero-email" name="email" type="email" placeholder="Enter your work email" required />
            <button type="submit">Get started <span aria-hidden="true">↗</span></button>
          </form>
          <p className="pxl-hero__note pxl-reveal pxl-reveal--delay-3">14-day guided evaluation. No credit card required.</p>
        </div>
      </section>

      <section className="pxl-home-marquee" aria-label="Casa Nirvana platform">
        <div className="pxl-home-marquee__track" aria-hidden="true">
          <span>Community life, connected</span><i>•</i><span>Safer gates</span><i>•</i><span>Clearer operations</span><i>•</i><span>Better living</span><i>•</i>
        </div>
        <div className="pxl-container pxl-home-marquee__device">
          <Image src="/assets/img-phone-h3-1.webp" width={756} height={1138} alt="Casa Nirvana resident mobile experience" priority />
        </div>
      </section>

      <section className="pxl-section pxl-intro pxl-home-intro">
        <div className="pxl-container pxl-intro__grid">
          <div>
            <p className="pxl-kicker">Casa Nirvana</p>
            <h2>Unleash your community&apos;s full potential with connected technology.</h2>
          </div>
          <div>
            <p>Replace paper logs, scattered chats and disconnected tools with one shared source of truth for residents, guards, managers and trusted partners.</p>
            <div className="pxl-inline-actions">
              <Link className="pxl-button pxl-button--dark" href="/core-features">Core features <ArrowIcon /></Link>
              <Link className="pxl-text-link" href="/our-products">Our products <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pxl-section pxl-home-platform">
        <div className="pxl-container">
          <div className="pxl-section-heading pxl-section-heading--center">
            <p className="pxl-kicker">Smarter living starts here</p>
            <h2>One platform for modern communities.</h2>
          </div>
          <div className="pxl-home-platform__card">
            <div className="pxl-home-platform__copy">
              <span>01</span>
              <h3>Everything you need to run a connected community</h3>
              <p>Visitor operations, resident communication, requests, payments and services share the same secure community context.</p>
              <Link className="pxl-text-link" href="/core-features">Explore every capability <span aria-hidden="true">→</span></Link>
            </div>
            <div className="pxl-home-platform__visual">
              <Image src="/assets/laptop-img.png" width={600} height={350} alt="Casa Nirvana connected operations workspace" />
              <div className="pxl-security-badge"><strong>Enterprise-grade</strong><span>tenant-safe data protection</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="pxl-trust-strip" aria-label="Platform coverage">
        <div className="pxl-container">
          <p>Built around the complete community lifecycle</p>
          <div>{trustPoints.map((point) => <span key={point}>{point}</span>)}</div>
        </div>
      </section>

      <section className="pxl-section pxl-products-section">
        <div className="pxl-container">
          <div className="pxl-section-heading">
            <div><p className="pxl-kicker">Key experiences</p><h2>Designed for modern, connected communities.</h2></div>
            <Link className="pxl-button" href="/get-started">Get started today <ArrowIcon /></Link>
          </div>
          <div className="pxl-product-grid">
            {productCards.map((card) => (
              <Link className="pxl-product-card" href={card.href} key={card.href}>
                <span className="pxl-product-card__number">{card.number}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pxl-section pxl-dark-panel pxl-home-proof">
        <div className="pxl-container">
          <div className="pxl-dark-panel__heading">
            <p className="pxl-kicker">Stress-free community living</p>
            <h2>Make everyday operations easier for everyone.</h2>
          </div>
          <div className="pxl-metrics">
            <div><strong>1</strong><span>connected community record</span></div>
            <div><strong>4</strong><span>role-specific product experiences</span></div>
            <div><strong>24/7</strong><span>operational visibility</span></div>
          </div>
        </div>
      </section>

      <section className="pxl-section pxl-home-reasons">
        <div className="pxl-container pxl-home-reasons__grid">
          <div className="pxl-home-reasons__copy">
            <p className="pxl-kicker">Why choose Casa Nirvana</p>
            <h2>Built around the way real communities work.</h2>
            <p>Every workflow is designed to reduce friction while preserving accountability, privacy and control.</p>
            <div className="pxl-home-accordion">
              {reasons.map(([title, body], index) => (
                <details key={title} open={index === 0}>
                  <summary><span>{String(index + 1).padStart(2, "0")}</span>{title}<i aria-hidden="true">+</i></summary>
                  <p>{body}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="pxl-home-reasons__visual">
            <Image src="/assets/img-choo-h6.webp" width={846} height={536} alt="Connected Casa Nirvana community operations" />
          </div>
        </div>
      </section>

      <section className="pxl-section pxl-home-setup">
        <div className="pxl-container pxl-home-setup__grid">
          <div className="pxl-home-setup__visual">
            <Image className="pxl-home-setup__ring" src="/assets/img-h6-spin.png" width={630} height={630} alt="" aria-hidden="true" />
            <Image className="pxl-home-setup__screen" src="/assets/img-nt-spin6.png" width={510} height={398} alt="Casa Nirvana onboarding workspace" />
            <Image className="pxl-home-setup__card" src="/assets/img-no-credit.png" width={356} height={162} alt="Simple Casa Nirvana onboarding" />
          </div>
          <div>
            <p className="pxl-kicker">Start in minutes</p>
            <h2>Effortless setup for your community.</h2>
            <p>Add your community, invite the right teams and residents, and begin with a rollout shaped around your operational needs.</p>
            <ul className="pxl-number-list">
              <li><span>01</span> Configure your community</li>
              <li><span>02</span> Invite teams and residents</li>
              <li><span>03</span> Launch connected operations</li>
            </ul>
            <Link className="pxl-button pxl-button--dark" href="/get-started">Plan your rollout <ArrowIcon /></Link>
          </div>
        </div>
      </section>

      <section className="pxl-section pxl-home-integrations">
        <div className="pxl-container pxl-home-integrations__grid">
          <div>
            <p className="pxl-kicker">Integrations and partners</p>
            <h2>Connected services for every community need.</h2>
            <p>Casa Nirvana brings trusted operational and lifestyle services into one controlled experience without forcing residents or teams to switch between disconnected tools.</p>
            <div className="pxl-integration-list">
              {integrations.map(([title, body], index) => <div key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}
            </div>
            <Link className="pxl-button" href="/contact-us/?reason=Book%20a%20demo">Book a demo <ArrowIcon /></Link>
          </div>
          <div className="pxl-home-integrations__visual">
            <Image src="/assets/imgoverone.png" width={848} height={480} alt="Casa Nirvana integrations overview" />
            <Image src="/assets/img-image-box-h11.png" width={414} height={458} alt="Casa Nirvana service experience" />
          </div>
        </div>
      </section>

      <section className="pxl-home-download">
        <div className="pxl-container pxl-home-download__intro">
          <p className="pxl-kicker">Always within reach</p>
          <h2>Your community in your pocket, wherever you go.</h2>
        </div>
        <div className="pxl-container pxl-home-download__card">
          <div>
            <p className="pxl-kicker">Casa Nirvana mobile</p>
            <h3>Resident and guard experiences built for action.</h3>
            <p>Access the right community tools from iOS or Android with a focused experience for each role.</p>
            <div className="pxl-home-download__qr"><Image src="/assets/qr.png" width={158} height={158} alt="Casa Nirvana app download QR code" /><span>Scan to explore<br />the mobile experience</span></div>
          </div>
          <Image className="pxl-home-download__phones" src="/assets/img-phone-h3-2.webp" width={1300} height={507} alt="Casa Nirvana mobile applications" />
        </div>
      </section>
    </main>
  );
}
