import React from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  // Don't show any offline indicator
  return null;
}
