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
import { Plus, Trash2, CreditCard, Minus } from "lucide-react";
import { toast } from "sonner";

interface Loan {
  id: string;
  name: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number | null;
  emi_amount: number | null;
  due_date: number | null;
  start_date: string;
}

const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    total_amount: "",
    interest_rate: "",
    emi_amount: "",
    due_date: ""
  });
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setLoans(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const totalAmount = parseFloat(formData.total_amount);

    const { error } = await supabase.from("loans").insert({
      user_id: user.id,
      name: formData.name,
      total_amount: totalAmount,
      remaining_amount: totalAmount,
      interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
      emi_amount: formData.emi_amount ? parseFloat(formData.emi_amount) : null,
      due_date: formData.due_date ? parseInt(formData.due_date) : null
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Loan added!");
      setShowAddModal(false);
      setFormData({ name: "", total_amount: "", interest_rate: "", emi_amount: "", due_date: "" });
      fetchLoans();
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;

    const newRemaining = Math.max(0, showPaymentModal.remaining_amount - parseFloat(paymentAmount));

    const { error } = await supabase
      .from("loans")
      .update({ remaining_amount: newRemaining })
      .eq("id", showPaymentModal.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Payment recorded!");
      setShowPaymentModal(null);
      setPaymentAmount("");
      fetchLoans();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Loan deleted");
      fetchLoans();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const totalDebt = loans.reduce((sum, l) => sum + l.remaining_amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Loans & Debt</h1>
            <p className="text-muted-foreground">Track and manage your loans</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Loan
          </Button>
        </div>

        {/* Total Debt Card */}
        <Card className="border-0 shadow-soft bg-gradient-to-r from-destructive/10 to-destructive/5">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Outstanding Debt</p>
            <p className="text-3xl font-bold text-destructive">{formatCurrency(totalDebt)}</p>
          </CardContent>
        </Card>

        {/* Loans List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No loans added yet.</p>
              <Button onClick={() => setShowAddModal(true)}>
                Add your first loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const paidPercentage = ((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100;
              const isPaidOff = loan.remaining_amount <= 0;

              return (
                <Card key={loan.id} className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{loan.name}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {loan.interest_rate && <span>{loan.interest_rate}% APR</span>}
                          {loan.emi_amount && <span>EMI: {formatCurrency(loan.emi_amount)}</span>}
                          {loan.due_date && <span>Due: {loan.due_date}th</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(loan.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Paid: {formatCurrency(loan.total_amount - loan.remaining_amount)}</span>
                        <span className="text-sm text-muted-foreground">Total: {formatCurrency(loan.total_amount)}</span>
                      </div>
                      <Progress value={paidPercentage} className="h-3" />
                      <div className="flex justify-between text-sm">
                        <span className="text-destructive font-medium">
                          Remaining: {formatCurrency(loan.remaining_amount)}
                        </span>
                        <span className="text-muted-foreground">{paidPercentage.toFixed(0)}% paid</span>
                      </div>
                    </div>

                    {!isPaidOff && (
                      <Button
                        variant="outline"
                        onClick={() => setShowPaymentModal(loan)}
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                    )}
                    {isPaidOff && (
                      <div className="text-center text-success font-medium">
                        ✓ Paid Off
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Loan Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Loan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Loan Name</Label>
              <Input
                placeholder="e.g., Car Loan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interest Rate (%)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>EMI Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.emi_amount}
                  onChange={(e) => setFormData({ ...formData, emi_amount: e.target.value })}
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Due Date (day of month)</Label>
              <Input
                type="number"
                placeholder="1-31"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                min="1"
                max="31"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary">
                Add Loan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={!!showPaymentModal} onOpenChange={() => setShowPaymentModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <p className="text-muted-foreground">
              Loan: <strong>{showPaymentModal?.name}</strong>
            </p>
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPaymentModal(null)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-primary">
                Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Loans;
