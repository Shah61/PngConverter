import React from "react";

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  label?: string;
  showLabels?: boolean;
}

const Toggle = ({ enabled, onChange, label, showLabels = true }: ToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      {label && <p className="font-medium">{label}</p>}
      
      <div className="flex items-center space-x-2">
        {showLabels && <span className="text-sm text-slate-500">Off</span>}
        <button
          type="button"
          onClick={onChange}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        {showLabels && <span className="text-sm text-slate-500">On</span>}
      </div>
    </div>
  );
};

export default Toggle;