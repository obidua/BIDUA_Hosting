import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MobileDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  placeholder?: string;
}

export function MobileDropdown({ options, value, onChange, label, placeholder }: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const updateMenuPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      if (isOpen) {
        updateMenuPosition();
      }
    }

    if (isOpen) {
      updateMenuPosition();
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateMenuPosition);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateMenuPosition);
      };
    }
  }, [isOpen, updateMenuPosition]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-800 text-white rounded-lg border-2 border-cyan-500/30 hover:border-cyan-500/50 active:border-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[56px] touch-manipulation"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {selectedOption?.icon && (
            <selectedOption.icon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
          )}
          <div className="flex flex-col items-start min-w-0">
            <span className="font-medium truncate w-full text-left text-base">
              {selectedOption?.label || placeholder || 'Select an option'}
            </span>
            {selectedOption?.sublabel && (
              <span className="text-xs text-slate-400 truncate w-full text-left mt-0.5">
                {selectedOption.sublabel}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-cyan-400 transition-transform duration-300 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fadeIn"
            onClick={() => setIsOpen(false)}
            style={{ touchAction: 'none' }}
          />
          <div
            className="fixed z-[110] bg-slate-800 border-2 border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden animate-slideDown"
            style={{
              top: `${menuPosition.top + 8}px`,
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              maxHeight: 'min(70vh, 400px)'
            }}
          >
            <div className="overflow-y-auto max-h-[inherit] overscroll-contain">
            {options.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 hover:bg-slate-700/70 active:bg-slate-700 transition-all min-h-[56px] touch-manipulation ${
                    isSelected ? 'bg-cyan-600/20 border-l-4 border-cyan-500' : 'border-l-4 border-transparent'
                  } ${option === options[options.length - 1] ? '' : 'border-b border-slate-700/50'}`}
                >
                  {OptionIcon && (
                    <OptionIcon className={`h-5 w-5 flex-shrink-0 transition-colors ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  )}
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className={`font-medium truncate w-full text-left text-base transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {option.label}
                    </span>
                    {option.sublabel && (
                      <span className="text-xs text-slate-400 truncate w-full text-left mt-0.5">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
