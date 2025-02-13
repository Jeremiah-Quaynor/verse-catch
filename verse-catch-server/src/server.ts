import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { Request, Response } from "express";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { getVerses } from "./utils/getVerses";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TEMP_AUDIO_PATH = path.join(__dirname, "temp_audio");

// Ensure temp audio directory exists
if (!fs.existsSync(TEMP_AUDIO_PATH)) {
  fs.mkdirSync(TEMP_AUDIO_PATH);
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  let audioBuffer: Buffer[] = [];

  socket.on("audio-chunk", (chunk: Buffer) => {
    console.log(`Received audio chunk: ${chunk.length} bytes`);
    audioBuffer.push(chunk);
  });

  socket.on("audio-end", async () => {
    console.log("Audio transmission ended");

    if (audioBuffer.length === 0) {
      console.error("Error: No audio received.");
      socket.emit("error", { message: "No audio received." });
      return;
    }

    try {
      // Combine all chunks into a single buffer
      const audioData = Buffer.concat(audioBuffer);
      audioBuffer = []; // Clear buffer for next use

      // Write buffer to a temporary file
      const tempWebMPath = path.join(
        TEMP_AUDIO_PATH,
        `temp-audio-${Date.now()}.webm`
      );
      fs.writeFileSync(tempWebMPath, audioData);

      // Transcribe the audio
      const transcript = await transcribeAudio(tempWebMPath);
      if (transcript) {
        const bibleReference = await detectBibleReference(transcript);
        if (bibleReference) {
          const verse = getVerses(bibleReference);
          socket.emit("bible-verse", {
            reference: bibleReference,
            verse,
            version: "NIV",
          });
        } else {
          socket.emit("bible-verse", {
            reference: "No verse detected",
            verse: transcript,
            version: "NIV",
          });
        }
      } else {
        socket.emit("bible-verse", {
          reference: "No verse detected",
          verse: transcript,
          version: "NIV",
        });
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      socket.emit("error", { message: "Error processing audio." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("AI Bible Quotation API");
});

const PORT = process.env.PORT || 4002;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    console.log("Transcribing audio...");

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
    });

    fs.unlinkSync(audioFilePath); // Cleanup after processing
    return transcription.text || "No Transcript";
  } catch (err) {
    console.error("Error in transcribeAudio:", err);
    return "Error transcribing audio";
  }
}

async function detectBibleReference(
  transcript: string
): Promise<string | null> {
  console.log("Detecting Bible reference...");

  const prompt = `Extract a Bible verse reference from the following text. Return "None" if no reference is found.
  Text: "${transcript}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content || "None";
    return text !== "None" ? text : null;
  } catch (err) {
    console.error("Error detecting Bible reference:", err);
    return null;
  }
}
