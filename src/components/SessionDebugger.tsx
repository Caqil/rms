"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionDebugger() {
  const { data: session } = useSession();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Session Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
