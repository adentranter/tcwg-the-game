"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3010] text-[var(--tcwg-orange)] font-[family-name:var(--font-orbitron)]">
      <div className="text-center">
        <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="border border-[var(--tcwg-orange)] text-[var(--tcwg-orange)] px-4 py-2 text-sm hover:bg-[var(--tcwg-orange)]/10"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
