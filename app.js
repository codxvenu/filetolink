import express from "express";
import { createStream, getFileLocation } from "./streamer.js";
import { getFastestClient, getStats, initializeClients, releaseClient } from "./config/db.js";
import { initializeBot } from "./tgbot/app.js";

const app = express();

await initializeClients();
await initializeBot();

app.get("/stream/:id", async (req, res) => {
    let client;
    try {
        client = getFastestClient()
        const { id } = req.params;
        const { document, location, mimeType,filename } = await getFileLocation(id, client.client);
        const fileSize = document.size;

        let start = 0;
        let end = fileSize - 1;
        const rangeHeader = req.headers.range;

        if (rangeHeader) {
            const parts = rangeHeader.replace(/bytes=/, "").split("-");
            start = parseInt(parts[0], 10);
            if (parts[1]) {
                end = parseInt(parts[1], 10);
            }
        }

        const contentLength = end - start + 1;

        res.status(rangeHeader ? 206 : 200).set({
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Content-Length": contentLength,
            "Access-Control-Allow-Origin": "*",
            "Content-Disposition": `inline; filename="${filename}"`,
            "Content-Type": mimeType ?? "application/octet-stream"
        });

        const readStream = await createStream(start, end, document, location, client);
        readStream.pipe(res);
        readStream.on("error", (err) => {
            console.error("Stream failed mid-way:", err.message);
        });
        res.on("close", () => {
            readStream.destroy();
            releaseClient(client.id)
        });
    } catch (error) {
        releaseClient(client.id)
        console.error("Streaming error:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
});

app.get("/download/:id", async (req, res) => {
    let client;
    try {
        client = getFastestClient()
        const { id } = req.params;
        const { document, location , mimeType,filename} = await getFileLocation(id, client.client);
        const fileSize = document.size;

        res.status(200).set({
            "Access-Control-Allow-Origin": "*",
            "Content-Length": fileSize,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Type": mimeType ?? "application/octet-stream"
        });

        const readStream = await createStream(0, fileSize - 1, document, location, client);
        readStream.pipe(res);
        readStream.on("error", (err) => {
            console.error("Stream failed mid-way:", err.message);
        });
        res.on("close", () => {
            releaseClient(client.id)
            readStream.destroy();
        });
    } catch (error) {
        releaseClient(client.id)
        console.error("Download error:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
});
app.get("/stats",(req,res)=>{
    const stats = getStats()
    res.end(stats);
})
app.listen(3000, () => {
    console.log("Server running on 3000");
});