import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "모두복지 - 나에게 맞는 복지 혜택 찾기",
  description:
    "기본 정보를 입력하면 받을 수 있는 복지 혜택을 찾아주고, 필요한 서류와 신청 방법을 알려드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Link href="/" className="block">
              <h1 className="text-2xl font-bold text-blue-600">모두복지</h1>
              <p className="text-sm text-gray-500">나에게 맞는 복지 혜택 찾기</p>
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6">
          <div className="max-w-2xl mx-auto">{children}</div>
        </main>
        <footer className="bg-white border-t px-4 py-4 text-center text-sm text-gray-400 space-y-1">
          <p>모두복지는 오픈소스 프로젝트입니다. 추천 결과는 참고용이며, 최종 자격은 해당 기관에서 확인하세요.</p>
          <p>
            <a href="/privacy" className="hover:underline hover:text-gray-600">개인정보처리방침</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
