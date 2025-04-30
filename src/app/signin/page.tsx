"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authenticate } from "../actions/auth";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">Login</h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Access your workspace
        </p>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirectTo" value="/dashboard" />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@domain.com"
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>
            <a href="#" className="text-indigo-600 hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>

          {errorMessage && (
            <p className="mt-2 text-sm text-red-600 text-center">{errorMessage}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
