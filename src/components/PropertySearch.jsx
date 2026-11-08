import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { GHANA_REGIONS } from "../data/ghanaRegions";
import { EMPTY_PROPERTY_FILTERS } from "../utils/properties";
import { useLanguage } from "../context/LanguageContext";

function PropertySearch({ initialValues, onSearch, compact = false }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    ...EMPTY_PROPERTY_FILTERS,
    ...initialValues,
  });

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (
      form.minPrice !== "" &&
      form.maxPrice !== "" &&
      Number(form.minPrice) > Number(form.maxPrice)
    ) {
      return;
    }
    onSearch(form);
  };

  const inputClass =
    "search-field w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15";
  const labelClass = "mb-1.5 block text-xs font-semibold text-stone-600";

  return (
    <form className={`property-search ${compact ? "is-compact" : ""}`} onSubmit={submit}>
      {!compact && <h2 className="mb-5 text-lg font-bold text-stone-900">{t("searchTitle")}</h2>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label>
          <span className={labelClass}>{t("region")}</span>
          <select className={inputClass} name="region" value={form.region} onChange={update}>
            <option value="">{t("anyRegion")}</option>
            {GHANA_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
        </label>
        <label>
          <span className={labelClass}>{t("city")}</span>
          <input className={inputClass} name="city" value={form.city} onChange={update} placeholder={t("cityPlaceholder")} />
        </label>
        {!compact && (
          <label>
            <span className={labelClass}>{t("area")}</span>
            <input className={inputClass} name="area" value={form.area} onChange={update} placeholder={t("area")} />
          </label>
        )}
        <label>
          <span className={labelClass}>{t("propertyType")}</span>
          <select className={inputClass} name="propertyType" value={form.propertyType} onChange={update}>
            <option value="">{t("allTypes")}</option>
            <option value="LAND">{t("land")}</option>
            <option value="HOUSE">{t("house")}</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>{t("listingType")}</span>
          <select className={inputClass} name="listingType" value={form.listingType} onChange={update}>
            <option value="">{t("allListings")}</option>
            <option value="SALE">{t("sale")}</option>
            <option value="RENT">{t("rent")}</option>
          </select>
        </label>
        {!compact && (
          <>
            <label>
              <span className={labelClass}>{t("minPrice")}</span>
              <input className={inputClass} type="number" min="0" name="minPrice" value={form.minPrice} onChange={update} inputMode="numeric" />
            </label>
            <label>
              <span className={labelClass}>{t("maxPrice")}</span>
              <input className={inputClass} type="number" min="0" name="maxPrice" value={form.maxPrice} onChange={update} inputMode="numeric" />
            </label>
            <label>
              <span className={labelClass}>{t("bedrooms")}</span>
              <select className={inputClass} name="bedrooms" value={form.bedrooms} onChange={update}>
                <option value="">{t("any")}</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </label>
            <label>
              <span className={labelClass}>{t("bathrooms")}</span>
              <select className={inputClass} name="bathrooms" value={form.bathrooms} onChange={update}>
                <option value="">{t("any")}</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </label>
          </>
        )}
      </div>
      {!compact && (
        <label className="mt-3 block max-w-xs">
          <span className={labelClass}>{t("sortBy")}</span>
          <select className={inputClass} name="sortBy" value={form.sortBy} onChange={update}>
            <option value="newest">{t("newest")}</option>
            <option value="priceLow">{t("priceLow")}</option>
            <option value="priceHigh">{t("priceHigh")}</option>
          </select>
        </label>
      )}
      {form.minPrice !== "" && form.maxPrice !== "" && Number(form.minPrice) > Number(form.maxPrice) && (
        <p className="mt-3 text-sm text-red-700" role="alert">{t("minPrice")} must not exceed {t("maxPrice").toLowerCase()}.</p>
      )}
      <button className="button-primary mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold" type="submit">
        <FiSearch aria-hidden="true" />
        {t("search")}
      </button>
    </form>
  );
}

export default PropertySearch;
