export interface Passage {
  title: string;
  author: string;
  category: string;
  image: string;
  text: string;
}

export interface PassagesData {
  Passages: Passage[];
}