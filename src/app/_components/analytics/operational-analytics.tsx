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
} from "recharts";
import { Activity, AlertTriangle, Server, Zap } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatNumber, formatPercentage } from "~/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

type Period = "7d" | "30d" | "90d";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  status?: "good" | "warning" | "error";
}

function MetricCard({
  title,
  value,
  description,
  icon,
  status = "good",
}: MetricCardProps) {
  const statusColors = {
    good: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${statusColors[status]}`}>
          {value}
        </div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

export function OperationalAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: systemHealth, isLoading: healthLoading } =
    api.analytics.systemHealth.useQuery({ period });
  const { data: rateLimitingImpact, isLoading: rateLimitLoading } =
    api.analytics.rateLimitingImpact.useQuery({ period });

  if (healthLoading || rateLimitLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Operational Analytics
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

  const overallSuccessRate =
    systemHealth?.apiStats && systemHealth.apiStats.length > 0
      ? systemHealth.apiStats.reduce(
          (acc, stat) => acc + parseFloat(stat.successRate),
          0,
        ) / systemHealth.apiStats.length
      : 0;

  const totalErrors =
    systemHealth?.errorPatterns.reduce((sum, error) => sum + error.count, 0) ??
    0;

  const getHealthStatus = (successRate: number) => {
    if (successRate >= 99) return "good";
    if (successRate >= 95) return "warning";
    return "error";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Operational Analytics
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
          title="Overall Success Rate"
          value={formatPercentage(overallSuccessRate)}
          description="API requests success rate"
          icon={<Activity className="text-muted-foreground h-4 w-4" />}
          status={getHealthStatus(overallSuccessRate)}
        />
        <MetricCard
          title="Total Requests"
          value={formatNumber(systemHealth?.totalRequests ?? 0)}
          description={`In the last ${period}`}
          icon={<Server className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Total Errors"
          value={formatNumber(totalErrors)}
          description="Failed requests"
          icon={<AlertTriangle className="text-muted-foreground h-4 w-4" />}
          status={
            totalErrors > 100 ? "error" : totalErrors > 50 ? "warning" : "good"
          }
        />
        <MetricCard
          title="Rate Limit Hits"
          value={formatNumber(rateLimitingImpact?.totalDaysWithLimitHits ?? 0)}
          description="Days with limit violations"
          icon={<Zap className="text-muted-foreground h-4 w-4" />}
          status={
            (rateLimitingImpact?.totalDaysWithLimitHits ?? 0) > 10
              ? "error"
              : "good"
          }
        />
      </div>

      {/* API Health by Action */}
      <Card>
        <CardHeader>
          <CardTitle>API Health by Action</CardTitle>
          <CardDescription>
            Success rates for different API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={systemHealth?.apiStats ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="action"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value, name) => [
                  `${value}%`,
                  name === "successRate" ? "Success Rate" : name,
                ]}
              />
              <Bar dataKey="successRate" fill="#8884d8" name="successRate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Error Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Top Error Patterns</CardTitle>
          <CardDescription>
            Most common errors and their frequency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth?.errorPatterns.slice(0, 10).map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-medium text-red-600">
                    {error.statusCode}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {error.error || "Unknown Error"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Status Code: {error.statusCode}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {error.count} occurrences
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Volume Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Volume by Action</CardTitle>
            <CardDescription>
              Distribution of API calls by endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={systemHealth?.apiStats ?? []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ action, totalRequests }) =>
                    `${action}: ${totalRequests}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalRequests"
                  nameKey="action"
                >
                  {(systemHealth?.apiStats ?? []).map((entry, index) => (
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

        <Card>
          <CardHeader>
            <CardTitle>System Health Summary</CardTitle>
            <CardDescription>
              Overall system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                <span className="text-sm font-medium text-green-800">
                  Healthy Endpoints
                </span>
                <span className="text-sm font-bold text-green-600">
                  {systemHealth?.apiStats.filter(
                    (stat) => parseFloat(stat.successRate) >= 99,
                  ).length ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
                <span className="text-sm font-medium text-yellow-800">
                  Warning Endpoints
                </span>
                <span className="text-sm font-bold text-yellow-600">
                  {systemHealth?.apiStats.filter((stat) => {
                    const rate = parseFloat(stat.successRate);
                    return rate >= 95 && rate < 99;
                  }).length ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                <span className="text-sm font-medium text-red-800">
                  Critical Endpoints
                </span>
                <span className="text-sm font-bold text-red-600">
                  {systemHealth?.apiStats.filter(
                    (stat) => parseFloat(stat.successRate) < 95,
                  ).length ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limiting Details */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting Analysis</CardTitle>
          <CardDescription>
            Impact of daily message limits on user behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {rateLimitingImpact?.uniqueUsersAffected ?? 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Users affected by limits
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {rateLimitingImpact?.totalDaysWithLimitHits ?? 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Days with limit violations
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {rateLimitingImpact?.averageMessagesOnLimitDays ?? 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Avg messages on limit days
              </p>
            </div>
          </div>

          {rateLimitingImpact?.dailyLimitHits &&
            rateLimitingImpact.dailyLimitHits.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-4 text-lg font-semibold">
                  Recent Limit Violations
                </h4>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {rateLimitingImpact.dailyLimitHits
                    .slice(0, 10)
                    .map((hit, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded bg-gray-50 p-2"
                      >
                        <span className="text-sm">User: {hit.userId}</span>
                        <span className="text-sm">Date: {hit.date}</span>
                        <span className="text-sm font-medium">
                          {hit.messageCount} messages
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key operational recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallSuccessRate < 95 && (
              <div className="flex items-start space-x-3 rounded-lg bg-red-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-red-800">
                    Critical: Low Success Rate
                  </h4>
                  <p className="text-sm text-red-600">
                    Overall API success rate is{" "}
                    {formatPercentage(overallSuccessRate)}. Investigate failing
                    endpoints immediately.
                  </p>
                </div>
              </div>
            )}

            {totalErrors > 100 && (
              <div className="flex items-start space-x-3 rounded-lg bg-yellow-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-500" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Warning: High Error Count
                  </h4>
                  <p className="text-sm text-yellow-600">
                    {totalErrors} errors detected in the last {period}. Review
                    error patterns for optimization opportunities.
                  </p>
                </div>
              </div>
            )}

            {(rateLimitingImpact?.uniqueUsersAffected ?? 0) > 10 && (
              <div className="flex items-start space-x-3 rounded-lg bg-blue-50 p-4">
                <Zap className="mt-0.5 h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-blue-800">
                    Info: Rate Limiting Impact
                  </h4>
                  <p className="text-sm text-blue-600">
                    {rateLimitingImpact?.uniqueUsersAffected} users hit rate
                    limits. Consider adjusting limits or promoting upgrades.
                  </p>
                </div>
              </div>
            )}

            {overallSuccessRate >= 99 && totalErrors < 50 && (
              <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-4">
                <Activity className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-green-800">
                    Excellent: System Running Smoothly
                  </h4>
                  <p className="text-sm text-green-600">
                    All systems are operating within optimal parameters. Success
                    rate is {formatPercentage(overallSuccessRate)}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
