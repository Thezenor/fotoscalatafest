import type { Metadata } from "next";

// El panel de superadmin no se indexa.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
