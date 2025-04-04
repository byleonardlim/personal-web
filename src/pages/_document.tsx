import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="text-gray-900">
      <div className="fixed inset-0 w-full h-full -z-10" style={{ background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef, #a9b6c2)' }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
