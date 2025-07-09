"use client";

import Link from "next/link";

export default function Reset() {
  return (
    <div className="flex-grow flex flex-col gap-8">
      <h2 className="font-bold text-2xl">Forgot Password</h2>
      <div>
        If an account exists with this email, you should receive a message
        containing a link to reset your password shortly. If you do not receive
        one within the next 5 minutes, please re-submit your request.
      </div>
      <Link className="text-snowflake-fg-info hover:underline" href="/auth">
        Return to login
      </Link>
    </div>
  );
}
