import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Home, MapPin, Ruler, SquareStack } from "lucide-react";

import { API_BASE_URL, fetchWithError } from "@/lib/api";

type ListingImageRead = {
  id: string;
  url: string;
  created_at: string;
};

type ListingRead = {
  id: string;
  title: string;
  description: string | null;
  property_type: "apartment" | "house" | "land" | "office";
  listing_type: "sale" | "rent";
  price: number;
  currency: string;
  city: string;
  area_sqm: number;
  rooms: number;
  created_at: string;
  images?: ListingImageRead[];
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

async function loadListing(listingId: string): Promise<ListingRead | null> {
  try {
    return await fetchWithError<ListingRead>(`${API_BASE_URL}/api/v1/listings/${listingId}`);
  } catch {
    return null;
  }
}

export default async function ListingDetailsPage({
  params,
}: {
  params: { listingId: string };
}) {
  const listingId = Array.isArray(params.listingId) ? params.listingId[0] : params.listingId;
  const listing = listingId ? await loadListing(listingId) : null;

  if (!listing) {
    notFound();
  }

  const coverImage = listing.images?.[0]?.url;
  const galleryImages = listing.images?.slice(1) ?? [];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10">
      <Link
        href="/listings"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100/50">
        {coverImage ? (
          <div className="relative h-80 w-full bg-slate-100">
            <Image
              src={coverImage}
              alt={listing.title}
              fill
              priority
              sizes="(min-width: 768px) 900px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-80 w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 text-sm font-semibold uppercase tracking-wide text-slate-500">
            No image available
          </div>
        )}

        <div className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-900">{listing.property_type}</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">{listing.listing_type}</span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600">#{listing.id.slice(0, 8)}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
            <p className="text-base text-slate-700">
              {listing.description ?? "This listing does not include a description yet."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asking price</p>
              <p className="text-2xl font-bold text-slate-900">{formatPrice(listing.price, listing.currency)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <MapPin className="h-5 w-5 text-slate-500" />
                {listing.city}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <Home className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Property type</p>
                <p className="text-sm font-semibold text-slate-900">{listing.property_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <SquareStack className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Listing type</p>
                <p className="text-sm font-semibold text-slate-900">{listing.listing_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <Ruler className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Area</p>
                <p className="text-sm font-semibold text-slate-900">{listing.area_sqm} sqm</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <CalendarClock className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Listed on</p>
                <p className="text-sm font-semibold text-slate-900">{formatDate(listing.created_at)}</p>
              </div>
            </div>
          </div>

          {galleryImages.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Gallery</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-40 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
                  >
                    <Image
                      src={image.url}
                      alt={`${listing.title} image`}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </main>
  );
}
