import React from "react";
import { Smile, Sparkles, GraduationCap, CircleUser, UserCheck, Activity } from "lucide-react";

export interface AvatarIconProps {
  avatar: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AvatarIcon({ avatar, size = 20, className = "", style = {} }: AvatarIconProps) {
  // If it's a URL (starts with http, /, data:), render it as a premium cropped image
  if (
    avatar &&
    (avatar.startsWith("http://") ||
      avatar.startsWith("https://") ||
      avatar.startsWith("/") ||
      avatar.startsWith("data:image/"))
  ) {
    return (
      <img
        src={avatar}
        alt="User avatar"
        className={className}
        style={{
          width: `${size * 1.8}px`,
          height: `${size * 1.8}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
          display: "inline-block",
          verticalAlign: "middle",
          ...style
        }}
      />
    );
  }

  // Otherwise, map text/emoji identifiers to Lucide icons and harmonized color palettes
  let IconComponent = CircleUser;
  let bgColor = "var(--bg-cream)";
  let iconColor = "var(--color-primary)";

  const cleanAvatar = (avatar || "").trim();

  if (cleanAvatar === "🦊" || cleanAvatar === "fox") {
    IconComponent = Smile;
    bgColor = "#FFEBE0";
    iconColor = "#FF6633";
  } else if (cleanAvatar === "🦄" || cleanAvatar === "unicorn") {
    IconComponent = Sparkles;
    bgColor = "#FCE8FF";
    iconColor = "#D53F8C";
  } else if (
    cleanAvatar === "👨‍🏫" ||
    cleanAvatar === "coach" ||
    cleanAvatar === "tutor_1"
  ) {
    IconComponent = UserCheck;
    bgColor = "#E6FFFA";
    iconColor = "#319795";
  } else if (
    cleanAvatar === "👩‍🏫" ||
    cleanAvatar === "teacher" ||
    cleanAvatar === "tutor_2" ||
    cleanAvatar === "tutor_3"
  ) {
    IconComponent = GraduationCap;
    bgColor = "#EBF8FF";
    iconColor = "#2B6CB0";
  } else if (
    cleanAvatar === "👩‍⚕️" ||
    cleanAvatar === "therapist" ||
    cleanAvatar === "medical"
  ) {
    IconComponent = Activity;
    bgColor = "#FFF5F5";
    iconColor = "#C53030";
  }

  return (
    <div
      className={`avatar-icon-wrapper ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size * 1.8}px`,
        height: `${size * 1.8}px`,
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: iconColor,
        border: "1px solid rgba(0, 0, 0, 0.04)",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.02)",
        verticalAlign: "middle",
        ...style
      }}
    >
      <IconComponent size={size} />
    </div>
  );
}
