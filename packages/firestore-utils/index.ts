type SnapshotLike = {
  data: (...args: any[]) => any;
  exists: boolean;
  ref: {
    id: string;
  };
};

/**
 * Takes snapshot.data() and attaches id. If snapshot is
 * empty returns null.
 */
export function firestoreSnapshotToData<T = any>(
  docSnapshot: SnapshotLike
): T | null {
  const data = docSnapshot.data() as T | undefined;

  if (!docSnapshot.exists || !data) {
    return null;
  }

  return {
    ...data,
    id: docSnapshot.ref.id,
  };
}
