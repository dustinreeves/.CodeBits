"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string | null;
  onClear: () => void;
};

export function Toast({ message, onClear }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timeout = setTimeout(() => {
      setVisible(false);
      onClear();
    }, 3200);
    return () => clearTimeout(timeout);
  }, [message, onClear]);

  if (!message || !visible) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
