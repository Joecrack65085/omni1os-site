"use client";

import Hero from "@/components/site/Hero";
import TrustedBy from "@/components/site/TrustedBy";
import StatsBanner from "@/components/site/StatsBanner";
import Testimonials from "@/components/site/Testimonials";
import FaqAndCta from "@/components/site/FaqAndCta";
import { useRegisterModal } from "@/components/RegisterModalContext";

export default function HomePage() {
  const { openRegisterModal } = useRegisterModal();

  return (
    <>
      <Hero />
      <TrustedBy />
      <StatsBanner />
      <Testimonials />
      {/* We leave FaqAndCta here because it contains the main CTA */}
      <FaqAndCta onRegisterClick={openRegisterModal} />
    </>
  );
}
