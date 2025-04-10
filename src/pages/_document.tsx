import { Html, Head, Main, NextScript } from "next/document";
import Footer from '@/components/footer';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="anti-aliased text-gray-900">
      <div className="inset-0 w-full h-full -z-10" />
        <Main />
        <NextScript />
      </body>
      <Footer />
    </Html>
  );
}
