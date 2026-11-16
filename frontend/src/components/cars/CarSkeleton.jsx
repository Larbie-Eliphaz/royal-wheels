const CarSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">

      <div className="h-56 bg-gray-200"></div>

      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded"></div>

        <div className="h-4 bg-gray-200 rounded w-2/3"></div>

        <div className="h-4 bg-gray-200 rounded w-1/2"></div>

        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default CarSkeleton;