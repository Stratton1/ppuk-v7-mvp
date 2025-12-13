import Link from "next/link";
import { LogIn } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/server-public";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createPublicClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-4 py-10">
      <AppPageHeader
        title="Sign in"
        description="Access your Property Passport account to manage your properties."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sign in" }]}
      />

      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
