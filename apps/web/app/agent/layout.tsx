import { Sidebar } from '@/components/layout/sidebar';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar role="agent" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
