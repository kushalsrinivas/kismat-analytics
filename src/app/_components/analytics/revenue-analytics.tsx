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
  AreaChart,
  Area,
} from "recharts";
import { DollarSign, TrendingUp, CreditCard, Target } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatCurrency, formatNumber, formatPercentage } from "~/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

type Period = "30d" | "90d" | "1y";

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

export function RevenueAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: conversionFunnel, isLoading: funnelLoading } =
    api.analytics.conversionFunnel.useQuery({ period });
  const { data: revenueMetrics, isLoading: revenueLoading } =
    api.analytics.revenueMetrics.useQuery({ period });
  const { data: paymentAnalysis, isLoading: paymentLoading } =
    api.analytics.paymentAnalysis.useQuery({ period });

  if (funnelLoading || revenueLoading || paymentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Revenue Analytics
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

  const funnelData = [
    {
      name: "Registrations",
      value: conversionFunnel?.registrations ?? 0,
      fill: "#8884d8",
    },
    {
      name: "First Message",
      value: conversionFunnel?.firstMessage ?? 0,
      fill: "#82ca9d",
    },
    {
      name: "Payment Intent",
      value: conversionFunnel?.paymentIntent ?? 0,
      fill: "#ffc658",
    },
    {
      name: "Completed Payment",
      value: conversionFunnel?.completedPayment ?? 0,
      fill: "#ff7300",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="bg-background rounded-md border px-3 py-2"
        >
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(
            parseFloat(revenueMetrics?.totalRevenue ?? "0"),
          )}
          description={`In the last ${period}`}
          icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="ARPU"
          value={formatCurrency(parseFloat(revenueMetrics?.arpu ?? "0"))}
          description="Average Revenue Per User"
          icon={<TrendingUp className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Paying Users"
          value={formatNumber(revenueMetrics?.uniquePayingUsers ?? 0)}
          description="Users with successful payments"
          icon={<CreditCard className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={formatPercentage(
            parseFloat(
              conversionFunnel?.conversionRates.overallConversion ?? "0",
            ),
          )}
          description="Registration to payment"
          icon={<Target className="text-muted-foreground h-4 w-4" />}
        />
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            User journey from registration to payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              {funnelData.map((step, index) => (
                <div
                  key={step.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: step.fill }}
                    />
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatNumber(step.value)}
                    </div>
                    {index > 0 && (
                      <div className="text-muted-foreground text-xs">
                        {formatPercentage(
                          parseFloat(
                            Object.values(
                              conversionFunnel?.conversionRates ?? {},
                            )[index - 1] ?? "0",
                          ),
                        )}{" "}
                        from previous
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Revenue growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueMetrics?.monthlyRevenue ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(parseFloat(value as string)),
                  "Revenue",
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenueInCurrency"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Success Rates by Tier</CardTitle>
            <CardDescription>
              Success rates for different payment tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentAnalysis?.tierStats.map((tier, index) => (
                <div
                  key={tier.tier}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <span className="font-medium capitalize">
                        {tier.tier}
                      </span>
                      <p className="text-muted-foreground text-xs">
                        {tier.successful}/{tier.totalAttempts} attempts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatPercentage(parseFloat(tier.successRate))}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Success rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Processing Metrics</CardTitle>
            <CardDescription>
              Processing time and volume analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-primary text-2xl font-bold">
                  {paymentAnalysis?.averageProcessingTime ?? 0} min
                </div>
                <p className="text-muted-foreground text-sm">
                  Avg processing time
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-primary text-2xl font-bold">
                  {revenueMetrics?.monthlyRevenue.reduce(
                    (sum, month) => sum + (month.transactions ?? 0),
                    0,
                  ) ?? 0}
                </div>
                <p className="text-muted-foreground text-sm">
                  Total transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Transaction Volume</CardTitle>
          <CardDescription>Number of transactions per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueMetrics?.monthlyRevenue ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Rate Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Conversion Rates</CardTitle>
          <CardDescription>Step-by-step conversion analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {formatPercentage(
                  parseFloat(
                    conversionFunnel?.conversionRates
                      .registrationToFirstMessage ?? "0",
                  ),
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Registration → First Message
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {formatPercentage(
                  parseFloat(
                    conversionFunnel?.conversionRates
                      .firstMessageToPaymentIntent ?? "0",
                  ),
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                First Message → Payment Intent
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {formatPercentage(
                  parseFloat(
                    conversionFunnel?.conversionRates
                      .paymentIntentToCompletion ?? "0",
                  ),
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Payment Intent → Completion
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-primary text-2xl font-bold">
                {formatPercentage(
                  parseFloat(
                    conversionFunnel?.conversionRates.overallConversion ?? "0",
                  ),
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Overall Conversion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
