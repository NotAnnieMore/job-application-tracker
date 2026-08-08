"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-8 rounded-lg text-[10px]",
  md: "size-11 rounded-xl text-xs",
  lg: "size-16 rounded-2xl text-base",
};

const colorClasses = [
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-500 text-white",
  "bg-rose-600 text-white",
  "bg-cyan-600 text-white",
];

export function getCompanyInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("pt-PT"))
      .join("") || "?"
  );
}

function getColorClass(name: string) {
  const value = Array.from(name).reduce(
    (total, character) => total + character.codePointAt(0)!,
    0,
  );

  return colorClasses[value % colorClasses.length];
}

function CompanyLogoImage({
  logoUrl,
  name,
}: {
  logoUrl: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    // O URL é validado no servidor e pode pertencer a diferentes fornecedores.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`Logótipo de ${name}`}
      className="absolute inset-0 size-full bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

export function CompanyLogo({
  name,
  logoUrl,
  size = "md",
  className,
}: {
  name: string;
  logoUrl?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden font-bold ring-1 ring-black/5",
        sizeClasses[size],
        getColorClass(name),
        className,
      )}
      aria-hidden={logoUrl ? undefined : true}
    >
      {getCompanyInitials(name)}
      {logoUrl ? (
        <CompanyLogoImage key={logoUrl} logoUrl={logoUrl} name={name} />
      ) : null}
    </span>
  );
}
