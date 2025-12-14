import { useState, useEffect, useCallback } from 'react';
import { getSecureItem, setSecureItem, removeSecureItem } from '@/lib/secureStorage';

export interface AnonymousChild {
  id: string;
  first_name: string;
  dob: string;
  isAnonymous: true;
}

export interface DatabaseChild {
  id: string;
  first_name: string;
  dob: string;
  needs_json?: unknown;
  isAnonymous?: false;
}

export type Child = AnonymousChild | DatabaseChild;

const STORAGE_KEY = 'anonymous_children';

export const useAnonymousChildren = () => {
  const [anonymousChildren, setAnonymousChildren] = useState<AnonymousChild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les enfants anonymes depuis le stockage sécurisé
  useEffect(() => {
    const loadAnonymousChildren = async () => {
      try {
        const children = await getSecureItem<AnonymousChild[]>(STORAGE_KEY);
        if (children) {
          setAnonymousChildren(children);
        }
      } catch (error) {
        console.error('Error loading anonymous children:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnonymousChildren();
  }, []);

  // Sauvegarder de manière sécurisée
  const saveChildren = useCallback(async (children: AnonymousChild[]) => {
    try {
      await setSecureItem(STORAGE_KEY, children);
    } catch (error) {
      console.error('Error saving anonymous children:', error);
    }
  }, []);

  // Ajouter un enfant anonyme
  const addAnonymousChild = useCallback(async (child: Omit<AnonymousChild, 'id' | 'isAnonymous'>) => {
    const newChild: AnonymousChild = {
      ...child,
      id: `anonymous-${Date.now()}`,
      isAnonymous: true
    };

    const updated = [...anonymousChildren, newChild];
    setAnonymousChildren(updated);
    await saveChildren(updated);

    return newChild;
  }, [anonymousChildren, saveChildren]);

  // Supprimer un enfant anonyme
  const removeAnonymousChild = useCallback(async (id: string) => {
    const updated = anonymousChildren.filter(child => child.id !== id);
    setAnonymousChildren(updated);
    await saveChildren(updated);
  }, [anonymousChildren, saveChildren]);

  // Nettoyer tous les enfants anonymes
  const clearAnonymousChildren = useCallback(() => {
    setAnonymousChildren([]);
    removeSecureItem(STORAGE_KEY);
  }, []);

  return {
    anonymousChildren,
    isLoading,
    addAnonymousChild,
    removeAnonymousChild,
    clearAnonymousChildren
  };
};
