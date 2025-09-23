// app/manager/layout.tsx
import { PollErrorBoundary } from "@/app/components/PollErrorBoundary";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PollErrorBoundary>{children}</PollErrorBoundary>;
}
