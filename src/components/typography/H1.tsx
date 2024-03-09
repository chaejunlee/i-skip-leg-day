import { type ReactNode } from "react";

export default function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
      {children}
    </h1>
  );
}
