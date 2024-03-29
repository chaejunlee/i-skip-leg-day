import { type ReactNode } from "react";

export default function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}
