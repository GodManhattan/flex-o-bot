import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";

export const metadata = {
  title: "Flex-O-Bot - Smart  System for Flexible Work Schedules",
  description:
    "Transform your flexible work scheduling with our intelligent, fair, and transparent  system. Perfect for companies managing hybrid work arrangements.",
  keywords:
    "flexible work,  system, work scheduling, hybrid work, employee management",
  authors: [{ name: "Flex-O-Bot Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
