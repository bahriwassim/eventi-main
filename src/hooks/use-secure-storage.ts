import { useState, useEffect } from 'react';

// Hook sécurisé pour gérer le localStorage avec validation
export function useSecureStorage(key: string, defaultValue: string | null = null) {
  const [value, setValue] = useState<string | null>(defaultValue);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Vérifier si localStorage est disponible et sécurisé
    const checkLocalStorage = () => {
      try {
        // Test de disponibilité
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        // Vérifier le contexte (éviter http non sécurisé)
        const isSecureContext = window.isSecureContext;
        const isHTTPS = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost';
        
        if (!isSecureContext && !isHTTPS && !isLocalhost) {
          console.warn('localStorage non sécurisé dans ce contexte');
          return false;
        }
        
        return true;
      } catch (error) {
        console.warn('localStorage non disponible:', error);
        return false;
      }
    };

    const available = checkLocalStorage();
    setIsAvailable(available);

    if (available) {
      try {
        const storedValue = localStorage.getItem(key);
        if (storedValue !== null) {
          setValue(storedValue);
        }
      } catch (error) {
        console.warn('Erreur lors de la lecture du localStorage:', error);
      }
    }
  }, [key]);

  const setSecureValue = (newValue: string | null) => {
    if (!isAvailable) {
      console.warn('localStorage non disponible, valeur non enregistrée');
      return;
    }

    try {
      if (newValue === null) {
        localStorage.removeItem(key);
      } else {
        // Valider la valeur avant de la stocker
        if (typeof newValue !== 'string' || newValue.length > 1000) {
          throw new Error('Valeur invalide pour le stockage');
        }
        localStorage.setItem(key, newValue);
      }
      setValue(newValue);
    } catch (error) {
      console.warn('Erreur lors de l\'écriture dans localStorage:', error);
    }
  };

  const removeSecureValue = () => {
    if (!isAvailable) {
      console.warn('localStorage non disponible');
      return;
    }

    try {
      localStorage.removeItem(key);
      setValue(null);
    } catch (error) {
      console.warn('Erreur lors de la suppression du localStorage:', error);
    }
  };

  return {
    value,
    setValue: setSecureValue,
    removeValue: removeSecureValue,
    isAvailable
  };
}