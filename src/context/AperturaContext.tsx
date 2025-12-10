import React, { createContext, useContext, useState } from 'react';

export type DatosUnidad = {
  tipoUnidad: string;
  ruta: string;
  economico: string;
  tarjeton: string;
  nombre: string;
};

type AperturaContextType = {
  datos: DatosUnidad[];
  agregarDato: (nuevoDato: DatosUnidad) => void;
};

const AperturaContext = createContext<AperturaContextType | undefined>(undefined);

export const AperturaProvider = ({ children }: { children: React.ReactNode }) => {
  const [datos, setDatos] = useState<DatosUnidad[]>([]);

  const agregarDato = (nuevoDato: DatosUnidad) => {
    setDatos(prev => [...prev, nuevoDato]);
  };

  return (
    <AperturaContext.Provider value={{ datos, agregarDato }}>
      {children}
    </AperturaContext.Provider>
  );
};

export const useApertura = () => {
  const context = useContext(AperturaContext);
  if (!context) throw new Error('useApertura must be used within AperturaProvider');
  return context;
};
