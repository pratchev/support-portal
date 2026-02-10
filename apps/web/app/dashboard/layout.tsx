import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar role="end_user" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
