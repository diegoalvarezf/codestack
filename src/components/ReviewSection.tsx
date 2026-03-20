"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  author: string;
  createdAt: string;
}

export function ReviewSection({
  slug,
  initialReviews,
  avgRating,
}: {
  slug: string;
  initialReviews: Review[];
  avgRating?: number;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAvg =
    reviews.length
      ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
      : avgRating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!author.trim()) { setError("Please enter your name"); return; }

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/servers/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment.trim() || undefined, author: author.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Failed to submit review"); return; }

    setReviews((prev) => [{ ...data.review, createdAt: new Date().toISOString() }, ...prev]);
    setShowForm(false);
    setRating(0);
    setAuthor("");
    setComment("");
  }

  return (
    <section className="mt-12 pt-10 border-t border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold">Reviews</h2>
          {currentAvg && reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(currentAvg)} readonly size="sm" />
              <span className="text-sm text-gray-400">
                {currentAvg} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Write a review
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rating</label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Your name</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="github-username"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Comment <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Submitting..." : "Submit review"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              className="text-sm text-gray-400 hover:text-white px-4 py-2.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No reviews yet.{" "}
          <button onClick={() => setShowForm(true)} className="text-blue-400 hover:underline">
            Be the first!
          </button>
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{review.author}</span>
                  <StarRating value={review.rating} readonly size="sm" />
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-400 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
