// components/Icons.tsx
import React from "react";

interface IconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

// Base Icon component for custom SVGs - Updated with correct Next.js public path
const CustomIcon: React.FC<IconProps & { src: string; alt?: string }> = ({
  className = "",
  size = "md",
  src,
  alt = "Icon",
}) => {
  const sizeClass = sizeClasses[size];
  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} ${className}`}
      style={{ display: "inline-block" }}
    />
  );
};

// For backward compatibility, keep the inline SVG Icon component
const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  className = "",
  size = "md",
  children,
}) => {
  const sizeClass = sizeClasses[size];
  return (
    <svg
      className={`${sizeClass} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
};

// Updated Icons using correct paths matching your file structure
export const BarsGraphIcon: React.FC<IconProps> = (props) => (
  <CustomIcon
    {...props}
    src="/svg/bars-graph-svgrepo-com.svg"
    alt="Bars Graph"
  />
);

export const CheckBadgeIcon: React.FC<IconProps> = (props) => (
  <CustomIcon
    {...props}
    src="/svg/check-badge-svgrepo-com.svg"
    alt="Check Badge"
  />
);

export const DashboardIcon: React.FC<IconProps> = (props) => (
  <CustomIcon
    {...props}
    src="/svg/dashboard-alt-svgrepo-com.svg"
    alt="Dashboard"
  />
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/eye-svgrepo-com.svg" alt="Eye" />
);

export const FlashIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/flash-svgrepo-com.svg" alt="Flash" />
);

export const FriendlyIcon: React.FC<IconProps> = (props) => (
  <CustomIcon
    {...props}
    src="/svg/friendly-iq-svgrepo-com.svg"
    alt="Friendly IQ"
  />
);

export const HandIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/hand-svgrepo-com.svg" alt="Hand" />
);

export const LoginIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/login-3-svgrepo-com.svg" alt="Login" />
);

export const ManageDatesIcon: React.FC<IconProps> = (props) => (
  <CustomIcon
    {...props}
    src="/svg/manage-dates-svgrepo-com.svg"
    alt="Manage Dates"
  />
);

export const MorningIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/morning-svgrepo-com.svg" alt="Morning" />
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/plus-svgrepo-com.svg" alt="Plus" />
);

export const SignOutIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/sign-out-svgrepo-com.svg" alt="Sign Out" />
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <CustomIcon {...props} src="/svg/user-svgrepo-com.svg" alt="User" />
);

export const WinnerCupIcon: React.FC<IconProps> = (props) => (
  <CustomIcon
    {...props}
    src="/svg/winner-cup-10-svgrepo-com.svg"
    alt="Winner Cup"
  />
);

// Fallback inline SVG icons in case the custom SVGs don't load
export const BarsGraphIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </Icon>
);

export const CheckBadgeIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

export const DashboardIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
    />
  </Icon>
);

export const FlashIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </Icon>
);

export const EyeIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </Icon>
);

export const HandIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
    />
  </Icon>
);

export const LoginIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  </Icon>
);

export const ManageDatesIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

export const MorningIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </Icon>
);

export const PlusIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </Icon>
);

export const UserIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </Icon>
);

export const WinnerCupIconFallback: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </Icon>
);

// Keep commonly used icons as inline SVGs for better performance
export const OverviewIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </Icon>
);

export const EntriesIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </Icon>
);

export const ResultsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </Icon>
);

// Time & Schedule Icons
export const AfternoonIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </Icon>
);

export const FullDayIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

// Action Icons
export const AddIcon: React.FC<IconProps> = (props) => <PlusIcon {...props} />;

export const EditIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </Icon>
);

export const DeleteIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </Icon>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
    />
  </Icon>
);

export const ViewIcon: React.FC<IconProps> = (props) => <EyeIcon {...props} />;

export const ShareIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </Icon>
);

// Status Icons
export const SuccessIcon: React.FC<IconProps> = (props) => (
  <CheckBadgeIcon {...props} />
);

export const WarningIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </Icon>
);

export const ErrorIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

// Navigation Icons
export const BackIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </Icon>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </Icon>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </Icon>
);

export const MoreIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01"
    />
  </Icon>
);

// User & Authentication Icons - Using custom SVGs
export const UsersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </Icon>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <SignOutIcon {...props} />
);

// File & Data Icons
export const DocumentIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </Icon>
);

export const UploadIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </Icon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </Icon>
);

// Poll & Voting Icons
export const PollIcon: React.FC<IconProps> = (props) => (
  <BarsGraphIcon {...props} />
);

export const VoteIcon: React.FC<IconProps> = (props) => <HandIcon {...props} />;

export const DrawIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </Icon>
);

// Loading & Activity Icons
export const LoadingIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </Icon>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <FlashIcon {...props} />
);

// Settings Icons
export const SettingsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </Icon>
);

// Trophy & Achievement Icons
export const TrophyIcon: React.FC<IconProps> = (props) => (
  <WinnerCupIcon {...props} />
);

export const CelebrationIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </Icon>
);

// Export all icons for easy access
export const Icons = {
  // Custom SVG Icons
  BarsGraph: BarsGraphIcon,
  CheckBadge: CheckBadgeIcon,
  Dashboard: DashboardIcon,
  Eye: EyeIcon,
  Flash: FlashIcon,
  Friendly: FriendlyIcon,
  Hand: HandIcon,
  Login: LoginIcon,
  ManageDates: ManageDatesIcon,
  Morning: MorningIcon,
  Plus: PlusIcon,
  SignOut: SignOutIcon,
  User: UserIcon,
  WinnerCup: WinnerCupIcon,

  // Fallback Icons
  BarsGraphFallback: BarsGraphIconFallback,
  CheckBadgeFallback: CheckBadgeIconFallback,
  DashboardFallback: DashboardIconFallback,
  FlashFallback: FlashIconFallback,
  EyeFallback: EyeIconFallback,
  HandFallback: HandIconFallback,
  LoginFallback: LoginIconFallback,
  ManageDatesFallback: ManageDatesIconFallback,
  MorningFallback: MorningIconFallback,
  PlusFallback: PlusIconFallback,
  UserFallback: UserIconFallback,
  WinnerCupFallback: WinnerCupIconFallback,

  // Common Icons
  Overview: OverviewIcon,
  Entries: EntriesIcon,
  Results: ResultsIcon,
  Afternoon: AfternoonIcon,
  FullDay: FullDayIcon,
  Clock: ClockIcon,
  Add: AddIcon,
  Edit: EditIcon,
  Delete: DeleteIcon,
  Copy: CopyIcon,
  View: ViewIcon,
  Share: ShareIcon,
  Success: SuccessIcon,
  Warning: WarningIcon,
  Error: ErrorIcon,
  Info: InfoIcon,
  Back: BackIcon,
  Menu: MenuIcon,
  Close: CloseIcon,
  More: MoreIcon,
  Users: UsersIcon,
  Logout: LogoutIcon,
  Document: DocumentIcon,
  Upload: UploadIcon,
  Download: DownloadIcon,
  Poll: PollIcon,
  Vote: VoteIcon,
  Draw: DrawIcon,
  Loading: LoadingIcon,
  Refresh: RefreshIcon,
  Settings: SettingsIcon,
  Trophy: TrophyIcon,
  Celebration: CelebrationIcon,
};
