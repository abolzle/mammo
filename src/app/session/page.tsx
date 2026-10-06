"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SessionPlayer } from "@/components/session-player";

function Inner() {
  const params = useSearchParams();
  const id = params.get("id");
  if (!id) return <p>No session selected.</p>;
  return <SessionPlayer sessionId={id} />;
}

export default function SessionPage() {
  return (
    <Suspense fallback={<p>Loading session…</p>}>
      <Inner />
    </Suspense>
  );
}
