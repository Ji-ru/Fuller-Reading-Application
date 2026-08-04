import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';

export async function batchGetDocsByStudentIds(
  collectionName: string,
  studentIds: string[],
  extraConstraints: any[] = [],
): Promise<any[]> {
  if (studentIds.length === 0) return [];
  const db = getFirestore();
  const chunkSize = 30;
  const chunks: string[][] = [];

  for (let i = 0; i < studentIds.length; i += chunkSize) {
    chunks.push(studentIds.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map(chunk =>
      getDocs(
        query(
          collection(db, collectionName),
          where('studentId', 'in', chunk),
          ...extraConstraints,
        ),
      ),
    ),
  );

  return results.flatMap((snap: any) => snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
}
