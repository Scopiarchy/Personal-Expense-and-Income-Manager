import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PiggyBank, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  Check
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "Your financial data is encrypted and protected with industry-leading security measures."
  },
  {
    icon: Zap,
    title: "Simple & Fast",
    description: "Track expenses in seconds with our intuitive interface designed for busy people."
  },
  {
    icon: Users,
    title: "User-Centric",
    description: "Built based on feedback from thousands of users who wanted a better finance app."
  }
];

const About = () => {
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
            <Link to="/about" className="text-foreground font-medium">
              About
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth?signup=true">
              <Button className="bg-gradient-primary hover:opacity-90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About ExpenseTracker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to help millions of people take control of their finances and build better spending habits.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg mx-auto text-muted-foreground space-y-4">
            <p>
              ExpenseTracker was born from a simple frustration: why is it so hard to track where your money goes? 
              Existing solutions were either too complex with features nobody needed, or too simple to be useful.
            </p>
            <p>
              We set out to create something different - a beautiful, intuitive expense tracker that makes 
              financial management feel effortless. Something you'd actually want to use every day.
            </p>
            <p>
              Today, ExpenseTracker helps thousands of people understand their spending, reach their savings 
              goals, and build a healthier relationship with money.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">What We Believe</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-soft">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who have transformed their financial habits.
          </p>
          <Link to="/auth?signup=true">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
            <p className="text-sm text-muted-foreground">
              © 2024 ExpenseTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
