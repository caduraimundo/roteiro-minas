import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WoodSpot - Preview de Gravação",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WoodSpotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-dvh bg-neutral-100">{children}</div>;
}
