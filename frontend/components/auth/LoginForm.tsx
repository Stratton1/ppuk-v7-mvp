"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'login-client',
        hypothesisId: 'H-client-submit',
        location: 'components/auth/LoginForm.tsx:submit:start',
        message: 'Client submit invoked',
        data: { emailDomain: email.split('@')[1] ?? null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'login-client',
        hypothesisId: 'H-client-submit-result',
        location: 'components/auth/LoginForm.tsx:submit:after',
        message: 'Client submit result',
        data: { error: error?.message ?? null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full rounded border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full rounded border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="w-full rounded bg-black py-2 text-white hover:bg-gray-700"
      >
        Sign In
      </button>
    </form>
  );
}

