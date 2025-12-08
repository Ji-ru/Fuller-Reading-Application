export interface Passage {
  title: string;
  author: string;
  category: string;
  image: string;
  text: string;
}

export interface AlphabetItem {
  letter: string;
  word: string;
  example: string;
}

export interface ReadingMaterialData {
  Alphabet: AlphabetItem[];
  Passages: Passage[];
}

// Union type for reading material
export type ReadingMaterial = Passage | AlphabetItem;

// Type guard functions
export function isPassage(material: ReadingMaterial): material is Passage {
  return (material as Passage).title !== undefined;
}

export function isAlphabet(material: ReadingMaterial): material is AlphabetItem {
  return (material as AlphabetItem).letter !== undefined;
}