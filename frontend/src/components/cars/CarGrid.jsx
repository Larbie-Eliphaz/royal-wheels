import CarCard from "./CarCard";

const CarGrid = ({ cars }) => {
  return (
    <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard
          key={car._id}
          car={car}
        />
      ))}
    </div>
  );
};

export default CarGrid;