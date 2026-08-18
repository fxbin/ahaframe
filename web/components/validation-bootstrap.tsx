"use client";

import { useEffect } from "react";
import { getValidationContext } from "@/lib/validation-context";

export function ValidationBootstrap() {
  useEffect(() => {
    getValidationContext();
  }, []);

  return null;
}
