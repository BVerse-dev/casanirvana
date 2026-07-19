import { ImageResponse } from "next/og";

export const alt = "Casa Nirvana - Safer communities run better together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a0a0a", color: "white", padding: "74px 80px", fontFamily: "sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 42, fontWeight: 700 }}><span style={{ width: 66, height: 34, background: "#9bea69", transform: "skew(-38deg)" }} />Casa Nirvana</div><div style={{ display: "flex", flexDirection: "column", gap: 20 }}><span style={{ color: "#9bea69", fontSize: 24, textTransform: "uppercase", letterSpacing: 4 }}>Connected community operations</span><strong style={{ fontSize: 76, lineHeight: 1.02, letterSpacing: -3 }}>Safer communities<br />run better together.</strong></div></div>, size);
}
