'use client';

interface IconProps {
  className?: string;
  size?: number;
}

export function FolderIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4.5C2 3.67157 2.67157 3 3.5 3H6.17157C6.43679 3 6.69114 3.10536 6.87868 3.29289L7.70711 4.12132C7.89464 4.30886 8.149 4.41421 8.41421 4.41421H12.5C13.3284 4.41421 14 5.08579 14 5.91421V11.5C14 12.3284 13.3284 13 12.5 13H3.5C2.67157 13 2 12.3284 2 11.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FileIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 2.5C4 1.67157 4.67157 1 5.5 1H9.37868C9.64389 1 9.89825 1.10536 10.0858 1.29289L12.7071 3.91421C12.8946 4.10175 13 4.35611 13 4.62132V13.5C13 14.3284 12.3284 15 11.5 15H5.5C4.67157 15 4 14.3284 4 13.5V2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 1V4C9 4.55228 9.44772 5 10 5H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FileCodeIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 2.5C4 1.67157 4.67157 1 5.5 1H9.37868C9.64389 1 9.89825 1.10536 10.0858 1.29289L12.7071 3.91421C12.8946 4.10175 13 4.35611 13 4.62132V13.5C13 14.3284 12.3284 15 11.5 15H5.5C4.67157 15 4 14.3284 4 13.5V2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 1V4C9 4.55228 9.44772 5 10 5H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 9.5L5.5 10.5L6.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9.5L10.5 10.5L9.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PackageIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1L14 4V12L8 15L2 12V4L8 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8L14 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8L2 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckCircleIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 8L7 10L11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="1"
        width="10"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="6"
        y1="12.5"
        x2="10"
        y2="12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CircleIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function SpinnerIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2C4.68629 2 2 4.68629 2 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
