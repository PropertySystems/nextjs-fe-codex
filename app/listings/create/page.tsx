"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ImageIcon, Loader2, UploadCloud } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { API_BASE_URL, fetchWithError } from "@/lib/api";

type ListingFormState = {
  title: string;
  description: string;
  propertyType: "apartment" | "house" | "land" | "office";
  listingType: "sale" | "rent";
  price: string;
  currency: string;
  city: string;
  areaSqm: string;
  rooms: string;
};

type ListingResponse = {
  id: string;
  title: string;
};

type UploadStatus = "pending" | "uploading" | "complete" | "error";

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

const propertyTypeOptions: ListingFormState["propertyType"][] = [
  "apartment",
  "house",
  "land",
  "office",
];

const listingTypeOptions: ListingFormState["listingType"][] = ["sale", "rent"];

const initialFormState: ListingFormState = {
  title: "",
  description: "",
  propertyType: "apartment",
  listingType: "sale",
  price: "",
  currency: "USD",
  city: "",
  areaSqm: "",
  rooms: "",
};

export default function CreateListingPage() {
  const { token, user, loading } = useAuth();

  const [form, setForm] = useState<ListingFormState>(initialFormState);
  const [images, setImages] = useState<File[]>([]);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadStatus>>({});
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [createdTitle, setCreatedTitle] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setImages(selectedFiles);
    setUploadStates({});
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    const priceValue = Number(form.price);
    const areaValue = Number(form.areaSqm);
    const roomsValue = Number(form.rooms);
    const currencyValue = form.currency.trim().toUpperCase();

    if (!form.title.trim()) return { valid: false, error: "Title is required." };
    if (!form.city.trim()) return { valid: false, error: "City is required." };

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      return { valid: false, error: "Price must be a positive number." };
    }

    if (!Number.isFinite(areaValue) || areaValue <= 0) {
      return { valid: false, error: "Area (sqm) must be greater than zero." };
    }

    if (!Number.isInteger(roomsValue) || roomsValue < 0) {
      return { valid: false, error: "Rooms must be zero or a positive whole number." };
    }

    if (currencyValue.length !== 3) {
      return { valid: false, error: "Currency must be a 3-letter code (e.g., USD)." };
    }

    return { valid: true };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage({ type: "error", text: "Please log in to create a listing." });
      return;
    }

    const validation = validateForm();
    if (!validation.valid) {
      setMessage({ type: "error", text: validation.error ?? "Invalid form data." });
      return;
    }

    setSubmitting(true);
    setUploadStates({});

    const priceValue = Number(form.price);
    const areaValue = Number(form.areaSqm);
    const roomsValue = Number(form.rooms);
    const currencyValue = form.currency.trim().toUpperCase();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      property_type: form.propertyType,
      listing_type: form.listingType,
      price: priceValue,
      currency: currencyValue,
      city: form.city.trim(),
      area_sqm: areaValue,
      rooms: roomsValue,
    };

    try {
      const listing = await fetchWithError<ListingResponse>(`${API_BASE_URL}/api/v1/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setCreatedListingId(listing.id);
      setCreatedTitle(listing.title);

      if (images.length === 0) {
        setMessage({ type: "success", text: "Listing created successfully." });
        setForm(initialFormState);
        return;
      }

      const initialStates: Record<string, UploadStatus> = Object.fromEntries(
        images.map((file) => [file.name, "pending" as UploadStatus]),
      );
      setUploadStates(initialStates);

      const uploadErrors: string[] = [];

      for (const file of images) {
        setUploadStates((prev) => ({ ...prev, [file.name]: "uploading" }));
        const formData = new FormData();
        formData.append("file", file);

        try {
          await fetchWithError(`${API_BASE_URL}/api/v1/listings/${listing.id}/images`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          setUploadStates((prev) => ({ ...prev, [file.name]: "complete" }));
        } catch (error) {
          uploadErrors.push(`${file.name}: ${error instanceof Error ? error.message : "Upload failed"}`);
          setUploadStates((prev) => ({ ...prev, [file.name]: "error" }));
        }
      }

      if (uploadErrors.length) {
        setMessage({
          type: "error",
          text: `Listing created, but some images failed: ${uploadErrors.join("; ")}`,
        });
      } else {
        setMessage({ type: "success", text: "Listing and images uploaded successfully." });
        setForm(initialFormState);
        setImages([]);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create the listing.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-12">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Create listing</p>
        <h1 className="text-3xl font-bold text-slate-900">Publish a property with images</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Provide the required listing details defined by the backend specification, then attach high-quality images to
          showcase the space. Listings and media uploads require authentication.
        </p>
        {!isAuthenticated && !loading ? (
          <p className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            <AlertCircle className="h-4 w-4" />
            You need to be logged in to publish a listing. <Link href="/login" className="underline">Log in</Link> or{" "}
            <Link href="/register" className="underline">create an account</Link>.
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-900">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Modern loft near downtown"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-semibold text-slate-900">
                City
              </label>
              <input
                id="city"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="San Francisco"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-900">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Highlight the layout, nearby amenities, and standout finishes."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="propertyType" className="text-sm font-semibold text-slate-900">
                Property type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {propertyTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="listingType" className="text-sm font-semibold text-slate-900">
                Listing type
              </label>
              <select
                id="listingType"
                name="listingType"
                value={form.listingType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {listingTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "sale" ? "For sale" : "For rent"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-semibold text-slate-900">
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                maxLength={3}
                value={form.currency}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold text-slate-900">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="areaSqm" className="text-sm font-semibold text-slate-900">
                Area (sqm)
              </label>
              <input
                id="areaSqm"
                name="areaSqm"
                type="number"
                min="1"
                step="1"
                required
                value={form.areaSqm}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="rooms" className="text-sm font-semibold text-slate-900">
                Rooms
              </label>
              <input
                id="rooms"
                name="rooms"
                type="number"
                min="0"
                step="1"
                required
                value={form.rooms}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ImageIcon className="h-4 w-4" />
              Upload listing images
            </div>
            <p className="text-sm text-slate-600">
              Attach clear photos to help buyers and renters evaluate the property. You can add multiple images and they will
              be uploaded after the listing is created.
            </p>
            <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              <UploadCloud className="h-5 w-5 text-slate-700" />
              <span>Select images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-xs font-normal text-slate-500">JPG, PNG, or WebP up to 10MB each</span>
            </label>
            {images.length > 0 ? (
              <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                {images.map((file) => (
                  <div key={file.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-slate-500">{Math.round(file.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No images selected yet.</p>
            )}
            {Object.keys(uploadStates).length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload progress</p>
                <div className="space-y-2">
                  {Object.entries(uploadStates).map(([name, status]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                    >
                      <span className="truncate">{name}</span>
                      <span className="flex items-center gap-1 text-xs font-semibold">
                        {status === "uploading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {status === "complete" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : null}
                        {status === "error" ? <AlertCircle className="h-3.5 w-3.5 text-red-600" /> : null}
                        <span className={
                          status === "complete"
                            ? "text-emerald-700"
                            : status === "error"
                              ? "text-red-700"
                              : "text-slate-700"
                        }>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {message ? (
            <p
              className={
                "rounded-lg px-3 py-2 text-sm font-semibold " +
                (message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700")
              }
            >
              {message.text}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !isAuthenticated}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Publishing..." : "Publish listing"}
            </button>
            {createdListingId ? (
              <Link
                href={`/listings/${createdListingId}`}
                className="text-sm font-semibold text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                View created listing
              </Link>
            ) : null}
          </div>
        </form>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Backend specification</p>
            <h2 className="text-xl font-bold text-slate-900">What this form sends</h2>
            <p className="text-sm text-slate-600">
              The payload follows the <code className="rounded bg-slate-100 px-1 py-0.5">ListingCreate</code> schema from the
              API: title, property_type, listing_type, price, currency (3-letter), city, area_sqm, rooms, and an optional
              description.
            </p>
          </div>
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Requires bearer token authentication.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Creates the listing via POST /api/v1/listings.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Uploads each image via POST /api/v1/listings/&#123;listing_id&#125;/images.</span>
            </div>
          </div>
          {createdListingId && createdTitle ? (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Listing created
              </p>
              <p className="font-semibold">{createdTitle}</p>
              <p className="text-xs text-emerald-700">ID: {createdListingId}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
