"use client";

import SearchButton from "../buttons/search-button.component";

export default function SearchBar() {
  const searchBarContent = [
    {
      label: "Where",
      subLabels: "Search destinations",
    },
    { label: "When", subLabels: "Add dates" },
    { label: "Who", subLabels: "Add guests" },
  ];

  return (
    <div className="min-w-[850px] h-[66px] shadow-sm border border-[#DDDDDD] bg-white rounded-full hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-row justify-between items-center h-full">
        {searchBarContent.map((item, index) => (
          <div
            key={index}
            className={`flex-1 flex flex-row justify-between items-center px-6 h-full hover:bg-[#EBEBEB] rounded-full transition-colors duration-200 cursor-pointer ${
              index < searchBarContent.length - 1
                ? "border-r border-[#DDDDDD]"
                : ""
            }`}
          >
            <div className="flex flex-col justify-center items-start gap-0">
              <span
                className="text-[0.75rem] font-semibold leading-4 text-[#222222]"
                style={{
                  fontFamily:
                    'var(--font-circular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
                }}
              >
                {item.label}
              </span>
              <span
                className="text-[0.875rem] font-normal leading-5 text-[#717171]"
                style={{
                  fontFamily:
                    'var(--font-circular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
                }}
              >
                {item.subLabels}
              </span>
            </div>
            {index === searchBarContent.length - 1 && (
              <div className="ml-2">
                <SearchButton />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
