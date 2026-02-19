"use client";

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '../../../../utils/supabase/client';
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Calendar,
    Layers,
    Image as ImageIcon,
    Settings,
    ExternalLink,
    X,
    Building2,
    Users,
    Film,
    BookOpen,
    BarChart3,
    Camera,
    Info,
    UserCheck
} from 'lucide-react';

const ACCESS_MAPPING: Record<string, string> = {
    '/admin/events': 'events',
    '/admin/jobs': 'jobs',
    '/admin/business': 'businesses',
    '/admin/gallery': 'galleries',
    '/admin/comunidade/reels': 'reels',
};

const menuItems = [
    { name: 'Dashboard', key: 'admin.menu.dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Posts', key: 'admin.menu.posts', path: '/admin/posts', icon: FileText },
    { name: 'Posts da Comunidade', key: 'admin.menu.communityPosts', path: '/admin/comunidade/posts', icon: LayoutDashboard },
    { name: 'Reels da Comunidade', key: 'admin.menu.communityReels', path: '/admin/comunidade/reels', icon: Film },
    { name: 'Guias de Usuários', key: 'admin.menu.userGuides', path: '/admin/guides', icon: BookOpen },
    { name: 'Usuários Registrados', key: 'admin.menu.users', path: '/admin/users', icon: Users },
    { name: 'Solicitações de Acesso', key: 'admin.menu.accessRequests', path: '/admin/requests', icon: UserCheck },
    { name: 'Business', key: 'admin.menu.business', path: '/admin/business', icon: Building2 },
    { name: 'Jobs', key: 'admin.menu.jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Calendário', key: 'admin.menu.calendar', path: '/admin/events', icon: Calendar },
    { name: 'Galeria de Fotos', key: 'admin.menu.gallery', path: '/admin/gallery', icon: Camera },
    { name: 'Statistics', key: 'admin.menu.statistics', path: '/admin/statistics', icon: BarChart3 },
    { name: 'Categories', key: 'admin.menu.categories', path: '/admin/categories', icon: Layers },
    { name: 'Media', key: 'admin.menu.media', path: '/admin/media', icon: ImageIcon },
    { name: 'Páginas do Rodapé', key: 'admin.menu.footer', path: '/admin/footer', icon: Info },
    { name: 'Settings', key: 'admin.menu.settings', path: '/admin/settings', icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const t = useTranslations();
    const pathname = usePathname();
    const { user, profile, isAdmin, loading: authLoading } = useAuth();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [permissionsLoading, setPermissionsLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            if (!user) {
                setPermissionsLoading(false);
                return;
            }

            // If admin, no need to fetch specific permissions (all allowed)
            if (isAdmin) {
                setPermissionsLoading(false);
                return;
            }

            const supabase = createClient();
            const { data: access } = await supabase
                .from('content_creation_access')
                .select('access_type')
                .eq('user_id', user.id)
                .eq('status', 'approved');

            setPermissions(access?.map(a => a.access_type) || []);
            setPermissionsLoading(false);
        };

        if (!authLoading) {
            fetchPermissions();
        }
    }, [user, authLoading, isAdmin]);

    const filteredItems = menuItems.filter(item => {
        if (authLoading || permissionsLoading) return false;
        if (isAdmin) return true;

        // If explicitly 'dashboard', hide for non-admins
        if (item.path === '/admin') return false;

        const required = ACCESS_MAPPING[item.path];
        if (required) return permissions.includes(required);

        return false; // Default: Admin only
    });

    if (authLoading || permissionsLoading) return null; // Or skeleton

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-app text-primary flex flex-col min-h-screen transition-all duration-300 transform
            lg:relative lg:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl lg:shadow-none'}
        `}>
            <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-app">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.svg" alt="NipponLife" className="h-8 w-auto" />
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 rounded-xl text-secondary hover:bg-app transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 mt-6 px-4 overflow-y-auto">
                <ul className="space-y-1 pb-6">
                    {filteredItems.map((item) => {
                        // Check active state safely.
                        // Exact match for /admin, startsWith for others
                        const isActive = item.path === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.path);

                        const Icon = item.icon;

                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                                        ${isActive
                                            ? 'bg-[#D70F24] text-white shadow-lg shadow-red-500/20'
                                            : 'text-secondary hover:bg-app hover:text-primary active:scale-95'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-secondary group-hover:text-primary'}`} />
                                    <span>{t(item.key)}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-app">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-secondary hover:bg-app hover:text-primary transition-all active:scale-95 group"
                >
                    <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>{t('admin.menu.goToSite')}</span>
                </Link>
            </div>
        </aside>
    );
}
