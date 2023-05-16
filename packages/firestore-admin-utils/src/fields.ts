import { FieldValue, FieldPath } from 'firebase-admin/firestore';

export const arrayUnion = <T = any>(...elements: any[]) =>
  FieldValue.arrayUnion(...elements) as T;

export const arrayRemove = <T = any>(...elements: any[]) =>
  FieldValue.arrayRemove(...elements) as T;

export const fieldDelete = <T = any>() => FieldValue.delete() as T;

export const documentId = <T extends string = 'id'>() =>
  FieldPath.documentId() as unknown as T;
