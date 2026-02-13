import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 5.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75V5.25Z" />
      <path d="M9.75 12h-6a.75.75 0 0 1-.75-.75V8.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75Z" />
      <path d="M12.75 19.5h-9a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75Z" />
      <path d="M12.75 7.5h-9a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75Z" />
    </svg>
  );
}
