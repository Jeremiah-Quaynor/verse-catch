"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Pause, AudioLines, Disc, Play } from "lucide-react";
import BibleVerseCard from "@/components/custom/BibleVerseCard";
import io from "socket.io-client";

const socket = io("http://localhost:4002");

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [verse, setVerse] = useState("");
  const [reference, setReference] = useState("");
  const [bibleVersion, setBibleVersion] = useState("");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    socket.on("bible-verse", (data) => {
      setVerse(data.verse);
      setReference(data.reference);
      setBibleVersion(data.version);
    });

    return () => {
      socket.off("bible-verse");
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]); // Reset chunks
      setIsLoading(true);

      recorder.ondataavailable = async (event) => {
        const chunk = event.data;
        setAudioChunks((prev) => [...prev, chunk]); // Store audio chunks

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await chunk.arrayBuffer();
        console.log("about to emit audio-chunk as buffer");
        socket.emit("audio-chunk", arrayBuffer); // Send audio chunks as buffer to the server
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
      };

      recorder.start(1000); // Send chunks every 3 seconds
      setIsListening(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // Handle error (e.g., show a message to the user)
      setIsLoading(false);

    }
  };

  const stopListening = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      socket.emit("audio-end")
    }
    setIsListening(false);
    setIsPaused(false);
    setIsLoading(false);
  };

  const pauseListening = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeListening = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-primary-foreground">
      <h1 className="text-4xl font-bold text-center mt-2">VerseCatch</h1>
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <main className="flex flex-col gap-8 items-center mt-8">
        {isLoading ? (
          <p>
            <span className="animate-pulse">Listening...</span>
          </p>
          ) : verse ? (
            <BibleVerseCard
              verse={verse}
              reference={reference}
              bibleVersion={bibleVersion}
            />
          ) : (
            <p className="text-center text-gray-500">
              Transcribing and detecting Bible quotations in real time.
            </p>
          )}
        </main>
      </div>

      <footer className="w-full max-w-md mt-12 self-center">
        <div className="h-[400px] bg-white shadow-md rounded-2xl flex flex-col items-center justify-center">
          <div className="p-4 bg-gray-200 rounded-full">
            {isPaused ? (
              <Pause className="text-gray-800 w-10 h-10" />
            ) : isListening ? (
              <AudioLines className="text-gray-800 w-10 h-10" />
            ) : (
              <Disc className="text-gray-500 w-10 h-10" />
            )}
          </div>
          <p className="mt-4 text-gray-600">
            Transcribing and detecting Bible quotations in real time.
          </p>

          {isListening ? (
            <div className="flex gap-4">
              <Button
                variant="destructive"
                className="mt-6 w-36 rounded-3xl"
                onClick={stopListening}
              >
                <MicOff className="mr-2 w-5 h-5" />
                Stop
              </Button>
              {isPaused ? (
                <Button
                  className="mt-6 w-36 rounded-3xl"
                  onClick={resumeListening}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Resume
                </Button>
              ) : (
                <Button
                  className="mt-6 w-36 rounded-3xl"
                  onClick={pauseListening}
                >
                  <Pause className="mr-2 w-5 h-5" />
                  Pause
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="default"
              className="mt-6 w-48 rounded-3xl"
              onClick={startListening}
            >
              <Mic className="mr-2 w-5 h-5" />
              Start Listening
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
