import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Save, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string | null;
  theme: string | null;
}

const currencies = [
  { value: "LKR", label: "LKR (Rs) - Sri Lankan Rupee" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "INR", label: "INR (₹) - Indian Rupee" },
  { value: "JPY", label: "JPY (¥) - Japanese Yen" },
  { value: "CNY", label: "CNY (¥) - Chinese Yuan" },
  { value: "AUD", label: "AUD ($) - Australian Dollar" },
  { value: "CAD", label: "CAD ($) - Canadian Dollar" },
  { value: "CHF", label: "CHF (Fr) - Swiss Franc" },
  { value: "SGD", label: "SGD ($) - Singapore Dollar" },
  { value: "AED", label: "AED (د.إ) - UAE Dirham" },
  { value: "SAR", label: "SAR (﷼) - Saudi Riyal" },
  { value: "MYR", label: "MYR (RM) - Malaysian Ringgit" },
  { value: "THB", label: "THB (฿) - Thai Baht" },
  { value: "KRW", label: "KRW (₩) - South Korean Won" },
  { value: "BRL", label: "BRL (R$) - Brazilian Real" },
  { value: "ZAR", label: "ZAR (R) - South African Rand" },
  { value: "NZD", label: "NZD ($) - New Zealand Dollar" },
  { value: "PKR", label: "PKR (₨) - Pakistani Rupee" },
  { value: "BDT", label: "BDT (৳) - Bangladeshi Taka" },
];

const Profile = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    currency: "USD",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        currency: data.currency || "USD",
      });
      // Apply saved theme
      if (data.theme) {
        setTheme(data.theme as "light" | "dark" | "system");
      }
    }
    setLoading(false);
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (profile) {
      await supabase
        .from("profiles")
        .update({ theme: newTheme })
        .eq("id", profile.id);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        currency: formData.currency,
        theme: theme
      })
      .eq("id", profile.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded-2xl" />
            <div className="h-64 bg-muted animate-pulse rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Avatar Section */}
            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                      {formData.full_name ? getInitials(formData.full_name) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-xl text-foreground">{formData.full_name || "User"}</h3>
                    <p className="text-muted-foreground">{email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Selection */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground">Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      theme === "light" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <Sun className={`h-6 w-6 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${theme === "light" ? "text-primary" : "text-foreground"}`}>Light</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      theme === "dark" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <Moon className={`h-6 w-6 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-primary" : "text-foreground"}`}>Dark</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      theme === "system" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <Monitor className={`h-6 w-6 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${theme === "system" ? "text-primary" : "text-foreground"}`}>System</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10 bg-background border-border text-foreground"
                      placeholder="Your name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10 bg-muted border-border text-muted-foreground"
                      value={email}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-soft"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
