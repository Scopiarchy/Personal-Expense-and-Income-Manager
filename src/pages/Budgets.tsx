import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: string;
}

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spending, setSpending] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: ""
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
      supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear),
      supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .eq("type", "expense"),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lt("date", `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)
    ]);

    if (budgetsRes.data) setBudgets(budgetsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    
    if (transactionsRes.data) {
      const spendingByCategory: Record<string, number> = {};
      transactionsRes.data.forEach(t => {
        if (t.category_id) {
          spendingByCategory[t.category_id] = (spendingByCategory[t.category_id] || 0) + Number(t.amount);
        }
      });
      setSpending(spendingByCategory);
    }
    
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("budgets").insert({
      user_id: user.id,
      category_id: formData.category_id || null,
      amount: parseFloat(formData.amount),
      month: currentMonth,
      year: currentYear
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Budget created!");
      setShowAddModal(false);
      setFormData({ category_id: "", amount: "" });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Budget deleted");
      fetchData();
    }
  };

  const getCategoryById = (id: string | null) => categories.find(c => c.id === id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = Object.values(spending).reduce((sum, s) => sum + s, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Budgets</h1>
            <p className="text-muted-foreground">
              {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(totalBudget - totalSpent)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budgets List */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Category Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No budgets set for this month.</p>
                <Button variant="link" onClick={() => setShowAddModal(true)}>
                  Create your first budget
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const category = getCategoryById(budget.category_id);
                  const spent = budget.category_id ? spending[budget.category_id] || 0 : totalSpent;
                  const percentage = Math.min((spent / Number(budget.amount)) * 100, 100);
                  const isOverBudget = spent > Number(budget.amount);

                  return (
                    <div key={budget.id} className="p-4 rounded-xl bg-muted/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg"
                            style={{ backgroundColor: category?.color || "#6366f1" }}
                          />
                          <div>
                            <p className="font-medium">{category?.name || "Total Budget"}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(spent)} of {formatCurrency(Number(budget.amount))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverBudget && (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Category (optional)</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary">
                Create Budget
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Budgets;
