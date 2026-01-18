"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { registerSchema, RegisterFormData } from "@/lib/validations";
import { register as registerUser } from "@/app/actions/auth-actions";
import Link from "next/link";
import { Loader2, Mail, Lock, User } from "lucide-react";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: RegisterFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    startTransition(async () => {
      const result = await registerUser(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white">
      <CardContent className="p-8 pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                disabled={isPending}
                className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 font-medium ml-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                disabled={isPending}
                className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-medium ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                {...register("password")}
                disabled={isPending}
                className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                disabled={isPending}
                className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-base font-medium shadow-lg shadow-indigo-200 mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
