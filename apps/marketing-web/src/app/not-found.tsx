import Link from "next/link";

export default function NotFound() {
  return <main className="pxl-not-found"><div><span>404</span><p className="pxl-kicker">Page not found</p><h1>This route is not part of the community.</h1><p>The page may have moved while Casa Nirvana was transitioning away from WordPress.</p><Link className="pxl-button" href="/">Return home <span aria-hidden="true">↗</span></Link></div></main>;
}
