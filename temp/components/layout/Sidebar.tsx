import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  UserCircle, 
  Briefcase, 
  CheckSquare, 
  Users,
  Settings,
  LogOut,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "sidebar-item",
      active && "active shadow-sm"
    )}
  >
    <Icon size={18} />
    <span className="text-[14px]">{label}</span>
  </motion.div>
);

export default function Sidebar({ currentTab, setTab }: { currentTab: string, setTab: (t: string) => void }) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'learn', icon: BookOpen, label: 'Learn' },
    { id: 'talk', icon: MessageSquare, label: 'Talk AI' },
    { id: 'roleplay', icon: UserCircle, label: 'Roleplay' },
    { id: 'interview', icon: Briefcase, label: 'Interview' },
    { id: 'task', icon: CheckSquare, label: 'Task' },
    { id: 'group', icon: Users, label: 'Group' },
  ];

  return (
    <aside className="w-[220px] h-full flex flex-col bg-white border-r border-gray-100 p-6 hidden lg:flex rounded-r-[24px] shadow-sm">
      <div className="flex items-center gap-2 mb-10 pl-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white ring-4 ring-primary/5 shadow-lg">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary">AI Tutor</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentTab === item.id}
            onClick={() => setTab(item.id)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-1">
        <SidebarItem icon={Settings} label="Settings" />
        <SidebarItem icon={LogOut} label="Logout" />
      </div>
    </aside>
  );
}
