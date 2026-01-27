const fs = require('fs');
const path = require('path');

const layoutContent = `// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array - dynamic routes will be handled at runtime
  return [];
}

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`;

const dynamicRouteDirs = [
  './app/dashboard/articles/edit/[id]',
  './app/dashboard/breaking-news/[id]',
  './app/dashboard/categories/edit/[id]',
  './app/dashboard/privacy-policy/edit/[id]',
  './app/dashboard/tags/edit/[id]',
  './app/dashboard/terms-of-use/edit/[id]',
  './app/dashboard/upper-articles/[id]',
  './app/dashboard/upper-articles/edit/[id]',
  './app/dashboard/users/edit/[id]'
];

dynamicRouteDirs.forEach(dir => {
  const layoutPath = path.join(dir, 'layout.tsx');
  try {
    if (!fs.existsSync(layoutPath)) {
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(layoutPath, layoutContent, 'utf8');
      console.log(`Created layout.tsx in: ${dir}`);
    } else {
      console.log(`layout.tsx already exists in: ${dir}`);
    }
  } catch (error) {
    console.error(`Error creating layout in ${dir}:`, error.message);
  }
});

console.log('Layout creation completed!');