import "./globals.css";

export const metadata = {
  title: "FlexSpot - Smart Lottery System for Flexible Work Schedules",
  description: "Transform your flexible work scheduling with our intelligent, fair, and transparent lottery system. Perfect for companies managing hybrid work arrangements.",
  keywords: "flexible work, lottery system, work scheduling, hybrid work, employee management",
  authors: [{ name: "FlexSpot Team" }],
  viewport: "width=device-width, initial-scale=1",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
