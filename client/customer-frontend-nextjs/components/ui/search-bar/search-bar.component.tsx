"use client";

import SearchButton from "../buttons/search-button.component";

export default function SearchBar() {
  const serachBarContent = [
    {
      label: "Where",
      subLabels: "Search destinations",
    },
    { label: "When", subLabels: "Add dates" },
    { label: "Who", subLabels: "Add guests" },
  ];
  return (
    <div className="min-w-[850px] min-h-[66px] shadow-lg border border-gray-300 bg-[#fff] rounded-full px-2 py-2 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-row gap-2 justify-between items-center">
        {serachBarContent.map((item, index) => (
          <div
            key={index}
            className={`flex-1 flex flex-row justify-between items-center ${
              index < serachBarContent.length - 1
                ? "border-r border-gray-300"
                : ""
            }`}
          >
            <div
              className={`flex flex-col justify-center items-start gap-1 ${
                index === 0 ? "ml-4" : ""
              }`}
            >
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {item.label}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {item.subLabels}
              </span>
            </div>
            {index === serachBarContent.length - 1 && <SearchButton />}
          </div>
        ))}
      </div>
    </div>
  );
}
