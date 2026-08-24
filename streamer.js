import { Api, errors } from "telegram/index.js";
import { Readable } from "node:stream";
import { getFastestClient, onFloodErr, releaseClient } from "./config/db.js";

const CHUNK_SIZE = 1024 * 1024; // 1MB

export const getResolvedOffset = (offset) => {
   return Math.floor(offset / CHUNK_SIZE) * CHUNK_SIZE;
}


export const getFileLocation = async (MsgId, client) => {
  const result = await client.invoke(
    new Api.channels.GetMessages({
      id: [Number(MsgId)],
      channel: "uploadContent"
    })
  );
   if (!result || !result.messages || !result.messages[0].document) {
  throw new Error("Message not found or does not contain a file document");
}
  const document = result.messages[0].document;
  const location = new Api.InputDocumentFileLocation({
    id: document.id,
    accessHash: document.accessHash,
    fileReference: document.fileReference,
    thumbSize: ""
  });
  const filename = document?.attributes?.find(f=>f?.className === "DocumentAttributeFilename")?.fileName ?? fileURLToPath.bin
  const mimeType = document?.mimeType
  return { location, document ,mimeType,filename};
};

export const createStream = async (start, end, document, location, { client, id }) => {
  const sender = await client.getSender(document.dcId);
  let currentOffset = start; //1.5

  const PREFETCH_LIMIT = 4; // Prefetch up to 4MB in advance
  let nextPrefetchOffset = getResolvedOffset(start);//1.5

  // Instance-scoped map to store background download Promises
  const chunkQueue = new Map(); // maps: offset -> Promise

  // Helper to trigger background download of a specific offset
  const triggerPrefetch = (offset) => {
  let redownloads = 0;
    if (offset > end || chunkQueue.has(offset)) return;

    const telegramOffset = getResolvedOffset(offset);
    const download = async () => {

      try {
        const chunk = await sender.send(
          new Api.upload.GetFile({
            location: location,
            offset: BigInt(telegramOffset),
            limit: CHUNK_SIZE,
            precise: true,
            cdnSupported: false,
          })
        )
        if (!chunk || !chunk.bytes || chunk.bytes.length === 0) return null;
        return chunk.bytes;
      }
      catch (err) {
        if (err instanceof errors.FloodWaitError) {
          onFloodErr(id, err.seconds)
          await new Promise(resolve => setTimeout(resolve, err.seconds * 1000));
          redownloads++;
          if (redownloads >= 10) {
            throw new Error("Max retries reached");
          }
          return download()
        }
        console.error(`Prefetch failed at offset ${offset}:`, err.message);
        throw err;
      };
    }
    chunkQueue.set(telegramOffset, download());
  };
  // Prefetch the initial batch concurrently on stream startup
  for (let i = 0; i < PREFETCH_LIMIT; i++) {
    triggerPrefetch(nextPrefetchOffset);
    nextPrefetchOffset += CHUNK_SIZE;
  }

  return new Readable({
    async read() {
      if (currentOffset > end) {
        this.push(null);
        return;
      }

      try {
        const resolvedOffset = getResolvedOffset(currentOffset)
        // Trigger prefetch if not already started
        if (!chunkQueue.has(resolvedOffset)) {
          triggerPrefetch(resolvedOffset);
        }

        // Await the specific offset Promise (Guarantees perfect sequential order)
        const bytes = await chunkQueue.get(resolvedOffset);
        chunkQueue.delete(resolvedOffset); // Clean up memory reference

        if (!bytes) {
          this.push(null);
          return;
        }

        // Queue up the next chunk in the background while processing this one
        triggerPrefetch(nextPrefetchOffset);
        nextPrefetchOffset += CHUNK_SIZE;

        // Slice starting/trailing boundaries (Handles seeks and exact range constraints)
        const byteToSkip = currentOffset - resolvedOffset;
        let data = bytes.subarray(byteToSkip);

        const remainingToRead = end - currentOffset + 1;
        if (data.length > remainingToRead) {
          data = data.subarray(0, remainingToRead);
        }
        currentOffset += data.length; 
        this.push(data);
      } catch (err) {
        this.destroy(err);
      }
    }
  });
};