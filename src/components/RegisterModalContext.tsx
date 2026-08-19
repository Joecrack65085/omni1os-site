"use client";

import { createContext, useContext, useState } from "react";
import RegisterSchoolModal from "@/components/RegisterSchoolModal";

interface RegisterModalContextType {
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
}

const RegisterModalContext = createContext<RegisterModalContextType | undefined>(undefined);

export function RegisterModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <RegisterModalContext.Provider
      value={{
        openRegisterModal: () => setIsOpen(true),
        closeRegisterModal: () => setIsOpen(false),
      }}
    >
      {children}
      {isOpen && <RegisterSchoolModal onClose={() => setIsOpen(false)} />}
    </RegisterModalContext.Provider>
  );
}

export function useRegisterModal() {
  const context = useContext(RegisterModalContext);
  if (!context) {
    throw new Error("useRegisterModal must be used within a RegisterModalProvider");
  }
  return context;
}
