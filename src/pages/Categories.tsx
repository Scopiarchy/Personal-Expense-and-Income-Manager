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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    type: "expense",
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name: formData.name,
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Organize your transactions with categories</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Income Categories */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-success">Income Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : incomeCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No income categories yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    {category.user_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-destructive">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : expenseCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No expense categories yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 rounded-xl bg-muted/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {category.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                    {category.budget_limit && category.budget_limit > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Budget</span>
                          <span>${category.budget_limit}</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      formData.color === color ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            {formData.type === "expense" && (
              <div className="space-y-2">
                <Label>Budget Limit (optional)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.budget_limit}
                  onChange={(e) => setFormData({ ...formData, budget_limit: e.target.value })}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary">
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
