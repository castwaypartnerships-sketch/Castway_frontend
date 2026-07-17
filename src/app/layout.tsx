import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/lib/redux/provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Display face for page titles, section headers, and the sidebar wordmark
 * only — body copy and controls stay on Geist Sans for density. A confident
 * grotesk rather than an editorial serif, matching the "production console"
 * register (see globals.css's token comments) rather than a magazine one. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Castway — Creator OS",
    template: "%s · Castway",
  },
  description:
    "Castway is a professional network for the creator economy — Creators, Freelancers, Brands, and Agencies build a profile, discover opportunities, connect, and message each other.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            <TooltipProvider delay={200}>
              {children}
              <Toaster />
            </TooltipProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
