"use client";

import { useMemo, useState } from "react";
import RecommendationCard from "@/components/RecommendationCard";
import type { Recommendation } from "@/lib/recommendations";

type RecommendationSearchProps = {
  recommendations: Recommendation[];
  categories: string[];
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getSearchText(recommendation: Recommendation) {
  return [
    recommendation.title,
    recommendation.description,
    recommendation.category ?? "",
    stripHtml(recommendation.contentHtml),
  ]
    .join(" ")
    .toLowerCase();
}

export default function RecommendationSearch({
  recommendations,
  categories,
}: RecommendationSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const searchableRecommendations = useMemo(
    () =>
      recommendations.map((recommendation) => ({
        recommendation,
        searchText: getSearchText(recommendation),
      })),
    [recommendations],
  );

  const filteredRecommendations = useMemo(() => {
    return searchableRecommendations
      .filter(({ recommendation, searchText }) => {
        const matchesQuery =
          !normalizedQuery || searchText.includes(normalizedQuery);
        const matchesCategory =
          !selectedCategory || recommendation.category === selectedCategory;

        return matchesQuery && matchesCategory;
      })
      .map(({ recommendation }) => recommendation);
  }, [normalizedQuery, searchableRecommendations, selectedCategory]);

  return (
    <section className="mt-12">
      <div className="rounded-[1.25rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] p-3 shadow-sm sm:p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                selectedCategory
                  ? "border-[#5c4a3d]/20 text-[#5c4a3d] hover:bg-[#5c4a3d]/8"
                  : "border-[#5c4a3d] bg-[#5c4a3d] text-[#fdfaf6]"
              }`}
            >
              Sve
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === category
                    ? "border-[#5c4a3d] bg-[#5c4a3d] text-[#fdfaf6]"
                    : "border-[#5c4a3d]/20 text-[#5c4a3d] hover:bg-[#5c4a3d]/8"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex-1">
              <span className="sr-only">Pretraži preporuke</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pretraži preporuke..."
                className="min-h-12 w-full rounded-lg border border-[#5c4a3d]/20 bg-[#f4efe6] px-4 py-3 text-base text-[#4a382b] outline-none transition-shadow placeholder:text-[#5c4a3d]/45 focus:ring-4 focus:ring-[#5c4a3d]/15"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
              <p className="text-sm font-semibold text-[#5c4a3d]/65">
                {filteredRecommendations.length} / {recommendations.length}{" "}
                preporuka
              </p>
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="min-h-11 rounded-lg border border-[#5c4a3d]/25 px-4 py-2 text-sm font-semibold text-[#5c4a3d] transition-colors hover:bg-[#5c4a3d]/8"
                >
                  Očisti
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {filteredRecommendations.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-7 lg:grid-cols-3">
          {filteredRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              delay={(index % 3) * 0.08}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.5rem] border border-[#5c4a3d]/10 bg-[#fdfaf6] p-6 text-center sm:p-10">
          <h2 className="font-serif text-2xl text-[#4a382b] sm:text-3xl">
            Nema pronađenih preporuka.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#5c4a3d]/75">
            Probajte drugu reč, kategoriju ili deo teksta koji tražite.
          </p>
        </div>
      )}
    </section>
  );
}
