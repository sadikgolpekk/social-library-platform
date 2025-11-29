// src/bilesenler/OzelRota.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useKimlik } from "../baglam/KimlikBaglami";

// Bu bileşen, sadece giriş yapılmış kullanıcıların erişebileceği sayfalar için kullanılır.
export default function OzelRota({ children }) {
  const { kullanici } = useKimlik();

  // Eğer kullanıcı yoksa giriş sayfasına yönlendir
  if (!kullanici) {
    return <Navigate to="/" replace />;
  }

  // Kullanıcı varsa alt sayfayı (children) göster
  return children;
}
