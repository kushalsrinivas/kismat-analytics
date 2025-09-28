"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, TrendingUp, UserCheck, Clock } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatNumber } from "~/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

type Period = "7d" | "30d" | "90d" | "1y";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
        {trend && (
          <div
            className={`flex items-center text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
          >
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: userGrowth, isLoading: growthLoading } =
    api.analytics.userGrowth.useQuery({ period });
  const { data: userRetention, isLoading: retentionLoading } =
    api.analytics.userRetention.useQuery({
      period: period as "7d" | "30d" | "90d",
    });
  const { data: userEngagement, isLoading: engagementLoading } =
    api.analytics.userEngagement.useQuery({
      period: period as "7d" | "30d" | "90d",
    });
  const { data: authPatterns, isLoading: authLoading } =
    api.analytics.authenticationPatterns.useQuery();

  if (growthLoading || retentionLoading || engagementLoading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">User Analytics</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const retentionChartData =
    userRetention?.map((item) => ({
      day: `Day ${item.day}`,
      retentionRate: parseFloat(item.retentionRate),
      retainedUsers: item.retainedCount,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="bg-background rounded-md border px-3 py-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={formatNumber(userGrowth?.totalUsers ?? 0)}
          description="Registered users"
          icon={<Users className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="New Users"
          value={formatNumber(userGrowth?.newUsersInPeriod ?? 0)}
          description={`In the last ${period}`}
          icon={<TrendingUp className="text-muted-foreground h-4 w-4" />}
          trend={{
            value: `${userGrowth?.growthRate ?? 0}% growth`,
            isPositive: parseFloat(userGrowth?.growthRate ?? "0") > 0,
          }}
        />
        <MetricCard
          title="Active Users"
          value={formatNumber(userEngagement?.totalActiveUsers ?? 0)}
          description="Users with messages"
          icon={<UserCheck className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Avg Messages/User"
          value={userEngagement?.avgMessagesPerUser ?? "0"}
          description="Per active user"
          icon={<Clock className="text-muted-foreground h-4 w-4" />}
        />
      </div>

      {/* User Growth Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth?.dailySignups ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Retention */}
        <Card>
          <CardHeader>
            <CardTitle>User Retention</CardTitle>
            <CardDescription>
              Percentage of users returning after N days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={retentionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "retentionRate" ? `${value}%` : value,
                    name === "retentionRate"
                      ? "Retention Rate"
                      : "Retained Users",
                  ]}
                />
                <Bar dataKey="retentionRate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
          <CardDescription>
            Unique users sending messages each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userEngagement?.dailyActiveUsers ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Authentication Patterns */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Providers</CardTitle>
            <CardDescription>OAuth provider usage distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={authPatterns?.providerStats ?? []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="provider"
                >
                  {(authPatterns?.providerStats ?? []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Users</CardTitle>
            <CardDescription>Users with highest message counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userEngagement?.messagesPerUser
                .slice(0, 5)
                .map((user, index) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user.userName || "Anonymous"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          User ID: {user.userId}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {user.messageCount} messages
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
