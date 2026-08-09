"use client";

import { ChevronRight, LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

export function ApplicationLinkFeedback() {
  const { pending } = useLinkStatus();

  return (
    <span className="relative inline-flex size-4 shrink-0" aria-hidden="true">
      <ChevronRight
        className={cn(
          "absolute inset-0 size-4 transition-opacity",
          pending ? "opacity-0" : "opacity-100",
        )}
      />
      <LoaderCircle
        className={cn(
          "absolute inset-0 size-4 animate-spin transition-opacity motion-reduce:animate-none",
          pending ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}
