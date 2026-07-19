# Marketing Site Visual Parity Contract

## Objective

Replace the Casa Nirvana WordPress runtime with a Next.js marketing application
without changing the approved visual design, page structure, responsive
behavior, content hierarchy, or interaction style.

The WordPress installation under `wordpress/` is the source specification. The
Next.js implementation is a technology migration, not a redesign.

## Non-negotiable parity rules

- Preserve section order, nesting, alignment, and visual hierarchy.
- Preserve desktop, tablet, and mobile layouts and breakpoint behavior.
- Preserve typography: font files, weights, sizes, line heights, and tracking.
- Preserve colors, gradients, borders, shadows, radii, and backgrounds.
- Preserve container widths, spacing, overlap, and positioning behavior.
- Preserve approved imagery, icons, decorative assets, and aspect ratios.
- Preserve animation type, duration, delay, direction, and trigger behavior.
- Preserve header, navigation, sticky states, footer, buttons, and form styling.
- Do not introduce a new component library or default design system styling.
- Do not simplify or "improve" a section during the parity implementation.

Content corrections are allowed only when recorded separately from visual
conversion. A copy change must not silently alter layout or component styling.

## Source hierarchy

When implementation details disagree, use this order of authority:

1. The rendered and approved WordPress page.
2. Elementor page, header, and footer data from the local database export.
3. Elementor-generated responsive styles and page settings.
4. Saliver and Bravis widget markup and CSS.
5. WordPress media assets and custom child-theme overrides.

## Implementation strategy

### Stage 1: compatibility implementation

- Port the Elementor hierarchy into semantic React components.
- Preserve the original widget class names where they materially control layout.
- Port only the CSS rules used by the approved routes and components.
- Reuse the original local font and media files where licensing permits.
- Recreate PHP widget output as equivalent React markup.
- Keep interactive behavior isolated in small client components.

### Stage 2: controlled cleanup

Cleanup starts only after visual parity is accepted. CSS may be consolidated,
renamed, or optimized only when before-and-after visual comparisons remain
unchanged.

## Required comparison viewports

- Desktop: 1440 x 900
- Small desktop: 1280 x 800
- Tablet landscape: 1024 x 768
- Tablet portrait: 768 x 1024
- Mobile: 390 x 844
- Small mobile: 360 x 800

## Acceptance criteria

A route is complete only when:

- Its full-page structure matches the WordPress reference at every required viewport.
- Header and footer states match.
- Text wrapping and section heights match within normal browser-rendering tolerance.
- Image crop, position, and scale match.
- Responsive stacking, hidden elements, and mobile navigation match.
- Animations and interactive states match.
- Forms and links preserve the visible design while using the new implementation.
- Any intentional difference is documented and explicitly approved.

## Route migration order

1. Shared header and navigation
2. Shared footer
3. Home
4. About Us
5. Our Products
6. Residents
7. Security Guards
8. Facility Managers
9. Marketplace
10. Pricing Plans
11. FAQs
12. Contact Us
13. Privacy Policy and Terms of Service

The WordPress site remains available as the reference until all approved routes
have passed parity review and production redirects are confirmed.

