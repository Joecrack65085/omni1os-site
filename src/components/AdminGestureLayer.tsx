"use client";

import { useRef, useState } from "react";
import AdminLoginModal from "./AdminLoginModal";

const TAPS_REQUIRED = 7;
const RESET_AFTER_MS = 2500;

export default function AdminGestureLayer({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);
  const tapCount = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function registerTap() {
    tapCount.current += 1;

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, RESET_AFTER_MS);

    if (tapCount.current >= TAPS_REQUIRED) {
      tapCount.current = 0;
      setShowLogin(true);
    }
  }

  return (
    // Deliberately no visual affordance here — this is a hidden entry
    // point, so no aria-label / role that would announce "admin login" to
    // assistive tech or anyone reading the DOM. It sits underneath the
    // whole page and simply counts clicks.
    <div onClick={registerTap}>
      {children}
      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
