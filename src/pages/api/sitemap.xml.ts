import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// This function gets all case study slugs
const getCaseStudySlugs = () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'content/case-studies'));
  return files.map(filename => filename.replace('.md', ''));
};

// Format the date for the sitemap (YYYY-MM-DD)
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Get the last modified date from a file
const getLastModified = (filePath: string) => {
  try {
    const stats = fs.statSync(filePath);
    return formatDate(stats.mtime);
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set the appropriate header for XML content
  res.setHeader('Content-Type', 'text/xml');
  
  // Get all case study slugs
  const caseStudySlugs = getCaseStudySlugs();
  
  // Base URL of your website
  const baseUrl = 'https://byleonardlim.com';
  
  // Today's date as the last modified date for static pages
  const today = formatDate(new Date());
  
  // XML sitemap template
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Case Studies -->
  ${caseStudySlugs
    .map(slug => {
      const filePath = path.join(process.cwd(), 'content/case-studies', `${slug}.md`);
      const lastmod = getLastModified(filePath);
      
      return `
  <url>
    <loc>${baseUrl}/case-study/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  // Return the XML sitemap
  res.status(200).send(sitemap);
}