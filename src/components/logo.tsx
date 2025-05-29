import { MountainSnow } from 'lucide-react';
import Link from 'next/link';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <MountainSnow className="h-6 w-6 text-primary transition-all group-hover:scale-110" />
      {!collapsed && (
         <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Zenith Budget
         </span>
      )}
    </Link>
  );
}
