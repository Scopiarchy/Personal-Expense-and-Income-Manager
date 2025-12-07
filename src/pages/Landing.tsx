import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  BarChart3, 
  PiggyBank, 
  CreditCard, 
  Target, 
  Shield, 
  Zap,
  CheckCircle,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Visualize your spending patterns with beautiful charts and insights"
  },
  {
    icon: PiggyBank,
    title: "Budget Tracking",
    description: "Set budgets for each category and get alerts when you're overspending"
  },
  {
    icon: Target,
    title: "Savings Goals",
    description: "Create goals for your dreams and track your progress"
  },
  {
    icon: CreditCard,
    title: "Expense Management",
    description: "Track every transaction with categories, tags, and receipts"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared with third parties"
  },
  {
    icon: Zap,
    title: "Recurring Transactions",
    description: "Automate tracking of subscriptions and regular payments"
  }
];

const Landing = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-9 w-9 sm:h-10 sm:w-10"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
              )}
            </Button>
            <Link to="/auth">
              <Button variant="ghost" className="text-sm sm:text-base px-2 sm:px-4">Sign In</Button>
            </Link>
            <Link to="/auth?signup=true" className="hidden sm:block">
              <Button className="bg-gradient-primary hover:opacity-90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Smart finance management
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Take Control of Your
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Financial Future
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track expenses, set budgets, and achieve your savings goals with our beautiful and intuitive expense tracker.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?signup=true">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 h-14 px-8 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Free 14-day trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage money
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features to help you track, budget, and grow your wealth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="border-0 bg-gradient-to-r from-primary to-secondary p-1 rounded-3xl">
            <div className="bg-background rounded-[22px] p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to take control?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users who have transformed their financial habits with ExpenseTracker.
              </p>
              <Link to="/auth?signup=true">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 h-14 px-8 text-lg">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">ExpenseTracker</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ExpenseTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
