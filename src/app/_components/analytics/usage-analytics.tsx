"use client";

import { useState } from "react";
import {
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
  AreaChart,
  Area,
} from "recharts";
import { MessageSquare, Activity, Users, Zap } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatNumber } from "~/lib/utils";

type Period = "7d" | "30d" | "90d";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

export function UsageAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: messageVolume, isLoading: volumeLoading } =
    api.analytics.messageVolume.useQuery({ period });
  const { data: userSegmentation, isLoading: segmentationLoading } =
    api.analytics.userSegmentation.useQuery();
  const { data: rateLimitingImpact, isLoading: rateLimitLoading } =
    api.analytics.rateLimitingImpact.useQuery({ period });

  if (volumeLoading || segmentationLoading || rateLimitLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Usage & Behavior Analytics
          </h2>
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

  // Process daily message data for chart
  const dailyMessageData =
    messageVolume?.dailyMessages.reduce(
      (acc, curr) => {
        const existing = acc.find((item) => item.date === curr.date);
        if (existing) {
          existing.count += curr.count;
        } else {
          acc.push({ date: curr.date, count: curr.count });
        }
        return acc;
      },
      [] as { date: string; count: number }[],
    ) ?? [];

  const segmentationData = [
    {
      name: "Free Users",
      value: userSegmentation?.freeUsers ?? 0,
      color: "#0088FE",
    },
    {
      name: "Paid Users",
      value: userSegmentation?.paidUsers ?? 0,
      color: "#00C49F",
    },
  ];

  const usageSegmentationData = [
    {
      name: "Light Users",
      value: userSegmentation?.lightUsers ?? 0,
      color: "#FFBB28",
    },
    {
      name: "Heavy Users",
      value: userSegmentation?.heavyUsers ?? 0,
      color: "#FF8042",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Usage & Behavior Analytics
        </h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="bg-background rounded-md border px-3 py-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Messages"
          value={formatNumber(messageVolume?.totalMessages ?? 0)}
          description={`In the last ${period}`}
          icon={<MessageSquare className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Free Users"
          value={formatNumber(userSegmentation?.freeUsers ?? 0)}
          description="Users without paid plans"
          icon={<Users className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Paid Users"
          value={formatNumber(userSegmentation?.paidUsers ?? 0)}
          description="Users with paid plans"
          icon={<Activity className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Rate Limit Hits"
          value={formatNumber(rateLimitingImpact?.uniqueUsersAffected ?? 0)}
          description="Users hitting daily limits"
          icon={<Zap className="text-muted-foreground h-4 w-4" />}
        />
      </div>

      {/* Message Volume Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Message Volume</CardTitle>
          <CardDescription>Total messages sent per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyMessageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Peak Usage Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Usage Hours</CardTitle>
          <CardDescription>Message distribution by hour of day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={messageVolume?.hourlyStats ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
              <YAxis />
              <Tooltip
                labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                formatter={(value) => [value, "Messages"]}
              />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Segmentation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Segmentation</CardTitle>
            <CardDescription>Free vs Paid user distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={segmentationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Segmentation</CardTitle>
            <CardDescription>Light vs Heavy user distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={usageSegmentationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usageSegmentationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limiting Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting Impact</CardTitle>
          <CardDescription>
            Analysis of users hitting daily message limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-primary text-2xl font-bold">
                {rateLimitingImpact?.uniqueUsersAffected ?? 0}
              </div>
              <p className="text-muted-foreground text-sm">Users affected</p>
            </div>
            <div className="text-center">
              <div className="text-primary text-2xl font-bold">
                {rateLimitingImpact?.totalDaysWithLimitHits ?? 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Days with limit hits
              </p>
            </div>
            <div className="text-center">
              <div className="text-primary text-2xl font-bold">
                {rateLimitingImpact?.averageMessagesOnLimitDays ?? 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Avg messages on limit days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed User Segments */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Heavy Users</CardTitle>
            <CardDescription>
              Top users by message volume (&gt;10 messages)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userSegmentation?.segments.heavy
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
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {user.totalMessages} messages
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paid Users</CardTitle>
            <CardDescription>Users with completed payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userSegmentation?.segments.paid
                .slice(0, 5)
                .map((user, index) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user.userName || "Anonymous"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {user.credits ?? 0} credits
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
