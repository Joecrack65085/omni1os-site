"use client";

import FaqAndCta from "@/components/site/FaqAndCta";
import { useRegisterModal } from "@/components/RegisterModalContext";

export default function FaqPage() {
  const { openRegisterModal } = useRegisterModal();

  return (
    <div className="pt-24 pb-12">
      <FaqAndCta onRegisterClick={openRegisterModal} />
    </div>
  );
}
