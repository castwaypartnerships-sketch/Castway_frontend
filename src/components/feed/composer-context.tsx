"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ComposerContextValue {
  isOpen: boolean;
  openComposer: () => void;
  closeComposer: () => void;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);

/** Shares the "new post" composer's open state across the app shell — the
 * topbar's global Create button and the Feed page's own composer-trigger
 * row both need to open the same dialog, even though they live in
 * different parts of the tree and the dialog itself must stay mounted once
 * (not per-page) so Create works from any route. */
export function ComposerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ComposerContext.Provider
      value={{
        isOpen,
        openComposer: () => setIsOpen(true),
        closeComposer: () => setIsOpen(false),
      }}
    >
      {children}
    </ComposerContext.Provider>
  );
}

export function useComposer(): ComposerContextValue {
  const context = useContext(ComposerContext);
  if (!context) throw new Error("useComposer must be used within a ComposerProvider");
  return context;
}
