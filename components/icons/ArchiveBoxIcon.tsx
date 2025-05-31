
import React from 'react';

const ArchiveBoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M12 15h.008M12 18h.008m-3.75-1.5h7.5M4.5 7.5h15M3.75 7.5A2.25 2.25 0 006 5.25h12A2.25 2.25 0 0019.5 7.5"
    />
  </svg>
);

export default ArchiveBoxIcon;
