import React from 'react';
import { Badge } from "@/app/components/ui/badge";

interface ProBadgeProps {
  className?: string;
}

export const ProBadge = ({ className = '' }: ProBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-2 py-0.5 text-xs font-medium ${className}`}
    >
      PRO
    </Badge>
  );
}; 