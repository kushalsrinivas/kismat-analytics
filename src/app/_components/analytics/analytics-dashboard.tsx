"use client";

import { useState } from "react";
import { Users, Activity, DollarSign, Server } from "lucide-react";
import { UserAnalytics } from "./user-analytics";
import { UsageAnalytics } from "./usage-analytics";
import { RevenueAnalytics } from "./revenue-analytics";
import { OperationalAnalytics } from "./operational-analytics";
import { Card, CardContent } from "../ui/card";
import { cn } from "~/lib/utils";

type DashboardTab = "users" | "usage" | "revenue" | "operations";

interface TabButtonProps {
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (tab: DashboardTab) => void;
}

function TabButton({ id, label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("users");

  const tabs: Array<{
    id: DashboardTab;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
  }> = [
    {
      id: "users",
      label: "User Analytics",
      icon: <Users className="h-4 w-4" />,
      component: <UserAnalytics />,
    },
    {
      id: "usage",
      label: "Usage & Behavior",
      icon: <Activity className="h-4 w-4" />,
      component: <UsageAnalytics />,
    },
    {
      id: "revenue",
      label: "Revenue Analytics",
      icon: <DollarSign className="h-4 w-4" />,
      component: <RevenueAnalytics />,
    },
    {
      id: "operations",
      label: "Operational Analytics",
      icon: <Server className="h-4 w-4" />,
      component: <OperationalAnalytics />,
    },
  ];

  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into user behavior, revenue, and system
            performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Tab Content */}
        <div className="transition-all duration-300">{activeComponent}</div>
      </div>
    </div>
  );
}
