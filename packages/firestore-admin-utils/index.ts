import { FieldValue, Query, FieldPath } from 'firebase-admin/firestore';

export * from './batch';

export const arrayUnion = <T = any>(...elements: any[]) =>
  FieldValue.arrayUnion(...elements) as T;

export const fieldDelete = <T = any>() => FieldValue.delete() as T;

type WhereClause = [string | FieldPath, FirebaseFirestore.WhereFilterOp, any];
export const joinWhereClauses = <T extends Query>(
  query: T,
  whereClauses: WhereClause[]
) => {
  whereClauses.forEach((clause) => {
    (query as any) = query.where(clause[0], clause[1], clause[2]);
  });

  return query;
};
