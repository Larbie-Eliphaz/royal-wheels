const SearchBar = ({ keyword, setKeyword, handleSearch,}) => {
  return (
    <form
      onSubmit={handleSearch}
      className="cars-search-form flex w-full min-w-0 gap-3"
    >
      <input
        type="text"
        placeholder="Search cars..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="min-w-0 flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
      />

      <button className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-xl">
        Search
      </button>
    </form>
  );
};

export default SearchBar;