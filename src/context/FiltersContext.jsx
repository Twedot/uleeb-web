import { createContext, useContext, useState } from 'react';

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [selectedStates, setSelectedStates] = useState([]);
  const [allNigeria, setAllNigeria] = useState(false);
  // Pro-only — everyone else is locked server-side to their own account
  // country. undefined = "use my account's country".
  const [selectedCountry, setSelectedCountry] = useState(undefined);

  return (
    <FiltersContext.Provider
      value={{ selectedStates, allNigeria, setSelectedStates, setAllNigeria, selectedCountry, setSelectedCountry }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}
