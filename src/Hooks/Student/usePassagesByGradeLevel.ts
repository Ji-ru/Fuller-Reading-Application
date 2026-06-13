import { useState, useEffect } from 'react';
import { getAuth } from '@react-native-firebase/auth';
import { getUserProfile, GetPassagesByGradeLevel } from '../../Controller/AuthenticationController';
import { Passage } from '../../Interfaces/passage';

export const usePassagesByGradeLevel = () => {
  const [dynamicPassages, setDynamicPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassages = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const profile = await getUserProfile(user.uid);
        
        if (!profile || !profile.studentData || profile.studentData.gradeLevel === undefined) {
          throw new Error('Student grade level not found');
        }

        const gradeLevel = profile.studentData.gradeLevel;
        const fetchedPassageDocs = await GetPassagesByGradeLevel(gradeLevel);

        // Map the PassageDocument objects to the Passage interface structure
        const mappedPassages: Passage[] = fetchedPassageDocs.map(doc => ({
          title: doc.title,
          author: doc.author || 'Unknown',
          category: `Grade ${doc.gradeLevel}`,
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
