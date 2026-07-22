import { readFileSync } from "node:fs";
import { join } from "node:path";

import { SiteHeaderBehavior } from "@/components/SiteHeaderBehavior";

const snapshotPath = join(process.cwd(), "public", "wordpress-snapshot", "pages", "index.html");
const snapshot = readFileSync(snapshotPath, "utf8");
const approvedHeader = snapshot.match(/<header id="pxl-header-elementor"[\s\S]*?<\/header>/)?.[0];
const approvedThemeVariables = snapshot.match(/^:root\{--primary-color:[^\n]+$/m)?.[0];
const approvedElementorKitCss = snapshot.match(/^\.elementor-kit-7[^\n]+$/m)?.[0];
const approvedMainHeaderCss = snapshot.match(/^\.elementor-1318[^\n]+$/m)?.[0];

if (!approvedHeader || !approvedThemeVariables || !approvedElementorKitCss || !approvedMainHeaderCss) {
  throw new Error("The approved WordPress header or its Elementor CSS could not be extracted from the homepage snapshot.");
}

function replaceWidgetHref(html: string, widgetId: string, href: string) {
  const widgetLink = new RegExp(`(<div class="elementor-element elementor-element-${widgetId}[\\s\\S]*?<a href=")[^"]+("[^>]*>)`);
  return html.replace(widgetLink, `$1${href}$2`);
}

const onboardingHeader = [
  ["93b7a95", "/get-started/"],
  ["f108876", "/get-started/community/"],
  ["1200734", "/get-started/community/"],
  ["f837d3b", "/get-started/"],
].reduce((html, [widgetId, href]) => replaceWidgetHref(html, widgetId, href), approvedHeader);

export function SiteHeader() {
  return (
    <>
      <SiteHeaderBehavior />
      <style id="elementor-post-1318" dangerouslySetInnerHTML={{ __html: `${approvedThemeVariables!}\n${approvedElementorKitCss!}\n${approvedMainHeaderCss!}` }} />
      <div className="casa-wordpress-header-host" style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: onboardingHeader }} />
    </>
  );
}
