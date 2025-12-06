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
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { categorySchema, getValidationError } from "@/lib/validations";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: string;
  budget_limit: number | null;
  user_id: string | null;
}

const colorOptions = [
  "#10b981", "#06b6d4", "#8b5cf6", "#6366f1", "#f97316",
  "#3b82f6", "#ec4899", "#a855f7", "#eab308", "#ef4444",
  "#14b8a6", "#0ea5e9", "#22c55e", "#64748b"
];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#10b981",
    budget_limit: ""
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},is_default.eq.true`)
      .order("type", { ascending: true });

    if (data) setCategories(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const result = categorySchema.safeParse({
      name: formData.name,
      type: formData.type,
      color: formData.color,
      icon: "circle"
    });
    
    if (!result.success) {
      toast.error(getValidationError(result.error));
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name: formData.name.trim(),
      type: formData.type,
      color: formData.color,
      icon: "circle",
      budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : null
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Category added!");
      setShowAddModal(false);
      setFormData({ name: "", type: "expense", color: "#10b981", budget_limit: "" });
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Category deleted");
      fetchCategories();
    }
  };

  const incomeCategories = categories.filter(c => c.type === "income");
  const expenseCategories = categories.filter(c => c.type === "expense");

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="group p-4 rounded-2xl bg-card border border-border hover:shadow-soft transition-all duration-300 card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: category.color + '20' }}
          >
            <div
              className="w-6 h-6 rounded-lg"
              style={{ backgroundColor: category.color }}
            />
          </div>
          <div>
            <span className="font-semibold text-card-foreground">{category.name}</span>
            <p className="text-xs text-muted-foreground capitalize">{category.type}</p>
          </div>
        </div>
        {category.user_id && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {category.budget_limit && category.budget_limit > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Limit</span>
            <span className="font-medium text-card-foreground">${category.budget_limit.toLocaleString()}</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground mt-1">Organize your transactions with custom categories</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90 shadow-soft text-white"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-0 shadow-soft bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Income Categories</p>
                  <p className="text-2xl font-bold text-foreground">{incomeCategories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft bg-gradient-to-br from-destructive/10 to-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expense Categories</p>
                  <p className="text-2xl font-bold text-foreground">{expenseCategories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Categories */}
        <Card className="border-0 shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-xl text-foreground">Income Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : incomeCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No income categories yet. Add your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {incomeCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border-0 shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-xl text-foreground">Expense Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : expenseCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expense categories yet. Add your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {expenseCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Name</Label>
              <Input
                placeholder="Category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={50}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                      formData.color === color 
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" 
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            {formData.type === "expense" && (
              <div className="space-y-2">
                <Label className="text-foreground">Budget Limit (optional)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.budget_limit}
                  onChange={(e) => setFormData({ ...formData, budget_limit: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-border text-foreground hover:bg-muted" 
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary text-white hover:opacity-90">
                Add Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Categories;