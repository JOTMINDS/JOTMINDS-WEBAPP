interface TeacherTabBarProps {
  activeTab: 'overview' | 'individual' | 'my-style' | 'manage-class';
  onTabChange: (tab: 'overview' | 'individual' | 'my-style' | 'manage-class') => void;
}

export function TeacherTabBar({ activeTab, onTabChange }: TeacherTabBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 px-4 py-3 sticky top-14 z-10">
      <div className="flex gap-3 max-w-[960px] mx-auto overflow-x-auto">
        <button
          onClick={() => onTabChange('individual')}
          className={`
            px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap
            ${activeTab === 'individual'
              ? 'bg-white text-foreground shadow-sm'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Individual Students
        </button>
        <button
          onClick={() => onTabChange('overview')}
          className={`
            px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap
            ${activeTab === 'overview'
              ? 'bg-white text-foreground shadow-sm'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Class Overview
        </button>
        <button
          onClick={() => onTabChange('my-style')}
          className={`
            px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap
            ${activeTab === 'my-style'
              ? 'bg-white text-foreground shadow-sm'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          My Teaching Style
        </button>
        <button
          onClick={() => onTabChange('manage-class')}
          className={`
            px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap
            ${activeTab === 'manage-class'
              ? 'bg-white text-foreground shadow-sm'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Manage Class
        </button>
      </div>
    </div>
  );
}
