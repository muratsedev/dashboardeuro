const fs = require('fs');
const path = require('path');

const layoutDirs = [
  './app/dashboard/articles/edit/[id]',
  './app/dashboard/breaking-news/[id]',
  './app/dashboard/categories/edit/[id]',
  './app/dashboard/privacy-policy/edit/[id]',
  './app/dashboard/tags/edit/[id]',
  './app/dashboard/terms-of-use/edit/[id]',
  './app/dashboard/about-us/edit/[id]',
  './app/dashboard/upper-articles/[id]',
  './app/dashboard/upper-articles/edit/[id]',
  './app/dashboard/users/edit/[id]',
  './app/dashboard/social-media/[id]'
];

const layoutContent = `// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Generate some common static pages for better SEO
  // In production, these would typically come from your API
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`;

layoutDirs.forEach(dir => {
  const layoutPath = path.join(dir, 'layout.tsx');
  try {
    if (fs.existsSync(layoutPath)) {
      fs.writeFileSync(layoutPath, layoutContent, 'utf8');
      console.log(`Updated layout.tsx in: ${dir}`);
    } else {
      console.log(`Layout not found in: ${dir}`);
    }
  } catch (error) {
    console.error(`Error updating layout in ${dir}:`, error.message);
  }
});

console.log('Layout update completed!');