import React from 'react';

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5 text-gray-400" // Default styling
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 6.75A1.25 1.25 0 015.75 5.5h8.5A1.25 1.25 0 0115.5 6.75v8.5A1.25 1.25 0 0114.25 16.5h-8.5A1.25 1.25 0 014.5 15.25v-8.5z"
      clipRule="evenodd"
    />
    <path d="M7.25 8.5a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM9.5 9.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM12.25 8.5a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM7.5 11.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM9.25 12a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM11.5 11.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM13.25 12a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01z" />
  </svg>
);

export default CalendarIcon;