import Image from "next/image";

import appIcon from "@/app/icon.png";
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Image
      src={appIcon}
      alt=""
      width={40}
      height={40}
      sizes="40px"
      className={cn(
        "size-10 shrink-0 rounded-xl object-cover shadow-sm",
        className,
      )}
    />
  );
}
