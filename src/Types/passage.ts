export interface Passage {
  title: string;
  author: string;
  category: string;
  image: string;
  text: string;
}

export interface Alphabet {
  letter: string;
}

export interface Contrasts {
  phoneme: string;
  ipa: string;
  words: string[];
}

export interface Word {
  letter: string;
  contrasts: Contrasts[];
}

export interface ReadingMaterialData {
  Alphabet: Alphabet[];
  Passages: Passage[];
  Words: Word[];
}

// Union type for reading material
export type ReadingMaterial = Passage | Alphabet | Word;

// Type guard functions
export function isPassage(material: ReadingMaterial): material is Passage {
  return (material as Passage).title !== undefined;
}

// Check that it has letter BUT NO contrasts (to distinguish from Word)
export function isAlphabet(material: ReadingMaterial): material is Alphabet {
  return (
    (material as Alphabet).letter !== undefined && 
    (material as Word).contrasts === undefined
  );
}

// Check that it has letter and contrasts
export function isWords(material: ReadingMaterial): material is Word {
  const hasLetter = (material as Word).letter !== undefined;
  const hasContrasts = (material as Word).contrasts !== undefined;
  return hasLetter && hasContrasts;
}