import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-semibold">Sign in</h1>
        <p className="text-center text-sm text-muted-foreground">
          Access your Property Passport account
        </p>

        <LoginForm />
      </div>
    </div>
  );
}

