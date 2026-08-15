"use client";

import { useEffect, useState } from "react";

function formatIndianCurrency(amount: number) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr+`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L+`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k+`;
  }
  return `₹${amount}`;
}

export default function TotalLoanTracker() {
  const [formattedAmount, setFormattedAmount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/landing/stats")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.totalActiveLoans) {
          setFormattedAmount(formatIndianCurrency(data.totalActiveLoans));
        } else if (isMounted) {
          setFormattedAmount(formatIndianCurrency(24000000));
        }
      })
      .catch((err) => {
        console.warn("Failed to lazily load active loan stats:", err);
        if (isMounted) {
          setFormattedAmount(formatIndianCurrency(24000000));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !formattedAmount) {
    return (
      <span
        aria-label="Loading active loan total"
        className="inline-block h-4 w-14 animate-pulse rounded-md bg-slate-300/70 align-middle mx-1"
      />
    );
  }

  return (
    <span className="font-medium text-amortix-navy transition-opacity duration-300">
      {formattedAmount}
    </span>
  );
}
