import React, { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

const Tooltip = ({ children, content }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-slate-800 text-white rounded px-3 py-1.5 text-xs max-w-xs shadow-lg">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;