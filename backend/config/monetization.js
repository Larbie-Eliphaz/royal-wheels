export const ADD_ON_CURRENCY = process.env.PAYSTACK_CURRENCY || "GHS";

// Placeholder prices; replace these amounts before enabling production checkout.
export const CHECKOUT_ADD_ONS = [
  { id: "inspection", name: "Vehicle inspection", price: 500 },
  { id: "insurance", name: "Insurance", price: 300 },
  { id: "delivery", name: "Delivery", price: 200 },
];

const addOnAliases = new Map([
  ["inspection", "inspection"],
  ["vehicleinspection", "inspection"],
  ["insurance", "insurance"],
  ["delivery", "delivery"],
  ["vehicledelivery", "delivery"],
]);

const normalizeAddOnId = (value) => {
  if (typeof value !== "string") return null;
  return (
    addOnAliases.get(value.toLowerCase().replace(/[^a-z0-9]/g, "")) || null
  );
};

const collectAddOnIds = (value) => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (!item || typeof item !== "object") return [];
      const selectionFlag = item.selected ?? item.isSelected ?? item.checked;
      if (selectionFlag === false) return [];
      return [item.id, item.key, item.name, item.service, item.title].filter(
        (field) => typeof field === "string",
      );
    });
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, selected]) => selected === true)
      .map(([id]) => id);
  }
  return [];
};

export const resolveCheckoutAddOns = (body = {}) => {
  const requestedIds = ["addOns", "selectedAddOns", "services"].flatMap(
    (field) => collectAddOnIds(body[field]),
  );
  const normalizedIds = requestedIds.map(normalizeAddOnId);

  if (normalizedIds.some((id) => !id)) {
    const error = new Error("One or more selected add-ons are not supported.");
    error.status = 400;
    throw error;
  }

  const uniqueIds = [...new Set(normalizedIds)];
  return CHECKOUT_ADD_ONS.filter((addOn) => uniqueIds.includes(addOn.id)).map(
    ({ id, name, price }) => ({ id, name, price }),
  );
};
