"use client";

import { useEffect, useState } from "react";
import { getLayout, Layout, subscribePreferences } from "./preferences";

export function useLayoutPreference(): Layout {
  const [layout, setLayoutState] = useState<Layout>("tiles");

  useEffect(() => {
    setLayoutState(getLayout());
    return subscribePreferences(() => setLayoutState(getLayout()));
  }, []);

  return layout;
}
