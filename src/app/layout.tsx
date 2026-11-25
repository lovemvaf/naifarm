import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import { Toaster } from "sonner";
import { DemoStoreProvider } from "@/context/DemoStoreContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { CmsProvider } from "@/context/CmsContext";
import { SeasonalThemeProvider } from "@/context/SeasonalThemeContext";
import { MotionProvider } from "@/components/motion/MotionSystem";
import { SeasonalPageDecor } from "@/components/seasonal/SeasonalPageDecor";
import { AppHeader } from "@/components/navigation/AppHeader";
import { AppFooter } from "@/components/navigation/AppFooter";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { NaiFarmHomeChat } from "@/components/chatbot/NaiFarmHomeChat";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NaiFarm · Chợ OCOP Thanh niên Đồng Nai",
  description:
    "Gieo tri thức – Kết nối nhà nông – Lan tỏa giá trị. Hệ sinh thái chợ OCOP thanh niên, truy xuất nguồn gốc QR, chuyển đổi số nhà nông và tình nguyện số tại Thành phố Đồng Nai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${lora.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F5F3E9] text-[#25352B]">
        <MotionProvider>
          <LocaleProvider>
            <DemoStoreProvider>
              <CmsProvider>
                <SeasonalThemeProvider>
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#245B3D] focus:px-4 focus:py-2 focus:text-white"
                  >
                    Chuyển đến nội dung chính / Skip to main content
                  </a>
                  <SeasonalPageDecor />
                  <AppHeader />
                  <main id="main-content" className="flex-1">
                    {children}
                  </main>
                  <AppFooter />
                  <MobileBottomNav />
                  <NaiFarmHomeChat />
                  <Toaster position="bottom-left" richColors closeButton duration={2200} visibleToasts={2} />
                </SeasonalThemeProvider>
              </CmsProvider>
            </DemoStoreProvider>
          </LocaleProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
