"use client";

import SearchButton from "../buttons/search-button.component";

export default function SearchBar() {
  return (
    <div className="min-w-[850px] max-h-[66px] shadow-lg border border-gray-300 bg-[#fff] rounded-full px-6 py-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-row gap-2 justify-between items-center">
        <div className="">Where</div>
        <div className="w-[1px] h-6 bg-gray-300"></div>
        <div className="">Check In</div>
        <div className="w-[1px] h-6 bg-gray-300"></div>
        <div className="">Check Out</div>
        <div className="w-[1px] h-6 bg-gray-300"></div>
        <div className="">Add guests</div>
        <SearchButton />
      </div>
    </div>
  );
}
