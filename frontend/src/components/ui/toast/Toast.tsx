import { useEffect, useState } from "react";
import {
  AlertHexaIcon,
  CheckCircleIcon,
  CloseIcon,
  ErrorHexaIcon,
  InfoIcon,
} from "../../../icons";

export interface ToastProps {
  id: string;
  variant: "success" | "info" | "warning" | "error";
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  variant,
  title,
  description,
  duration = 4000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  const variantStyles = {
    success: {
      borderColor: "border-success-500",
      iconBg: "bg-success-50 text-success-500 dark:bg-success-500/10",
      icon: <CheckCircleIcon />,
    },
    info: {
      borderColor: "border-blue-light-500",
      iconBg: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/10",
      icon: <InfoIcon />,
    },
    warning: {
      borderColor: "border-warning-500",
      iconBg: "bg-warning-50 text-warning-500 dark:bg-warning-500/10",
      icon: <AlertHexaIcon />,
    },
    error: {
      borderColor: "border-error-500",
      iconBg: "bg-error-50 text-error-500 dark:bg-error-500/10",
      icon: <ErrorHexaIcon className="size-5" />,
    },
  };

  const { borderColor, iconBg, icon } = variantStyles[variant];

  return (
    <div
      className={`flex items-center justify-between gap-3 w-full max-w-[380px] rounded-md border-b-4 p-3 shadow-theme-sm bg-white dark:bg-[#1E2634] ${borderColor} transition-all duration-300 ${
        isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 break-words">
            {title}
          </h4>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-white/60 break-words">
              {description}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-white/90 shrink-0 p-1"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
};

export default Toast;
