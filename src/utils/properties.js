export const EMPTY_PROPERTY_FILTERS = {
  region: "",
  city: "",
  area: "",
  propertyType: "",
  listingType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  sortBy: "newest",
};

export function readPropertyFilters(searchParams) {
  return {
    ...EMPTY_PROPERTY_FILTERS,
    ...Object.fromEntries(
      Object.keys(EMPTY_PROPERTY_FILTERS).map((key) => [
        key,
        searchParams.get(key) || EMPTY_PROPERTY_FILTERS[key],
      ]),
    ),
  };
}

export function filterAndSortProperties(properties, filters) {
  const normalized = (value) => String(value || "").trim().toLowerCase();
  const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);

  const filtered = properties.filter((property) => {
    const price = Number(property.price);
    const matchesText = (value, query) =>
      !query || normalized(value).includes(normalized(query));

    return (
      matchesText(property.address?.region, filters.region) &&
      matchesText(property.address?.city, filters.city) &&
      matchesText(property.address?.area, filters.area) &&
      (!filters.propertyType || property.propertyType === filters.propertyType) &&
      (!filters.listingType || property.listingType === filters.listingType) &&
      (minPrice === null || (Number.isFinite(price) && price >= minPrice)) &&
      (maxPrice === null || (Number.isFinite(price) && price <= maxPrice)) &&
      (!filters.bedrooms ||
        Number(property.bedrooms) >= Number(filters.bedrooms)) &&
      (!filters.bathrooms ||
        Number(property.bathrooms) >= Number(filters.bathrooms))
    );
  });

  return filtered.sort((first, second) => {
    const firstPrice = Number(first.price) || 0;
    const secondPrice = Number(second.price) || 0;
    if (filters.sortBy === "priceLow") return firstPrice - secondPrice;
    if (filters.sortBy === "priceHigh") return secondPrice - firstPrice;
    return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
  });
}

export function formatGhsPrice(price, currency = "GHS") {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Price unavailable";
  const displayCurrency = currency || "GHS";
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: displayCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return `${displayCurrency} ${new Intl.NumberFormat("en-GH", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  }
}
