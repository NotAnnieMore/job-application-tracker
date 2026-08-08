"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-9 text-xs",
  lg: "size-24 text-xl",
};

export function getUserInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return (
    (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}` : parts[0])
      ?.slice(0, 2)
      .toLocaleUpperCase("pt-PT") || "UT"
  );
}

function AvatarImage({
  imageUrl,
  fullName,
}: {
  imageUrl: string;
  fullName: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    // O URL pertence ao bucket público de avatares do próprio projeto Supabase.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={`Fotografia de ${fullName}`}
      className="absolute inset-0 size-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function UserAvatar({
  fullName,
  imageUrl,
  size = "sm",
  className,
}: {
  fullName: string;
  imageUrl?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 font-bold text-white ring-1 ring-slate-200",
        sizeClasses[size],
        className,
      )}
      aria-hidden={imageUrl ? undefined : true}
    >
      {getUserInitials(fullName)}
      {imageUrl ? (
        <AvatarImage key={imageUrl} imageUrl={imageUrl} fullName={fullName} />
      ) : null}
    </span>
  );
}
