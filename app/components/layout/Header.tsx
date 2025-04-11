import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  userName?: string;
  userImage?: string;
}

export const Header = ({ userName = "Guest User", userImage }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">PNG to JPG Converter</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center flex-1 gap-4">
              <div className="w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 bg-gray-50 border-0 w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 hover:text-gray-600"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-600"
            >
              <Settings className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">{userName}</div>
                <div className="text-xs text-gray-500">Free Plan</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
                {userImage && (
                  <img
                    src={userImage}
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 