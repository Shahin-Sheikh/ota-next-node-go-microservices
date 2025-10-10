"use client";

import SearchButton from "../buttons/search-button.component";

export default function SearchBar() {
  return (
    <div className="min-w-[850px] min-h-[66px] shadow-xs border border-[#f0f0f0] bg-[#fff] rounded-full px-4 py-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-row items-center gap-2 justify-center">
        <div className="min-w-[100px]">Where</div>
        <div className="w-[1px] h-6 bg-gray-300"></div>
        <div className="min-w-[100px]">Check In</div>
        <div className="w-[1px] h-6 bg-gray-300"></div>
        <div className="min-w-[100px]">Check Out</div>
        <div className="w-[1px] h-6 bg-gray-300"></div>
        <div className="min-w-[100px]">Add guests</div>
        <SearchButton />
      </div>
    </div>
  );
}
