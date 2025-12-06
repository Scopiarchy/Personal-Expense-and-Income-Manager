import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Trash2, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";
import { recurringTransactionSchema, getValidationError } from "@/lib/validations";

interface RecurringTransaction {
  id: string;
  description: string | null;
  amount: number;
  type: string;
  frequency: string;
  next_date: string;
  is_active: boolean | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: string;
}

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" }
] as const;

const Recurring = () => {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    next_date: new Date().toISOString().split("T")[0],
    category_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [recurringRes, categoriesRes] = await Promise.all([
      supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("next_date", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
    ]);

    if (recurringRes.data) setRecurring(recurringRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const result = recurringTransactionSchema.safeParse({
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      type: formData.type,
      frequency: formData.frequency,
      next_date: formData.next_date,
      category_id: formData.category_id || null
    });
    
    if (!result.success) {
      toast.error(getValidationError(result.error));
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("recurring_transactions").insert({
      user_id: user.id,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      type: formData.type,
      frequency: formData.frequency,
      next_date: formData.next_date,
      category_id: formData.category_id || null,
      is_active: true
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Recurring transaction added!");
      setShowAddModal(false);
      setFormData({
        description: "",
        amount: "",
        type: "expense",
        frequency: "monthly",
        next_date: new Date().toISOString().split("T")[0],
        category_id: ""
      });
      fetchData();
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("recurring_transactions")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Recurring transaction deleted");
      fetchData();
    }
  };

  const getCategoryById = (id: string | null) => categories.find(c => c.id === id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Recurring Transactions</h1>
            <p className="text-muted-foreground">Manage your subscriptions and regular payments</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Recurring
          </Button>
        </div>

        {/* List */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>All Recurring Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : recurring.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recurring transactions yet.</p>
                <Button variant="link" onClick={() => setShowAddModal(true)}>
                  Add your first recurring transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recurring.map((item) => {
                  const category = getCategoryById(item.category_id);
                  const isIncome = item.type === "income";

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-xl bg-muted/50 ${
                        !item.is_active ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: category?.color + "20" || "#6366f120" }}
                        >
                          <RefreshCw className={`h-5 w-5 ${isIncome ? "text-success" : "text-destructive"}`} />
                        </div>
                        <div>
                          <p className="font-medium">{item.description || category?.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className="capitalize">{item.frequency}</span>
                            <span>• Next: {new Date(item.next_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-bold ${isIncome ? "text-success" : "text-destructive"}`}>
                          {isIncome ? "+" : "-"}{formatCurrency(Number(item.amount))}
                        </p>
                        <Switch
                          checked={item.is_active ?? true}
                          onCheckedChange={() => handleToggle(item.id, item.is_active ?? true)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
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
            <DialogTitle>Add Recurring Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.type === "expense" ? "default" : "outline"}
                className={formData.type === "expense" ? "bg-destructive hover:bg-destructive/90" : ""}
                onClick={() => setFormData({ ...formData, type: "expense", category_id: "" })}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                className={formData.type === "income" ? "bg-success hover:bg-success/90" : ""}
                onClick={() => setFormData({ ...formData, type: "income", category_id: "" })}
              >
                Income
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g., Netflix Subscription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
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

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Next Date</Label>
              <Input
                type="date"
                value={formData.next_date}
                onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary">
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Recurring;