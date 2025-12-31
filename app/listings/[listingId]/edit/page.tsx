"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

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

type ListingRead = {
  id: string;
  title: string;
  description: string | null;
  property_type: ListingFormState["propertyType"];
  listing_type: ListingFormState["listingType"];
  price: number;
  currency: string;
  city: string;
  area_sqm: number;
  rooms: number;
  user_id: string;
};

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

export default function EditListingPage() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const listingId = Array.isArray(params.listingId) ? params.listingId[0] : params.listingId;
  const { token, user } = useAuth();

  const [form, setForm] = useState<ListingFormState>(initialFormState);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [listingOwnerId, setListingOwnerId] = useState<string | null>(null);

  const canManage = useMemo(() => {
    if (!user) return false;
    if (["admin", "moderator"].includes(user.role ?? "")) return true;
    return listingOwnerId === user.id;
  }, [listingOwnerId, user]);

  useEffect(() => {
    if (!listingId) return;
    const controller = new AbortController();

    const loadListing = async () => {
      setLoading(true);
      try {
        const listing = await fetchWithError<ListingRead>(
          `${API_BASE_URL}/api/v1/listings/${listingId}`,
          {
            signal: controller.signal,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        setForm({
          title: listing.title,
          description: listing.description ?? "",
          propertyType: listing.property_type,
          listingType: listing.listing_type,
          price: listing.price.toString(),
          currency: listing.currency,
          city: listing.city,
          areaSqm: listing.area_sqm.toString(),
          rooms: listing.rooms.toString(),
        });
        setListingOwnerId(listing.user_id);
        setStatus(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus({
          type: "error",
          text: error instanceof Error ? error.message : "Unable to load listing.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadListing();

    return () => controller.abort();
  }, [listingId, token]);

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
    setStatus(null);

    if (!listingId) return;

    if (!token) {
      setStatus({ type: "error", text: "Please log in to update a listing." });
      return;
    }

    if (!canManage) {
      setStatus({ type: "error", text: "You do not have permission to edit this listing." });
      return;
    }

    const validation = validateForm();
    if (!validation.valid) {
      setStatus({ type: "error", text: validation.error ?? "Invalid form data." });
      return;
    }

    setSaving(true);

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
      await fetchWithError(`${API_BASE_URL}/api/v1/listings/${listingId}` as const, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setStatus({ type: "success", text: "Listing updated successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update listing.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setStatus(null);

    if (!listingId) return;

    if (!token) {
      setStatus({ type: "error", text: "Please log in to delete a listing." });
      return;
    }

    if (!canManage) {
      setStatus({ type: "error", text: "You do not have permission to delete this listing." });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await fetchWithError(`${API_BASE_URL}/api/v1/listings/${listingId}` as const, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatus({ type: "success", text: "Listing deleted. Redirecting to listings..." });
      router.push("/listings");
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete listing.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formDisabled = saving || deleting || !token || !canManage;

  if (loading) {
    return (
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-16 pt-12">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading listing...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-16 pt-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Edit listing</p>
          <h1 className="text-3xl font-bold text-slate-900">Update your property details</h1>
          <p className="text-sm text-slate-600">
            Modify the listing information, price, and availability. Changes are synced with the latest backend specification.
          </p>
        </div>
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
      </div>

      {status ? (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>{status.text}</span>
        </div>
      ) : null}

      {!canManage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          You do not have permission to modify this listing. Please contact an administrator.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="Modern apartment in the city center"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-900">
            City
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="San Francisco"
              required
            />
          </label>
        </div>

        <label className="space-y-1 text-sm font-semibold text-slate-900">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            disabled={formDisabled}
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            placeholder="Highlight the key selling points of the property."
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Property type
            <select
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {propertyTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Listing type
            <select
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {listingTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Price
            <input
              name="price"
              type="number"
              min={0}
              value={form.price}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="250000"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Currency
            <input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="USD"
              maxLength={3}
              minLength={3}
              required
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Rooms
            <input
              name="rooms"
              type="number"
              min={0}
              value={form.rooms}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="3"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Area (sqm)
            <input
              name="areaSqm"
              type="number"
              min={1}
              value={form.areaSqm}
              onChange={handleChange}
              disabled={formDisabled}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="85"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-semibold text-slate-900">
            Listing visibility
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Updates will be applied immediately after saving.
            </div>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Authorization</p>
            <p>Only moderators, admins, or the listing owner can update or delete this entry.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={formDisabled}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
            <button
              type="submit"
              disabled={formDisabled}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
