// src/baglam/KimlikBaglami.js

import React, { createContext, useState, useContext, useEffect } from "react";

const KimlikBaglami = createContext();

export function KimlikSaglayici({ children }) {
  // İlk açılışta localStorage'dan kullanıcı çek
  const [kullanici, setKullanici] = useState(() => {
    const kayitli = localStorage.getItem("aktif_kullanici");
    return kayitli ? JSON.parse(kayitli) : null;
  });

  // Kullanıcı değişirse localStorage'a yaz (kalıcı giriş)
  useEffect(() => {
    if (kullanici) {
      localStorage.setItem("aktif_kullanici", JSON.stringify(kullanici));
    } else {
      localStorage.removeItem("aktif_kullanici");
    }
  }, [kullanici]);

  // Giriş fonksiyonu
  const girisYap = (veri) => {
    setKullanici(veri);
  };

  // Çıkış fonksiyonu
  const cikisYap = () => {
    setKullanici(null);
  };

  return (
    <KimlikBaglami.Provider value={{ kullanici, girisYap, cikisYap }}>
      {children}
    </KimlikBaglami.Provider>
  );
}

export function useKimlik() {
  return useContext(KimlikBaglami);
}
