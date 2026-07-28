"use client";

import { useEffect } from "react";

export function HideScrollbar() {
  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");
    return () => document.documentElement.classList.remove("no-scrollbar");
  }, []);

  return null;
}
