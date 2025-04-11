import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatCard } from '../ui/StatCard';
import { Image, Clock, HardDrive, Users } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeConversionType: string;
  onConversionTypeChange: (type: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function MainLayout({
  children,
  activeConversionType,
  onConversionTypeChange,
  activeTab = 'conversions',
  onTabChange = () => {}
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="John Doe" />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Image Converter</h1>
                <p className="text-gray-500">Convert your images with ease</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Conversions"
                value="1,234"
                trend={12}
                icon={<Image className="w-5 h-5 text-indigo-600" />}
              />
              <StatCard
                title="Processing Time"
                value="2.3s"
                trend={-5}
                icon={<Clock className="w-5 h-5 text-green-600" />}
              />
              <StatCard
                title="Storage Used"
                value="45.8 GB"
                total="100 GB"
                icon={<HardDrive className="w-5 h-5 text-orange-600" />}
              />
              <StatCard
                title="Active Users"
                value="892"
                trend={8}
                icon={<Users className="w-5 h-5 text-purple-600" />}
              />
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 