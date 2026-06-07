
import "../globals.css";

export const metadata = {
  title: "SkillmatriX",
  description: "AI-powered career companion",
  icons: {
    icon: "/logo.png",
  },
};




export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
      </head>
      <body className="font-sans bg-[#A8E6CF] text-white">
        <main>{children}</main>
      </body>
    </html>
  );
}
