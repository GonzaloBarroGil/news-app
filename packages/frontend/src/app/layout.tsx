import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "News App",
  description: "Modern news browsing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
