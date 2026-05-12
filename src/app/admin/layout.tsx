// Thin shell — auth guard lives in (protected)/layout.tsx
// This layout covers /admin/login too, so it must NOT redirect.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
