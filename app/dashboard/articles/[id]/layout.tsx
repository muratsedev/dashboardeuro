// Force dynamic rendering for article routes
export const dynamic = 'force-dynamic'

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}