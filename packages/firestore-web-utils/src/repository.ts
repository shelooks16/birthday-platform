import type {
  CollectionReference,
  DocumentData,
  Firestore,
  OrderByDirection,
  QueryConstraint
} from 'firebase/firestore';
import {
  firestoreSnapshotToData,
  firestoreSnapshotListToData,
  WithId,
  WithOptionalId,
  WhereClause
} from '@shared/firestore-utils';

export type FirestoreSdk = Pick<
  typeof import('firebase/firestore'),
  | 'doc'
  | 'collection'
  | 'getDoc'
  | 'onSnapshot'
  | 'query'
  | 'where'
  | 'orderBy'
  | 'limit'
  | 'limitToLast'
  | 'getDocs'
  | 'setDoc'
  | 'updateDoc'
  | 'deleteDoc'
>;

export type FindManyWebOptions<FieldType extends string> = {
  where?: WhereClause<FieldType>[];
  orderBy?: {
    [field in FieldType]?: OrderByDirection;
  };
  limit?: number;
  limitToLast?: number;
};

export class FireWebCollectionRepository<
  DocData extends WithId<Record<string, any>>,
  FieldType extends string = string
> {
  protected collectionRef: CollectionReference<DocumentData>;

  constructor(
    protected firestore: Firestore,
    protected firestoreSdk: FirestoreSdk,
    collectionName: string
  ) {
    const { collection } = firestoreSdk;

    this.firestore = firestore;
    this.collectionRef = collection(this.firestore, collectionName);
  }

  get firestoreInstance() {
    return {
      firestore: this.firestore,
      firestoreSdk: this.firestoreSdk
    };
  }

  getDocRef(docId?: string) {
    const { doc } = this.firestoreSdk;

    if (docId) {
      return doc(this.collectionRef, docId);
    }

    return doc(this.collectionRef);
  }

  getRandomDocId() {
    return this.getDocRef().id;
  }

  async findById(id: string) {
    const { getDoc } = this.firestoreSdk;

    return getDoc(this.getDocRef(id)).then((snap) =>
      firestoreSnapshotToData<DocData>(snap)
    );
  }

  $findById(
    id: string,
    listener: (data: DocData | null) => void,
    onError?: (error: Error) => void
  ) {
    const { onSnapshot } = this.firestoreSdk;

    return onSnapshot(
      this.getDocRef(id),
      (snap) => {
        listener(firestoreSnapshotToData<DocData>(snap));
      },
      onError
    );
  }

  private buildQueryForFindMany(options: FindManyWebOptions<FieldType>) {
    const { query, where, orderBy, limit, limitToLast } = this.firestoreSdk;

    const constraints: QueryConstraint[] = [];

    if (options.where) {
      options.where.forEach((clause) => {
        const [field, operation, value] = clause;

        constraints.push(where(field, operation, value));
      });
    }

    if (options.orderBy) {
      Object.keys(options.orderBy).forEach((field) => {
        constraints.push(orderBy(field, options.orderBy![field]));
      });
    }

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    if (options.limitToLast) {
      constraints.push(limitToLast(options.limitToLast));
    }

    return query(this.collectionRef, ...constraints);
  }

  async findMany(options: FindManyWebOptions<FieldType> = {}) {
    const { getDocs } = this.firestoreSdk;

    return getDocs(this.buildQueryForFindMany(options)).then((snap) =>
      firestoreSnapshotListToData<DocData>(snap.docs)
    );
  }

  $findMany(
    options: FindManyWebOptions<FieldType> = {},
    listener: (data: DocData[]) => void,
    onError?: (error: Error) => void
  ) {
    const { onSnapshot } = this.firestoreSdk;

    return onSnapshot(
      this.buildQueryForFindMany(options),
      (snap) => {
        listener(firestoreSnapshotListToData<DocData>(snap.docs));
      },
      onError
    );
  }

  async deleteById(id: string) {
    const { deleteDoc } = this.firestoreSdk;

    await deleteDoc(this.getDocRef(id));
  }

  async setOne(data: WithOptionalId<DocData>) {
    const { id, ...dataWithoutId } = data;

    const { setDoc } = this.firestoreSdk;

    await setDoc(this.getDocRef(id), dataWithoutId, { merge: false });
  }

  async updateOne(data: WithId<Partial<DocData>>) {
    const { id, ...dataWithoutId } = data;

    const { updateDoc } = this.firestoreSdk;

    await updateDoc(this.getDocRef(id), dataWithoutId);
  }

  getSubCollection<
    SubCollDocData extends WithId<Record<string, any>>,
    SubCollFieldType extends string = string
  >(docId: string, subcollectionName: string) {
    return new FireWebCollectionRepository<SubCollDocData, SubCollFieldType>(
      this.firestore,
      this.firestoreSdk,
      this.collectionRef.path + '/' + docId + '/' + subcollectionName
    );
  }
}
