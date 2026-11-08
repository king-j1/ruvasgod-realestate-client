import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiMapPin } from "react-icons/fi";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { formatGhsPrice } from "../utils/properties";

function PropertyDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useLanguage();
  const [property, setProperty] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [enquiryBusy, setEnquiryBusy] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function fetchProperty() {
      if (!/^[a-f\d]{24}$/i.test(id || "")) {
        setError(t("invalidProperty"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/properties/${id}`);
        if (active) setProperty(response.data?.property || null);
      } catch (requestError) {
        if (active) {
          setError(requestError.message?.includes("VITE_API_URL")
            ? requestError.message
            : requestError.response?.status === 404
              ? t("propertyNotFound")
              : t("detailsError"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProperty();
    return () => { active = false; };
  }, [id, t]);

  const submitEnquiry = async (event) => {
    event.preventDefault();

    if (enquiryBusy) return;

    try {
      setEnquiryBusy(true);
      setEnquiryError("");
      setEnquirySuccess("");

      const { data } = await api.post("/property-enquiries", {
        propertyId: id,
        ...enquiry,
      });

      setEnquirySuccess(
        data?.message || "Your enquiry has been submitted successfully."
      );
      setEnquiry({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (requestError) {
      setEnquiryError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to submit your enquiry."
      );
    } finally {
      setEnquiryBusy(false);
    }
  };

  const backTo = typeof location.state?.from === "string" &&
    location.state.from.startsWith("/properties")
    ? location.state.from
    : "/properties";

  if (loading) {
    return (
      <main className="min-h-[65vh] bg-[#fffdf8] px-5 py-16">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-5 w-36 rounded bg-stone-200" />
          <div className="mt-7 aspect-[16/8] rounded-2xl bg-stone-200" />
          <div className="mt-7 h-8 w-2/3 rounded bg-stone-200" />
          <div className="mt-4 h-5 w-1/3 rounded bg-stone-100" />
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-[65vh] bg-[#fffdf8] px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-stone-900">{error || t("propertyNotFound")}</h1>
          <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-900" to={backTo}>
            <FiArrowLeft aria-hidden="true" /> {t("backToProperties")}
          </Link>
        </div>
      </main>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];
  const address = property.address || {};
  const fullAddress = [address.addressLine, address.area, address.city, address.region].filter(Boolean).join(", ");
  const coordinates = property.location?.coordinates;
  const hasCoordinates = Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every(Number.isFinite) &&
    Math.abs(coordinates[0]) <= 180 &&
    Math.abs(coordinates[1]) <= 90;
  const moveImage = (direction) => setImageIndex((current) => (current + direction + images.length) % images.length);

  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <article className="mx-auto max-w-6xl">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-amber-900" to={backTo}>
          <FiArrowLeft aria-hidden="true" /> {t("backToProperties")}
        </Link>

        <div className="mt-5 overflow-hidden rounded-2xl bg-stone-100">
          {images.length ? (
            <div className="relative">
              <img className="max-h-[70vh] min-h-64 w-full object-cover" src={images[imageIndex]} alt={`${property.title} — ${t("image")} ${imageIndex + 1}`} />
              {images.length > 1 && (
                <>
                  <button className="gallery-control start-3" aria-label={t("previousImage")} onClick={() => moveImage(-1)} type="button"><FiChevronLeft /></button>
                  <button className="gallery-control end-3" aria-label={t("nextImage")} onClick={() => moveImage(1)} type="button"><FiChevronRight /></button>
                  <span className="absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-stone-950/75 px-3 py-1 text-xs font-semibold text-white" dir="ltr">{imageIndex + 1} / {images.length}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center px-6 text-center text-stone-600">{t("noImages")}</div>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button className={`shrink-0 overflow-hidden rounded-lg border-2 ${index === imageIndex ? "border-amber-800" : "border-transparent"}`} key={`${image}-${index}`} onClick={() => setImageIndex(index)} type="button" aria-label={`${t("image")} ${index + 1}`} aria-pressed={index === imageIndex}>
                <img className="h-16 w-24 object-cover" src={image} alt="" />
              </button>
            ))}
          </div>
        )}

        <header className="mt-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">{property.propertyType === "LAND" ? t("land") : t("house")}</span>
              <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-800">{property.listingType === "RENT" ? t("rent") : t("sale")}</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{property.title}</h1>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-stone-600">
              <FiMapPin className="mt-1 shrink-0" aria-hidden="true" />
              <span>{fullAddress || t("unavailable")}</span>
            </p>
          </div>
          <p className="text-2xl font-bold text-stone-900 sm:text-3xl">{formatGhsPrice(property.price, property.currency)}</p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-stone-900">{t("description")}</h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-stone-700">{property.description || t("unavailable")}</p>
            <h2 className="mt-8 text-xl font-semibold text-stone-900">{t("location")}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                [t("region"), address.region],
                [t("city"), address.city],
                [t("area"), address.area],
                [t("location"), address.addressLine],
              ].filter(([, value]) => value).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-stone-800">{value}</dd>
                </div>
              ))}
              {hasCoordinates && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t("coordinates")}</dt>
                  <dd className="mt-1 text-sm font-medium text-stone-800" dir="ltr">
                    {t("longitude")}: {coordinates[0]}, {t("latitude")}: {coordinates[1]}
                  </dd>
                </div>
              )}
            </dl>
          </section>
          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">{t("details")}</h2>
            <dl className="mt-4 divide-y divide-stone-100">
              {property.bedrooms != null && <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-stone-600">{t("bedrooms")}</dt><dd className="font-semibold text-stone-900">{property.bedrooms}</dd></div>}
              {property.bathrooms != null && <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-stone-600">{t("bathrooms")}</dt><dd className="font-semibold text-stone-900">{property.bathrooms}</dd></div>}
              {property.landSize?.value != null && <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-stone-600">{t("landSize")}</dt><dd className="font-semibold text-stone-900">{property.landSize.value.toLocaleString()} {property.landSize.unit?.replace("_", " ")}</dd></div>}
              {property.representedBy && <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-stone-600">{t("representedBy")}</dt><dd className="font-semibold text-stone-900">{property.representedBy}</dd></div>}
            </dl>
            <div className="mt-5 border-t border-stone-100 pt-5">
              <h3 className="text-lg font-semibold text-stone-900">
                Enquire about this property
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                Send your enquiry to our property team.
              </p>

              <form onSubmit={submitEnquiry} className="mt-4 space-y-3">
                {[
                  ["name", "Full name", "text"],
                  ["email", "Email address", "email"],
                  ["phone", "Phone number", "tel"],
                ].map(([field, label, type]) => (
                  <label key={field} className="block text-sm font-medium text-stone-700">
                    {label}
                    <input
                      type={type}
                      required
                      maxLength={field === "name" ? 100 : field === "email" ? 254 : 30}
                      value={enquiry[field]}
                      onChange={(event) =>
                        setEnquiry((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                    />
                  </label>
                ))}

                <label className="block text-sm font-medium text-stone-700">
                  Message
                  <textarea
                    required
                    rows={4}
                    maxLength={2000}
                    value={enquiry.message}
                    onChange={(event) =>
                      setEnquiry((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  />
                </label>

                {enquiryError && (
                  <p role="alert" className="text-sm text-red-700">
                    {enquiryError}
                  </p>
                )}

                {enquirySuccess && (
                  <p role="status" className="text-sm text-green-800">
                    {enquirySuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enquiryBusy}
                  className="w-full rounded-lg bg-amber-700 px-4 py-3 font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
                >
                  {enquiryBusy ? "Sending..." : "Send enquiry"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

export default PropertyDetails;
