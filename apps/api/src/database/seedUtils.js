export const DEFAULT_BULK_CHUNK_SIZE = 500;

export const chunk = (items, size = DEFAULT_BULK_CHUNK_SIZE) => {
  const result = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
};

export const executeChunkedBulkWrite = async (
  model,
  operations,
  {
    chunkSize = DEFAULT_BULK_CHUNK_SIZE,
    ordered = false
  } = {}
) => {
  const batches = chunk(operations, chunkSize);
  let processed = 0;

  for (const batch of batches) {
    if (batch.length === 0) {
      continue;
    }

    await model.bulkWrite(batch, { ordered });
    processed += batch.length;
  }

  return processed;
};
