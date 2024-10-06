import { logger } from "#src/structures/Logger.js";

/**
 * Batch requests in the given size
 * @param batchData The data in array to batch
 * @param callback the callback to execute for the batched data, the batched data will be passed as a parameter for the callback
 * @param batchSize The size of batch
 */
export async function processInBatch<T>(batchData: T[], callback: (data: T[]) => unknown | Promise<unknown>, batchSize = 5) {
  for (let i = 0; i < batchData.length; i += batchSize) {
    const dataToBatch = batchData.slice(i, i + batchSize);
    try {
      await callback(dataToBatch);
    } catch (error) {
      logger.error("Error processing batch:", error);
    }
  }
}
