"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Filter, Home, MapPin, Pencil, RefreshCw, Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { API_BASE_URL, fetchWithError } from "@/lib/api";

const propertyTypeOptions = ["apartment", "house", "land", "office"] as const;
const listingTypeOptions = ["sale", "rent"] as const;
const sortFieldOptions = ["created_at", "price", "area_sqm", "rooms"] as const;
const sortOrderOptions = ["asc", "desc"] as const;
const pageSizeOptions = [6, 9, 12, 20, 30, 50] as const;

type ListingImageRead = {
  id: string;
  url: string;
  created_at: string;
};

type ListingRead = {
  id: string;
  title: string;
  description: string | null;
  property_type: (typeof propertyTypeOptions)[number];
  listing_type: (typeof listingTypeOptions)[number];
  price: number;
  currency: string;
  city: string;
  area_sqm: number;
  rooms: number;
  user_id: string;
  created_at: string;
  images?: ListingImageRead[];
};

type ListingListRead = {
  items: ListingRead[];
  total: number;
  page: number;
  page_size: number;
};

type FiltersState = {
  propertyType: string;
  listingType: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  minRooms: string;
  maxRooms: string;
  sortBy: (typeof sortFieldOptions)[number];
  sortOrder: (typeof sortOrderOptions)[number];
  page: number;
  pageSize: (typeof pageSizeOptions)[number];
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

const initialFilters: FiltersState = {
  propertyType: "",
  listingType: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  minRooms: "",
  maxRooms: "",
  sortBy: "created_at",
  sortOrder: "desc",
  page: 1,
  pageSize: 12,
};

function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function ListingsPage() {
  const { user, token } = useAuth();

  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [data, setData] = useState<ListingListRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<StatusMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: filters.page.toString(),
      page_size: filters.pageSize.toString(),
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder,
    });

    if (filters.propertyType) params.set("property_type", filters.propertyType);
    if (filters.listingType) params.set("listing_type", filters.listingType);
    if (filters.city.trim()) params.set("city", filters.city.trim());

    const numericFields: Array<[keyof FiltersState, string]> = [
      ["minPrice", "min_price"],
      ["maxPrice", "max_price"],
      ["minArea", "min_area"],
      ["maxArea", "max_area"],
      ["minRooms", "min_rooms"],
      ["maxRooms", "max_rooms"],
    ];

    numericFields.forEach(([stateKey, queryKey]) => {
      const raw = filters[stateKey];
      const value = Number(raw);
      if (raw !== "" && Number.isFinite(value)) {
        params.set(queryKey, value.toString());
      }
    });

    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await fetchWithError<ListingListRead>(
          `${API_BASE_URL}/api/v1/listings?${params.toString()}`,
          { signal: controller.signal },
        );
        setData(response);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load listings.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => controller.abort();
  }, [filters]);

  const totalPages = useMemo(() => {
    if (!data || !data.total) return 1;
    return Math.max(1, Math.ceil(data.total / filters.pageSize));
  }, [data, filters.pageSize]);

  const canManageListing = (listing: ListingRead) => {
    if (!user) return false;
    if (["admin", "moderator"].includes(user.role ?? "")) return true;
    return listing.user_id === user.id;
  };

  const handleDelete = async (listingId: string) => {
    setActionMessage(null);

    if (!token) {
      setActionMessage({
        type: "error",
        text: "Please sign in to delete listings.",
      });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeletingId(listingId);

    try {
      await fetchWithError(`${API_BASE_URL}/api/v1/listings/${listingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setData((prev) => {
        if (!prev) return prev;
        const items = prev.items.filter((item) => item.id !== listingId);
        const total = Math.max(0, prev.total - 1);
        return { ...prev, items, total };
      });

      setActionMessage({ type: "success", text: "Listing deleted successfully." });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete listing.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterChange = (
    key: keyof FiltersState,
    value: string | FiltersState[keyof FiltersState],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const resetFilters = () => setFilters(initialFilters);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-10">
      <header className="flex flex-col gap-3">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          <Filter className="h-4 w-4" /> Listings explorer
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Browse the latest listings</h1>
          <p className="text-base text-slate-600">
            Filter by city, price, area, rooms, and property type. Results are kept in sync with the backend pagination and sorting.
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="h-4 w-4" />
            Filters & sorting
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Property type
            <select
              value={filters.propertyType}
              onChange={(event) => handleFilterChange("propertyType", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Any</option>
              {propertyTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Listing type
            <select
              value={filters.listingType}
              onChange={(event) => handleFilterChange("listingType", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Any</option>
              {listingTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            City
            <div className="relative">
              <input
                value={filters.city}
                onChange={(event) => handleFilterChange("city", event.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              <MapPin className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Min price
            <input
              type="number"
              min={0}
              value={filters.minPrice}
              onChange={(event) => handleFilterChange("minPrice", event.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Max price
            <input
              type="number"
              min={0}
              value={filters.maxPrice}
              onChange={(event) => handleFilterChange("maxPrice", event.target.value)}
              placeholder="500000"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Min area (sqm)
            <input
              type="number"
              min={1}
              value={filters.minArea}
              onChange={(event) => handleFilterChange("minArea", event.target.value)}
              placeholder="50"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Max area (sqm)
            <input
              type="number"
              min={1}
              value={filters.maxArea}
              onChange={(event) => handleFilterChange("maxArea", event.target.value)}
              placeholder="250"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Min rooms
            <input
              type="number"
              min={0}
              value={filters.minRooms}
              onChange={(event) => handleFilterChange("minRooms", event.target.value)}
              placeholder="1"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Max rooms
            <input
              type="number"
              min={0}
              value={filters.maxRooms}
              onChange={(event) => handleFilterChange("maxRooms", event.target.value)}
              placeholder="5"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Sort by
            <select
              value={filters.sortBy}
              onChange={(event) => handleFilterChange("sortBy", event.target.value as FiltersState["sortBy"])}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {sortFieldOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ").replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Sort order
            <select
              value={filters.sortOrder}
              onChange={(event) => handleFilterChange("sortOrder", event.target.value as FiltersState["sortOrder"])}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {sortOrderOptions.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Results per page
            <select
              value={filters.pageSize}
              onChange={(event) =>
                handleFilterChange("pageSize", Number(event.target.value) as FiltersState["pageSize"])
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Results</p>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Home className="h-4 w-4" />
              {data?.total ? `${data.total} listing${data.total === 1 ? "" : "s"} found` : "Fresh market data"}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <CalendarClock className="h-4 w-4" />
            Page {filters.page} of {totalPages}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionMessage && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              actionMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: filters.pageSize }).map((_, index) => (
              <div
                key={index}
                className="h-64 rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100/50"
              >
                <div className="h-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-100" />
              </div>
            ))}
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-700 shadow-sm">
            No listings match the selected filters yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((listing) => {
              const coverImage = listing.images?.[0]?.url;

              return (
                <article
                  key={listing.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {coverImage ? (
                    <div className="relative h-44 w-full">
                      <Image
                        src={coverImage}
                        alt={listing.title}
                        fill
                        sizes="(min-width: 1024px) 400px, 100vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      No image
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-900">
                        {listing.property_type}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                        {listing.listing_type}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900">{listing.title}</h3>
                      <p className="line-clamp-2 text-sm text-slate-600">{listing.description ?? "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
                        <p>{formatPrice(listing.price, listing.currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Area</p>
                        <p>{listing.area_sqm} sqm</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rooms</p>
                        <p>{listing.rooms}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created</p>
                        <p>{formatDate(listing.created_at)}</p>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-sm text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {listing.city}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">#{listing.id.slice(0, 6)}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-1 pt-3">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          View details
                        </Link>

                        {canManageListing(listing) ? (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/listings/${listing.id}/edit`}
                              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(listing.id)}
                              disabled={deletingId === listing.id}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === listing.id ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" /> Delete
                                </>
                              )}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          Page {filters.page} of {totalPages}
          {data?.total !== undefined && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {data.total} total results
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
            }
            disabled={filters.page <= 1 || loading}
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
            }
            disabled={filters.page >= totalPages || loading}
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
