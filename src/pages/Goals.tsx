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
import { Plus, Trash2, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number | null;
  deadline: string | null;
  color: string | null;
}

const colorOptions = ["#10b981", "#06b6d4", "#8b5cf6", "#f97316", "#ec4899", "#3b82f6"];

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    deadline: "",
    color: "#10b981"
  });
  const [contributeAmount, setContributeAmount] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setGoals(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline || null,
      color: formData.color,
      current_amount: 0
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Goal created!");
      setShowAddModal(false);
      setFormData({ name: "", target_amount: "", deadline: "", color: "#10b981" });
      fetchGoals();
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContributeModal) return;

    const newAmount = (showContributeModal.current_amount || 0) + parseFloat(contributeAmount);

    const { error } = await supabase
      .from("goals")
      .update({ current_amount: newAmount })
      .eq("id", showContributeModal.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Contribution added!");
      setShowContributeModal(null);
      setContributeAmount("");
      fetchGoals();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Goal deleted");
      fetchGoals();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Savings Goals</h1>
            <p className="text-muted-foreground">Track your progress towards financial goals</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Goals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No savings goals yet.</p>
              <Button onClick={() => setShowAddModal(true)}>
                Create your first goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const percentage = Math.min(((goal.current_amount || 0) / goal.target_amount) * 100, 100);
              const isComplete = (goal.current_amount || 0) >= goal.target_amount;

              return (
                <Card key={goal.id} className="border-0 shadow-soft overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: goal.color || "#10b981" }} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        {goal.deadline && (
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(goal.current_amount || 0)}</span>
                        <span className="text-muted-foreground">{formatCurrency(goal.target_amount)}</span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                      <p className="text-sm text-muted-foreground text-center">
                        {percentage.toFixed(0)}% complete
                      </p>
                    </div>

                    {!isComplete && (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setShowContributeModal(goal)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Add Contribution
                      </Button>
                    )}
                    {isComplete && (
                      <div className="text-center text-success font-medium">
                        🎉 Goal Achieved!
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g., Emergency Fund"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Target Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Deadline (optional)</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
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

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary">
                Create Goal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute Modal */}
      <Dialog open={!!showContributeModal} onOpenChange={() => setShowContributeModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4">
            <p className="text-muted-foreground">
              Adding to: <strong>{showContributeModal?.name}</strong>
            </p>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowContributeModal(null)}>
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

export default Goals;
