const SortDropdown = ({sort, setSort,}) => {
  return (
    <select
      value={sort}
      onChange={(e) => setSort(e.target.value)}
      className="cars-sort border rounded-xl px-4 py-3"
    >
      <option value="">
        Sort By
      </option>

      <option value="newest">
        Newest
      </option>

      <option value="price_asc">
        Price: Low to High
      </option>

      <option value="price_desc">
        Price: High to Low
      </option>
    </select>
  );
};

export default SortDropdown;