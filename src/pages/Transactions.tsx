import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Edit
} from "lucide-react";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
  category_id: string | null;
  payment_method: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [transactionsRes, categoriesRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
    ]);

    if (transactionsRes.data) setTransactions(transactionsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Transaction deleted");
      fetchData();
    }
  };

  const getCategoryById = (id: string | null) => {
    return categories.find(c => c.id === id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryById(t.category_id)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">Manage all your income and expenses</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "income", "expense"].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className={filterType === type ? "bg-gradient-primary" : ""}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const category = getCategoryById(transaction.category_id);
                  const isIncome = transaction.type === "income";
                  
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: category?.color + "20" }}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="h-6 w-6 text-success" />
                          ) : (
                            <ArrowDownRight className="h-6 w-6 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || category?.name || "Transaction"}</p>
                          <p className="text-sm text-muted-foreground">
                            {category?.name} • {new Date(transaction.date).toLocaleDateString()}
                            {transaction.payment_method && ` • ${transaction.payment_method}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-bold text-lg ${isIncome ? "text-success" : "text-destructive"}`}>
                          {isIncome ? "+" : "-"}{formatCurrency(Number(transaction.amount))}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <AddTransactionModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
        categories={categories}
      />
    </DashboardLayout>
  );
};

export default Transactions;
