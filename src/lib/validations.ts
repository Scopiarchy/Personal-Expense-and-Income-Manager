import { z } from "zod";

// Auth validations
export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password must be less than 72 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
});

// Transaction validations
export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .positive("Amount must be positive")
    .max(999999999.99, "Amount is too large"),
  category_id: z.string().uuid("Please select a category").optional().nullable(),
  date: z.string().min(1, "Date is required"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  payment_method: z.string().max(50).optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

// Category validations
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  type: z.enum(["income", "expense"]),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Please select a valid color"),
  icon: z.string().max(50).optional(),
});

// Goal validations
export const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Goal name is required")
    .max(100, "Goal name must be less than 100 characters"),
  target_amount: z
    .number({ invalid_type_error: "Target amount is required" })
    .positive("Target amount must be positive")
    .max(999999999.99, "Amount is too large"),
  current_amount: z
    .number()
    .min(0, "Current amount cannot be negative")
    .max(999999999.99, "Amount is too large")
    .optional(),
  deadline: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
});

// Loan validations
export const loanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Loan name is required")
    .max(100, "Loan name must be less than 100 characters"),
  total_amount: z
    .number({ invalid_type_error: "Total amount is required" })
    .positive("Total amount must be positive")
    .max(999999999.99, "Amount is too large"),
  remaining_amount: z
    .number({ invalid_type_error: "Remaining amount is required" })
    .min(0, "Remaining amount cannot be negative")
    .max(999999999.99, "Amount is too large"),
  interest_rate: z
    .number()
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%")
    .optional()
    .nullable(),
  emi_amount: z
    .number()
    .positive("EMI amount must be positive")
    .max(999999999.99, "Amount is too large")
    .optional()
    .nullable(),
  due_date: z
    .number()
    .int()
    .min(1, "Due date must be between 1-31")
    .max(31, "Due date must be between 1-31")
    .optional()
    .nullable(),
  start_date: z.string().optional(),
});

// Budget validations
export const budgetSchema = z.object({
  category_id: z.string().uuid("Please select a category"),
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .positive("Amount must be positive")
    .max(999999999.99, "Amount is too large"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

// Recurring transaction validations
export const recurringTransactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .positive("Amount must be positive")
    .max(999999999.99, "Amount is too large"),
  type: z.enum(["income", "expense"]),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  next_date: z.string().min(1, "Next date is required"),
  category_id: z.string().uuid().optional().nullable(),
});

// Profile validations
export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(100, "Full name must be less than 100 characters")
    .optional()
    .nullable(),
  currency: z.string().max(10).optional().nullable(),
  theme: z.enum(["light", "dark", "system"]).optional().nullable(),
});

// Helper function to get error message from zod error
export const getValidationError = (error: z.ZodError): string => {
  return error.errors[0]?.message || "Validation error";
};
