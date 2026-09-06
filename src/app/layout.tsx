import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { ThemeProvider } from "@/components/theme/theme-provider";

import "driver.js/dist/driver.css";
import "./globals.css";

const applicationName = "Job Application Tracker";
const officialUrl = new URL("https://jobs.ivocamacho.com");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const description = t("description");

  return {
    metadataBase: officialUrl,
    title: applicationName,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: applicationName,
      description,
      url: "/",
      siteName: applicationName,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: applicationName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: applicationName,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-theme="light"
      data-font-scale="100"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var root=document.documentElement;var theme=localStorage.getItem("job-tracker-theme")==="dark"?"dark":"light";var storedScale=localStorage.getItem("job-tracker-font-scale");var scale=["90","95","100","105","110"].includes(storedScale)?storedScale:"100";root.dataset.theme=theme;root.style.colorScheme=theme;root.dataset.fontScale=scale;root.style.setProperty("--app-font-scale",String(Number(scale)/100))}catch(e){document.documentElement.dataset.theme="light";document.documentElement.dataset.fontScale="100"}',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
