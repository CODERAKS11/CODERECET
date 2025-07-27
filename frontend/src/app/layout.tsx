
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Psychometric Insights',
  description: 'Specialized psychometric tests to evaluate your potential.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background text-foreground">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-br from-primary/20 via-background to-background -z-10" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
