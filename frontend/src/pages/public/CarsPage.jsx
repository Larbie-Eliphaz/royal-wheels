import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";
import CarGrid from "../../components/cars/CarGrid";
import CarFilters from "../../components/cars/CarFilters";
import SearchBar from "../../components/cars/SearchBar";
import SortDropdown from "../../components/cars/SortDropdown";
import Pagination from "../../components/cars/Pagination";

const CarsPage = () => {
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // STATES
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [filters, setFilters] = useState({
    brand: searchParams.get("brand") || "",
    type: searchParams.get("type") || "",
    location: searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  // AUTO FETCH
  useEffect(() => {
    let isMounted = true;

    const fetchCars = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({ keyword, sort, page, ...filters });
        setSearchParams(params, { replace: true });

        const { data } = await API.get(`/cars?${params.toString()}`);

        if (!isMounted) return;
        setCars(data.cars);
        setPagination(data.pagination);
      } catch (error) {
        if (!isMounted) return;
        if (!error?.globalNotificationShown) {
          toast.error(error?.message || "Unable to load cars.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCars();

    return () => {
      isMounted = false;
    };
  }, [keyword, sort, page, filters, setSearchParams]);

  // SEARCH SUBMIT
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ keyword, sort, page, ...filters });
    setSearchParams(params, { replace: true });

    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 px">
      {/* TOP */}
      <div className="cars-toolbar mb-10">
        <div className="cars-search">
          <SearchBar
            keyword={keyword}
            setKeyword={setKeyword}
            handleSearch={handleSearch}
          />
        </div>

        <SortDropdown sort={sort} setSort={setSort} />
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* SIDEBAR */}
        <div>
          <CarFilters filters={filters} setFilters={setFilters} />
        </div>

        {/* CARS */}
        <div className="lg:col-span-4 ">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <CarGrid cars={cars} />

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                setPage={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarsPage;
