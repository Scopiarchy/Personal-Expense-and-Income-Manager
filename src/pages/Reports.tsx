import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: string;
}

const Reports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [transactionsRes, categoriesRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", sixMonthsAgo.toISOString().split("T")[0])
        .order("date", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
    ]);

    if (transactionsRes.data) setTransactions(transactionsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  // Monthly data for bar chart
  const monthlyData = transactions.reduce((acc: any[], t) => {
    const month = new Date(t.date).toLocaleDateString("en-US", { month: "short" });
    const existing = acc.find(m => m.month === month);
    if (existing) {
      if (t.type === "income") existing.income += Number(t.amount);
      else existing.expense += Number(t.amount);
    } else {
      acc.push({
        month,
        income: t.type === "income" ? Number(t.amount) : 0,
        expense: t.type === "expense" ? Number(t.amount) : 0
      });
    }
    return acc;
  }, []);

  // Category breakdown for pie chart
  const categoryData = transactions
    .filter(t => t.type === "expense" && t.category_id)
    .reduce((acc: any[], t) => {
      const category = categories.find(c => c.id === t.category_id);
      if (!category) return acc;
      const existing = acc.find(c => c.name === category.name);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        acc.push({
          name: category.name,
          value: Number(t.amount),
          color: category.color
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Trend data for line chart
  const trendData = transactions.reduce((acc: any[], t) => {
    const date = t.date;
    const existing = acc.find(d => d.date === date);
    if (existing) {
      if (t.type === "income") existing.income += Number(t.amount);
      else existing.expense += Number(t.amount);
    } else {
      acc.push({
        date,
        income: t.type === "income" ? Number(t.amount) : 0,
        expense: t.type === "expense" ? Number(t.amount) : 0
      });
    }
    return acc;
  }, []).slice(-30);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

  const exportCSV = () => {
    const headers = ["Date", "Type", "Amount", "Category"];
    const rows = transactions.map(t => {
      const category = categories.find(c => c.id === t.category_id);
      return [t.date, t.type, t.amount, category?.name || ""];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Financial insights and analytics</p>
          </div>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income (6 months)</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses (6 months)</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Bar Chart */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              ) : monthlyData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown Pie Chart */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              ) : categoryData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="h-12 w-12 opacity-50" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trend Line Chart */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Spending Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            ) : trendData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
