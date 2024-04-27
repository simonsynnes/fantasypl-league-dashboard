import React, { useState } from "react";

interface Props {
  onSearch: (userId: string) => void;
}

const SearchInput: React.FC<Props> = ({ onSearch }) => {
  const [userId, setUserId] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (userId.trim() !== "") {
      onSearch(userId.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex justify-center items-center my-4"
    >
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Enter User ID"
        className="px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent"
        style={{ border: "1px solid #ccc", minWidth: "300px" }}
      />
      <button
        type="submit"
        className="bg-light-blue text-white px-4 py-2 rounded-r-lg hover:bg-dark-blue"
      >
        Search
      </button>
    </form>
  );
};

export default SearchInput;
