"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string, initialValue = false) {
  const [matches, setMatches] = useState(initialValue);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
