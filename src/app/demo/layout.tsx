import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Truy cập nhanh · NaiFarm",
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuickAccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
