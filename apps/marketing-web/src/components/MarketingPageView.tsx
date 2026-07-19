import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/ArrowIcon";
import type { MarketingPage } from "@/content/site";

export function MarketingPageView({ page }: { page: MarketingPage }) {
  return (
    <main>
      <section className="pxl-page-hero">
        <div className="pxl-page-hero__shape" aria-hidden="true" />
        <div className="pxl-container">
          <p className="pxl-kicker pxl-reveal">{page.eyebrow}</p>
          <h1 className="pxl-reveal pxl-reveal--delay-1">{page.heroTitle}</h1>
          <p className="pxl-page-hero__lead pxl-reveal pxl-reveal--delay-2">{page.heroBody}</p>
          <Link className="pxl-button pxl-reveal pxl-reveal--delay-3" href="/get-started">Book a demo <ArrowIcon /></Link>
        </div>
      </section>
      {page.sections.map((section, index) => (
        <section className={`pxl-content-section pxl-content-section--${section.tone ?? "light"}`} key={`${page.slug}-${section.title}`}>
          <div className={`pxl-container pxl-content-section__grid ${index % 2 ? "is-reversed" : ""}`}>
            <div className="pxl-content-section__copy">
              {section.eyebrow ? <p className="pxl-kicker">{section.eyebrow}</p> : null}
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}><span aria-hidden="true">✓</span>{bullet}</li>)}</ul> : null}
            </div>
            <div className="pxl-content-section__visual">
              {section.image ? (
                <Image src={section.image} width={998} height={710} alt="" />
              ) : (
                <div className="pxl-orbit" aria-hidden="true"><span /><span /><strong>{String(index + 1).padStart(2, "0")}</strong></div>
              )}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
