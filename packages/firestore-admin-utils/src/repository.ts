import {
  firestoreSnapshotToData,
  firestoreSnapshotListToData,
  WithId,
  WithOptionalId,
  WhereClause
} from '@shared/firestore-utils';

export type FirestoreCollectionQuery =
  | FirebaseFirestore.CollectionReference
  | FirebaseFirestore.Query;

export type QueryBuilder = (
  query: FirestoreCollectionQuery
) => FirestoreCollectionQuery;

export type FindManyOptions<FieldType extends string> = {
  where?: WhereClause<FieldType>[];
  orderBy?: {
    [field in FieldType]?: FirebaseFirestore.OrderByDirection;
  };
  limit?: number;
  limitToLast?: number;
};

export type BatchOrTransaction =
  | FirebaseFirestore.WriteBatch
  | FirebaseFirestore.Transaction;

export class FireCollectionRepository<
  DocData extends WithId<Record<string, any>>,
  FieldType extends string = string
> {
  protected firestore: FirebaseFirestore.Firestore;
  protected collectionRef: FirebaseFirestore.CollectionReference;

  constructor(firestore: FirebaseFirestore.Firestore, collectionName: string) {
    this.firestore = firestore;
    this.collectionRef = firestore.collection(collectionName);
  }

  get firestoreInstance() {
    return this.firestore;
  }

  getDocRef(docId?: string) {
    if (docId) {
      return this.collectionRef.doc(docId);
    }

    return this.collectionRef.doc();
  }

  getRandomDocId() {
    return this.getDocRef().id;
  }

  async findById(id: string) {
    return this.collectionRef
      .doc(id)
      .get()
      .then((snap) => firestoreSnapshotToData<DocData>(snap));
  }

  private buildQueryForFindMany(options: FindManyOptions<FieldType>) {
    const { limit, limitToLast, orderBy, where } = options;

    let query = this.collectionRef as FirestoreCollectionQuery;

    if (where) {
      where.forEach((clause) => {
        const [field, operation, value] = clause;

        query = query.where(field, operation, value);
      });
    }

    if (orderBy) {
      Object.keys(orderBy).forEach((field) => {
        query = query.orderBy(field, orderBy[field]);
      });
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (limitToLast) {
      query = query.limitToLast(limitToLast);
    }

    return query;
  }

  async findMany(options: FindManyOptions<FieldType> = {}) {
    return this.buildQueryForFindMany(options)
      .get()
      .then((snap) => firestoreSnapshotListToData<DocData>(snap.docs));
  }

  async count(options: FindManyOptions<FieldType> = {}) {
    return this.buildQueryForFindMany(options)
      .count()
      .get()
      .then((val) => val.data().count);
  }

  async runQuery(queryBuilder?: QueryBuilder) {
    const query: FirestoreCollectionQuery = queryBuilder
      ? queryBuilder(this.collectionRef)
      : this.collectionRef;

    return query
      .get()
      .then((snap) => firestoreSnapshotListToData<DocData>(snap.docs));
  }

  async deleteById(id: string) {
    await this.getDocRef(id).delete();
  }
  atomicDeleteById(batchOrTr: BatchOrTransaction, id: string) {
    batchOrTr.delete(this.getDocRef(id));
  }
  atomicDeleteMany(
    batchOrTr: BatchOrTransaction,
    dataArr: string[] | WithId<Record<string, any>>[]
  ) {
    dataArr.forEach((data: string | WithId<Record<string, any>>) => {
      this.atomicDeleteById(
        batchOrTr,
        typeof data === 'string' ? data : data.id
      );
    });
  }

  async setOne(data: WithOptionalId<DocData>) {
    const { id, ...dataWithoutId } = data;

    await this.getDocRef(id).set(dataWithoutId, { merge: false });
  }
  atomicSetOne(batchOrTr: BatchOrTransaction, data: WithOptionalId<DocData>) {
    const { id, ...dataWithoutId } = data;

    (batchOrTr as FirebaseFirestore.WriteBatch).set(
      this.getDocRef(id),
      dataWithoutId,
      {
        merge: false
      }
    );
  }
  atomicSetMany(
    batchOrTr: BatchOrTransaction,
    dataArr: WithOptionalId<DocData>[]
  ) {
    dataArr.forEach((data) => {
      this.atomicSetOne(batchOrTr, data);
    });
  }

  async updateOne(data: WithId<Partial<DocData>>) {
    const { id, ...dataWithoutId } = data;

    await this.getDocRef(id).update(dataWithoutId);
  }
  atomicUpdateOne(
    batchOrTr: BatchOrTransaction,
    data: WithId<Partial<DocData>>
  ) {
    const { id, ...dataWithoutId } = data;

    (batchOrTr as FirebaseFirestore.WriteBatch).update(
      this.getDocRef(id),
      dataWithoutId
    );
  }
  atomicUpdateMany(
    batchOrTr: BatchOrTransaction,
    dataArr: WithId<Partial<DocData>>[]
  ) {
    dataArr.forEach((data) => {
      this.atomicUpdateOne(batchOrTr, data);
    });
  }

  batch() {
    return this.firestore.batch();
  }

  async runTransaction<T = unknown>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>
  ) {
    return this.firestore.runTransaction(updateFunction);
  }

  getSubCollection<
    SubCollDocData extends WithId<Record<string, any>>,
    SubCollFieldType extends string = string
  >(docId: string, subcollectionName: string) {
    return new FireCollectionRepository<SubCollDocData, SubCollFieldType>(
      this.firestore,
      this.collectionRef.doc(docId).collection(subcollectionName).path
    );
  }
}
