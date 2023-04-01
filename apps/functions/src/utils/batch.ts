import { WriteBatch, getFirestore } from 'firebase-admin/firestore';

/**
 * @desc Chunks an array into smaller parts
 *
 * @example
 * const array = [1, 2, 3, 4, 5, 6];
 * const chunked = chunkArr(array, 2);
 * // [ [1, 2], [3, 4], [5, 6] ]
 */
export function chunkArr<T>(array: T[], size = 1) {
  if (size <= 0) {
    return [array];
  }

  return array.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / size);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, [] as T[][]);
}

/**
 * Executes multiple firestore batches in parallel. Batch is commited by this function.
 *
 * @problem
 * Firestore hardlimit is 500 updates per batch. It is impossible to update
 * more than 500 documents in a single batch.
 *
 * @solution
 * Batches are split into chunks which then executed in parallel. Chunks
 * are processed independently of each other. For 1625 documents with
 * batchSize = 500, there will be 4 chunks in total: 500, 500, 500, 125.
 * The drawback is that some chunks can succeed while the others might
 * fail. This can potentially result in only partial update. Nevertheless,
 * this is the only way to update large number of documents while keeping
 * semi-atomicity.
 */
export async function batchMany<T>(
  data: T[],
  updateCallback: (batch: WriteBatch, element: T) => any,
  /** How many updates are going to be atomic in a single batch. Since
   * hardlimit is 500, batchSize formula can be expressed as 500 /
   * number_of_update_operations_in_batch
   *
   * @default 500
   *
   * @example
   * // two operations, batchSize = 500 / 2 = 250
   * batch.delete(...);
   * batch.delete(...);
   *
   * // three operations, batchSize = 500 / 3 ~= 165
   * batch.delete(...);
   * batch.delete(...);
   * batch.delete(...);
   * */
  batchSize = 500
) {
  const size = Math.min(batchSize, 500);

  const batches = chunkArr(data, size).map(async (dataChunk) => {
    const batch = getFirestore().batch();

    await Promise.all(
      dataChunk.map(async (element) => {
        await updateCallback(batch, element);
      })
    );

    await batch.commit();
  });

  await Promise.all(batches);
}
