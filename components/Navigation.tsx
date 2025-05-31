
import React from 'react';
import { View } from '../types';
import PlusCircleIcon from './icons/PlusCircleIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import UsersIcon from './icons/UsersIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';
import TagIcon from './icons/TagIcon';
import AdjustmentsHorizontalIcon from './icons/AdjustmentsHorizontalIcon';

interface NavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

interface NavItem {
  view: View;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView }) => {
  const navItems: NavItem[] = [
    { view: View.LABEL_GENERATOR, label: 'Gerar', icon: PlusCircleIcon },
    { view: View.VALIDITY_MONITOR, label: 'Monitoria', icon: CalendarDaysIcon },
    { view: View.MANAGE_RESPONSIBLES, label: 'Respons.', icon: UsersIcon },
    { view: View.MANAGE_ITEMS, label: 'Itens', icon: ArchiveBoxIcon },
    { view: View.MANAGE_PRODUCT_TYPES, label: 'Tipos Prod.', icon: TagIcon },
    { view: View.MANAGE_CONSERVATION_TYPES, label: 'Tipos Cons.', icon: AdjustmentsHorizontalIcon },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white border-t border-slate-200 shadow-lg print:hidden z-50"> {/* Changed shadow-t-lg to shadow-lg */}
      <div className="flex items-stretch justify-around h-16 md:h-20">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`flex flex-col items-center justify-center flex-grow px-1 py-2 text-xs sm:text-sm focus:outline-none transition-colors duration-150
              ${currentView === item.view
                ? 'text-orange-600'
                : 'text-slate-500 hover:text-orange-500'
              }`}
            aria-current={currentView === item.view ? 'page' : undefined}
            aria-label={item.label}
          >
            <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 mb-0.5 ${currentView === item.view ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-500'}`} />
            <span className="truncate leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
};

export default Navigation;
