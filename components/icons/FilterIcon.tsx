import React from 'react';

const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5" // Default size, can be overridden by props
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-6.586L4.293 6.707A1 1 0 014 6V3zm14-1a2 2 0 00-2-2H4a2 2 0 00-2 2v3a2 2 0 00.586 1.414L7 11.586V17a2 2 0 00.586 1.414l2 2A2 2 0 0011 20a2 2 0 001.414-.586l2-2A2 2 0 0015 17v-5.414l4.414-4.414A2 2 0 0020 6V3a2 2 0 00-2-2h-1zM5 5h10V4H5v1zm0 3.586l3 3V17l-2 2v-8.414l-3-3V5.586z"
      clipRule="evenodd"
    />
     <path d="M3 6.5A.5.5 0 013.5 6h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5zM3 10.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5z" />
  </svg>
);

export default FilterIcon;