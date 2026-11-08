import { Link, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiMapPin } from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";
import { formatGhsPrice } from "../utils/properties";

function PropertyCard({ property }) {
  const location = useLocation();
  const { t } = useLanguage();
  const image = property.images?.[0];
  const address = property.address || {};
  const place = [address.area, address.city, address.region].filter(Boolean).join(", ");

  return (
    <article className="property-card overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/properties/${property._id}`}
        state={{ from: `${location.pathname}${location.search}` }}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
      >
        <div className="relative aspect-[4/3] bg-stone-100">
          {image ? (
            <img className="h-full w-full object-cover" src={image} alt={property.title || "Property"} loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-500">{t("noImages")}</div>
          )}
          <span className="absolute start-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800 shadow-sm">
            {property.propertyType === "LAND" ? t("land") : t("house")}
          </span>
        </div>
        <div className="p-5">
          <p className="text-xl font-bold text-stone-900">{formatGhsPrice(property.price, property.currency)}</p>
          <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 text-stone-900">{property.title}</h2>
          <p className="mt-2 flex min-h-5 items-center gap-1.5 text-sm text-stone-600">
            <FiMapPin aria-hidden="true" className="shrink-0" />
            <span className="truncate">{place || t("unavailable")}</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-100 pt-4 text-xs font-medium text-stone-600">
            <span>{property.listingType === "RENT" ? t("rent") : t("sale")}</span>
            {property.bedrooms != null && <span>{property.bedrooms} {t("bedroomsShort")}</span>}
            {property.bathrooms != null && <span>{property.bathrooms} {t("bathroomsShort")}</span>}
            {property.landSize?.value != null && (
              <span>{property.landSize.value.toLocaleString()} {property.landSize.unit?.replace("_", " ")}</span>
            )}
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-900">
            {t("viewDetails")} <FiArrowUpRight aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export default PropertyCard;
