import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-20 shadow-sm h-20">
      <button
        onClick={onMenuClick}
        className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">GITARA BRANCH</p>
      </div>
    </div>
  );
}