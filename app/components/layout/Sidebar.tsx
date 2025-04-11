import React from 'react';
import { Home, Image, Settings, History, Users, Package, FileQuestion, Shield, BarChart, Menu } from 'lucide-react';
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
}

const NavItem = ({ icon: Icon, label, active, onClick, badge }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
      active 
        ? "bg-green-500 text-white" 
        : "text-gray-600 hover:bg-gray-100"
    )}
  >
    <Icon size={20} className={cn("mr-3", active ? "text-white" : "text-gray-500")} />
    <span>{label}</span>
    {badge && (
      <span className={cn(
        "ml-auto px-2 py-0.5 text-xs rounded-full",
        active ? "bg-green-400 text-white" : "bg-gray-200 text-gray-600"
      )}>
        {badge}
      </span>
    )}
  </button>
);

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Image className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl">Converter</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem
          icon={Home}
          label="Dashboard"
          active={activeTab === 'dashboard'}
          onClick={() => onTabChange('dashboard')}
        />
        <NavItem
          icon={Image}
          label="Conversions"
          active={activeTab === 'conversions'}
          onClick={() => onTabChange('conversions')}
          badge={3}
        />
        <NavItem
          icon={Package}
          label="Batch Jobs"
          active={activeTab === 'batch'}
          onClick={() => onTabChange('batch')}
        />
        <NavItem
          icon={History}
          label="History"
          active={activeTab === 'history'}
          onClick={() => onTabChange('history')}
        />
        <NavItem
          icon={Settings}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />

        <div className="pt-4 mt-4 border-t">
          <NavItem
            icon={FileQuestion}
            label="FAQ"
            active={activeTab === 'faq'}
            onClick={() => onTabChange('faq')}
          />
          <NavItem
            icon={Shield}
            label="Security"
            active={activeTab === 'security'}
            onClick={() => onTabChange('security')}
          />
          <NavItem
            icon={BarChart}
            label="Stats"
            active={activeTab === 'stats'}
            onClick={() => onTabChange('stats')}
          />
        </div>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="text-sm font-medium">Free Plan</div>
            <div className="text-xs text-gray-500">Upgrade to Pro</div>
          </div>
          <Menu size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}; 