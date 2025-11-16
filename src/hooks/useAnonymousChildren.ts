import { useState, useEffect } from 'react';

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
  needs_json?: any;
  isAnonymous?: false;
}

export type Child = AnonymousChild | DatabaseChild;

const STORAGE_KEY = 'anonymous_children';

export const useAnonymousChildren = () => {
  const [anonymousChildren, setAnonymousChildren] = useState<AnonymousChild[]>([]);

  // Charger les enfants anonymes depuis le localStorage
  useEffect(() => {
    const loadAnonymousChildren = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const children = JSON.parse(stored) as AnonymousChild[];
          setAnonymousChildren(children);
        }
      } catch (error) {
        console.error('Error loading anonymous children:', error);
      }
    };

    loadAnonymousChildren();
  }, []);

  // Ajouter un enfant anonyme
  const addAnonymousChild = (child: Omit<AnonymousChild, 'id' | 'isAnonymous'>) => {
    const newChild: AnonymousChild = {
      ...child,
      id: `anonymous-${Date.now()}`,
      isAnonymous: true
    };

    const updated = [...anonymousChildren, newChild];
    setAnonymousChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    return newChild;
  };

  // Supprimer un enfant anonyme
  const removeAnonymousChild = (id: string) => {
    const updated = anonymousChildren.filter(child => child.id !== id);
    setAnonymousChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Nettoyer tous les enfants anonymes
  const clearAnonymousChildren = () => {
    setAnonymousChildren([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    anonymousChildren,
    addAnonymousChild,
    removeAnonymousChild,
    clearAnonymousChildren
  };
};
