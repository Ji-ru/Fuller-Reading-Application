import { useState, useEffect } from 'react';
import { GetAllPassages } from '../../Controller/AuthenticationController';
import { Passage } from '../../Interfaces/passage';

export const useAllPassages = () => {
  const [dynamicPassages, setDynamicPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassages = async () => {
      try {
        setLoading(true);
        const fetchedPassageDocs = await GetAllPassages();

        // Map the PassageDocument objects to the Passage interface structure
        const mappedPassages: Passage[] = fetchedPassageDocs.map(doc => ({
          title: doc.title,
          author: doc.author || 'Unknown',
          category: 'All Grades',
          image: '', // Dynamically fetched passages won't have an image
          text: doc.passageText,
        }));

        setDynamicPassages(mappedPassages);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch passages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPassages();
  }, []);

  return { dynamicPassages, loading, error };
};
