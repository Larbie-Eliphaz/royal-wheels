const Pagination = ({currentPage, totalPages, setPage,}) => {
  return (
    <div className="flex justify-center gap-3 mt-10">

      {Array.from({length: totalPages,}).map((_, index) => (
        <button
          key={index}
          onClick={() =>setPage(index + 1)}
          className={`px-4 py-2 rounded-xl ${
            currentPage === index + 1 ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination;