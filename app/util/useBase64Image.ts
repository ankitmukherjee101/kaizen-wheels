"use client";

import { useCallback, useEffect, useState } from "react";

export function useBase64Image(url: string) {
  const [base64String, setBase64String] = useState<string | null>(null);

  const fetchImage = useCallback(async () => {
    const res = await fetch(url);
    const text = await res.text();
    setBase64String(text);
  }, [url]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage, url]);

  return base64String;
}
