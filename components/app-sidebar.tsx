"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface NavItem {
    title: string;
    icon?: LucideIcons.LucideIcon;
    isActive?: boolean;
    expanded?: boolean;
    url?: string;
    component?: React.ComponentType<any>;
    items?: NavItem[];
    onClick?: () => void;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const pathname = usePathname();
    const tenantId = pathname?.split("/")[1] || "";
    const [userData, setUserData] = useState({ name: "", email: "" });

    const navItems = React.useMemo(() => {
        const items = [
            {
                title: "Dashboard",
                icon: LucideIcons.LayoutDashboard,
                isActive: true,
                url: "/dashboard"
            },
            {
                title: "Masa Yönetimi",
                icon: LucideIcons.Table,
                isActive: true,
                url: "/tables"
            },
            {
                title: "Rezervasyonlar",
                icon: LucideIcons.Calendar,
                isActive: true,
                expanded: true,
                items: [
                    {
                        title: "Rezervasyon Listesi",
                        url: "/reservations/list"
                    },
                    {
                        title: "Rezervasyon Takvimi",
                        url: "/reservations/calendar"
                    }
                ]
            },
            {
                title: "Raporlar",
                icon: LucideIcons.BarChart,
                isActive: true,
                url: "/reports"
            }
        ];
        return items;
    }, []);

    useEffect(() => {
        const storedUserData = localStorage.getItem(`userData_${tenantId}`);
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, [tenantId]);

    const baseData = useMemo(() => ({
        user: {
            name: userData.name,
            email: userData.email,
            avatar: `${process.env.NEXT_PUBLIC_BASEPATH || ''}/images/avatar.png`,
        },
        teams: [
            {
                name: "robotPOS Enterprise",
                href: `${process.env.PROJECT_BASE_URL || ''}/franchisemanager/${tenantId}`,
                logo: `${process.env.NEXT_PUBLIC_BASEPATH || ''}/images/Audit.png`,
                plan: "Reservation Manager",
                className: "bg-blue-200",
            }
        ],
        projects: [],
    }), [userData]);

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <div className="flex flex-col space-y-2 px-4 py-2">
                    <div className="flex items-center gap-2">
                        <img 
                            src={baseData.teams[0].logo} 
                            alt="Logo" 
                            className="h-6 w-6"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{baseData.teams[0].name}</span>
                            <span className="text-xs text-muted-foreground">{baseData.teams[0].plan}</span>
                        </div>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="py-4">
                <nav className="flex flex-col gap-4">
                    <NavMain items={navItems} />
                </nav>
            </SidebarContent>
            <SidebarFooter className="py-2">
                <NavUser user={baseData.user} />
            </SidebarFooter>
        </Sidebar>
    );
}