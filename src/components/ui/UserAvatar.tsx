import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatar: string | null | undefined;
  displayName?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-8 h-8 text-base",
  sm: "w-10 h-10 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-20 h-20 text-4xl",
  xl: "w-24 h-24 text-5xl md:w-28 md:h-28",
};

/**
 * Unified avatar component that handles both emoji and URL-based avatars.
 * Use this everywhere you need to display a user avatar.
 */
const UserAvatar = ({ avatar, displayName, className, size = "md" }: UserAvatarProps) => {
  const isUrl = avatar?.startsWith("http");
  const fallback = avatar || "👤";

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center overflow-hidden bg-muted shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {isUrl ? (
        <img
          src={avatar!}
          alt={displayName || "Avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to emoji on image load error
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.textContent = "👤";
            }
          }}
        />
      ) : (
        <span className="leading-none">{fallback}</span>
      )}
    </div>
  );
};

export default UserAvatar;
