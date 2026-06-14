import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Council",
  description: "ChatGPT・Gemini・Claude に同時に質問し、Claude が結論をまとめる",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
