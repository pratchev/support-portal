import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
