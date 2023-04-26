type SnapshotLike = {
  data: (...args: any[]) => any;
  exists: boolean | (() => boolean);
  ref: {
    id: string;
  };
};

type WithId<T> = T extends { id: string } ? T : { id: string } & T;

/**
 * Takes snapshot.data() and attaches id. If snapshot is
 * empty returns null.
 */
export function firestoreSnapshotToData<T = any>(
  docSnapshot: SnapshotLike
): WithId<T> | null {
  const data = docSnapshot.data() as T | undefined;

  if (
    !(typeof docSnapshot.exists === 'boolean'
      ? docSnapshot.exists
      : docSnapshot.exists()) ||
    !data
  ) {
    return null;
  }

  return {
    ...data,
    id: docSnapshot.ref.id
  } as WithId<T>;
}
/**
 * Maps each snapshot to snapshot.data() with id field attached.
 */
export function firestoreSnapshotListToData<T = any>(
  snapshots: SnapshotLike[]
): WithId<T>[] {
  return snapshots.map((d) => firestoreSnapshotToData<T>(d)!);
}

export const getTimestamp = (date?: Date) => (date ?? new Date()).toISOString();

type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'
  | 'not-in';

export type WhereClause<T extends string> = [T, WhereFilterOp, any];
