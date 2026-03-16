import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow — Modern Task Management",
    template: "%s | TaskFlow",
  },
  description:
    "A modern, beautiful task management system for individuals and teams.",
  keywords: ["task management", "productivity", "todo", "project management"],
  authors: [{ name: "TaskFlow Team" }],
  creator: "TaskFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "TaskFlow — Modern Task Management",
    description: "A modern, beautiful task management system.",
    siteName: "TaskFlow",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast:
                    "bg-card text-card-foreground border-border shadow-soft-lg",
                  title: "text-foreground font-semibold",
                  description: "text-muted-foreground",
                  actionButton: "bg-primary text-primary-foreground",
                  cancelButton: "bg-muted text-muted-foreground",
                  closeButton: "text-muted-foreground",
                },
              }}
              richColors
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
