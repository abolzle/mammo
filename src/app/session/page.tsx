"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SessionPlayer } from "@/components/session-player";

function Inner() {
  const params = useSearchParams();
  const [id, setId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const fromRouter = params.get("id");
    const fromLocation = new URLSearchParams(window.location.search).get("id");
    setId(fromRouter || fromLocation);
  }, [params]);

  if (id === undefined) return <p>Loading session…</p>;
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
