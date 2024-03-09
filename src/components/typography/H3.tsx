import { type ReactNode } from "react";

export default function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h3>
  );
}
