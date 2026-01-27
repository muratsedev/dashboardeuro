// Force dynamic rendering for article edit routes
export const dynamic = 'force-dynamic'

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}