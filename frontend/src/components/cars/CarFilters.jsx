const CarFilters = ({ filters, setFilters,}) => {
  const handleChange = (e) => {
    setFilters({...filters, [e.target.name]:e.target.value,});
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-5">
      <h2 className="text-xl font-bold">
        Filters
      </h2>

      {/* BRAND */}
      <div>
        <label className="font-medium">
          Brand
        </label>

        <select
          name="brand"
          value={filters.brand}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 mt-2"
        >
          <option value="">
            All Brands
          </option>

          <option value="Toyota">
            Toyota
          </option>

          <option value="BMW">
            BMW
          </option>

          <option value="Mercedes">
            Mercedes
          </option>
        </select>
      </div>

      {/* TYPE */}
      <div>
        <label className="font-medium">
          Type
        </label>

        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 mt-2"
        >
          <option value="">
            All
          </option>

          <option value="sale">
            Sale
          </option>

          <option value="rent">
            Rent
          </option>
        </select>
      </div>

      {/* LOCATION */}
      <div>
        <label className="font-medium">
          Location
        </label>

        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Accra"
          className="w-full border rounded-xl p-3 mt-2"
        />
      </div>

      {/* MIN PRICE */}
      <div>
        <label className="font-medium">
          Min Price
        </label>

        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 mt-2"
        />
      </div>

      {/* MAX PRICE */}
      <div>
        <label className="font-medium">
          Max Price
        </label>

        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 mt-2"
        />
      </div>
    </div>
  );
};

export default CarFilters;