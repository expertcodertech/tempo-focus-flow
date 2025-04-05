
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  DollarSign,
  Home,
  List,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { themeMode, setThemeMode } = useAppStore();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/calendar', name: 'Calendar', icon: CalendarDays },
    { path: '/focus', name: 'Focus Timer', icon: Clock },
    { path: '/expenses', name: 'Expenses', icon: DollarSign },
    { path: '/tasks', name: 'Tasks', icon: List },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-sidebar border-r border-sidebar-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-sidebar-border">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary">TempoFocus</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-sidebar-accent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {collapsed ? (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            ) : (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const ItemIcon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center p-3 rounded-md transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <ItemIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className="flex items-center p-3 w-full rounded-md hover:bg-sidebar-accent/50 transition-colors"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
