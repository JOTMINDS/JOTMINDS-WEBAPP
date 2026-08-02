interface TeacherTabBarProps {
  activeTab: 'overview' | 'individual' | 'my-style' | 'teaching-style' | 'lesson-planner' | 'analytics-compare' | 'manage-class';
  onTabChange: (tab: 'overview' | 'individual' | 'my-style' | 'teaching-style' | 'lesson-planner' | 'analytics-compare' | 'manage-class') => void;
}

export function TeacherTabBar({ activeTab, onTabChange }: TeacherTabBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 px-4 py-3 sticky top-14 z-10">
      <div className="flex gap-2.5 max-w-[960px] mx-auto overflow-x-auto scrollbar-none pb-1 text-xs sm:text-sm">
        <button
          onClick={() => onTabChange('lesson-planner')}
          className={`
            px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5
            ${activeTab === 'lesson-planner'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold'
              : 'bg-indigo-100/70 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 hover:bg-indigo-200'
            }
          `}
        >
          ✨ AI Lesson Planner
        </button>
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
          onClick={() => onTabChange('teaching-style')}
          className={`
            px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap
            ${activeTab === 'teaching-style'
              ? 'bg-white text-foreground shadow-sm'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Teacher Intelligence (JTIA)
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
          My Profile
        </button>
        <button
          onClick={() => onTabChange('analytics-compare')}
          className={`
            px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap
            ${activeTab === 'analytics-compare'
              ? 'bg-white text-foreground shadow-sm'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Alignment Analysis
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
