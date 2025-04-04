import Head from 'next/head';
import { useRouter } from 'next/router';
import { GoogleTagManager } from "@next/third-parties/google"; 

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

export default function SEO({
  title = 'Leonard Lim | Digital Product Designer',
  description = 'Digital product designer transforming abstract possibilities into business-validated digital products with intelligent technology.',
  image = '/assets/images/og-image.png', // Create this image for social sharing
  article = false,
}: SEOProps) {
  const router = useRouter();
  const canonicalUrl = `https://byleonardlim.com${router.asPath === '/' ? '' : router.asPath}`;

  return (
    <Head>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:image" content={`https://byleonardlim.com${image}`} />
      <meta property="og:site_name" content="Leonard Lim" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://byleonardlim.com${image}`} />
      
      {/* Additional SEO-friendly meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />

      <GoogleTagManager gtmId="G-GE1KE7MRW9" />
    </Head>
  );
}