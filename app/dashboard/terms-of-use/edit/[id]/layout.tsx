// Force dynamic rendering for dynamic routes
export const dynamic = 'force-dynamic'

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}