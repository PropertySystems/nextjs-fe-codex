import Link from "next/link";
import { ArrowRight, Compass, Home as HomeIcon, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    title: "Smart property search",
    description: "Filter by location, price, and amenities to surface listings that match perfectly.",
    icon: Compass,
  },
  {
    title: "Built for teams",
    description: "Invite collaborators, share briefs, and keep deal notes organized in one place.",
    icon: Sparkles,
  },
  {
    title: "Transparent transactions",
    description: "Stay informed with timeline updates, document tracking, and secure messaging.",
    icon: ShieldCheck,
  },
];

const neighborhoods = [
  {
    name: "Waterfront Estates",
    detail: "Luxury homes with skyline views, private docks, and curated amenities.",
    badge: "Premium",
  },
  {
    name: "Innovation District",
    detail: "Modern lofts surrounded by co-working spaces, transit, and dining destinations.",
    badge: "Urban",
  },
  {
    name: "Garden Quarter",
    detail: "Townhomes and cottages tucked into green lanes, parks, and community hubs.",
    badge: "Family",
  },
];

const steps = [
  {
    title: "Browse listings",
    detail: "Search curated properties across residential, commercial, and investment segments.",
  },
  {
    title: "Shortlist with context",
    detail: "Save favorites, compare notes, and share collections with your team in seconds.",
  },
  {
    title: "Publish your next listing",
    detail: "Highlight key details, add media, and launch to motivated buyers with one click.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-20 pt-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-10 shadow-sm">
        <div className="absolute inset-x-10 top-10 h-44 rounded-full bg-gradient-to-r from-slate-900/10 via-blue-500/10 to-emerald-400/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              PropertySystems
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Real estate, reimagined for modern teams.
              </h1>
              <p className="text-lg text-slate-600">
                Discover properties, publish listings, and manage every conversation without leaving your workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Browse Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Create Listing
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-slate-700 sm:max-w-lg">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_25px_-25px_rgba(0,0,0,0.35)]">
                <div className="text-2xl font-semibold text-slate-900">5k+</div>
                <p className="text-slate-600">active buyers and renters</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_25px_-25px_rgba(0,0,0,0.35)]">
                <div className="text-2xl font-semibold text-slate-900">2.5x</div>
                <p className="text-slate-600">faster time-to-list</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_25px_-25px_rgba(0,0,0,0.35)]">
                <div className="text-2xl font-semibold text-slate-900">24/7</div>
                <p className="text-slate-600">supportive deal desk</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_35px_120px_-60px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-blue-100/60 via-emerald-50 to-white" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                  <HomeIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Handpicked listings</p>
                  <p className="text-sm text-slate-600">Stay ahead with curated market drops weekly.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Neighborhood insights</p>
                  <p className="text-sm text-slate-600">Explore schools, commute, and lifestyle data instantly.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Verified partners</p>
                  <p className="text-sm text-slate-600">Work with vetted agents, lenders, and inspectors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Capabilities</p>
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to move quickly.</h2>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700"
          >
            Explore listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Neighborhoods</p>
            <h2 className="text-3xl font-bold text-slate-900">Find the right fit for every lifestyle.</h2>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700"
          >
            View all markets
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {neighborhoods.map((place) => (
            <div
              key={place.name}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{place.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                  {place.badge}
                </span>
              </div>
              <p className="text-sm text-slate-600">{place.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Get started</p>
            <h2 className="text-3xl font-bold text-slate-900">List faster. Close smarter.</h2>
            <p className="text-slate-600">
              PropertySystems keeps your team aligned from the first inquiry to closing day. Automate the busywork and focus on
              building relationships that move deals forward.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Publish a listing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div className="mt-3 space-y-2">
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 pt-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-semibold text-white">
              PS
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">PropertySystems</p>
              <p className="text-sm text-slate-600">Homes, rentals, and spaces built for possibility.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
            <Link href="/listings" className="transition hover:text-slate-950">
              Listings
            </Link>
            <Link href="/listings/create" className="transition hover:text-slate-950">
              Create Listing
            </Link>
            <Link href="/dashboard" className="transition hover:text-slate-950">
              Dashboard
            </Link>
            <Link href="/login" className="transition hover:text-slate-950">
              Login
            </Link>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500">© {new Date().getFullYear()} PropertySystems. Crafted for modern real estate teams.</p>
      </footer>
    </main>
  );
}
