import { cn } from "@/lib/utils";
import type { SVGProps } from 'react';

export function QrCode(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
      className={cn("w-full h-full", props.className)}
      shapeRendering="crispEdges"
    >
      <path fill="#fff" d="M0 0h100v100H0z"/>
      <path fill="#000" d="M10 10h20v20H10z m60 0h20v20H70z m-60 60h20v20H10z M15 15h10v10H15z m60 0h10v10H75z m-60 60h10v10H15z M40 10h10v10H40z m20 0h10v10H60z m-30 10h10v10H30z m10 0h10v10H40z m30 0h10v10H70z m10 10h10v10H80z m-60 20h10v10H20z m10 0h10v10H30z m10 0h10v10H40z m10 0h10v10H50z m20 0h10v10H70z m-30 10h10v10H40z m20 0h10v10H60z m-50 20h10v10H10z m30 0h10v10H40z m10 0h10v10H50z m20 0h10v10H70z m-60 10h10v10H10z m10 0h10v10H20z m10 0h10v10H30z m20 0h10v10H50z m10 0h10v10H60z m20 0h10v10H80z M40 80h10v10H40z m20 0h10v10H60z m20 0h10v10H80z" />
    </svg>
  );
}
