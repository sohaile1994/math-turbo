import { createContext, useContext, useState } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [config, setConfig] = useState({
    min: 1,
    max: 9,
    operator: "+",
    allowNegatives: false,
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const updateConfig = (patch) =>
    setConfig(prev => ({ ...prev, ...patch }));

  return (
    <MenuContext.Provider value={{
      config,
      updateConfig,
      isMenuOpen,
      setIsMenuOpen
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
