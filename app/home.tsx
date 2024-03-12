"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { WorkerMessage } from "./matt-worker";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Camera } from "lucide-react";

export default function Home() {
  // Keep track of the classification result and the model loading status.
  const [result, setResult] = useState<
    { label: string; score: number }[] | null
  >(null);
  const [ready, setReady] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>();
  const [error, setError] = useState<string>();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Create a reference to the worker object.
  const worker = useRef<Worker | null>(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      console.log("Creating worker...");
      worker.current = new Worker(
        /* webpackChunkName: "pipeline-worker" */ new URL(
          "./matt-worker.ts",
          import.meta.url
        ),
        {
          type: "module",
        }
      );
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: { data: WorkerMessage }) => {
      switch (e.data.status) {
        case "initiate":
          setReady(false);
          break;
        case "ready":
          setReady(true);
          break;
        case "complete":
          setResult(e.data.output);
          setError(undefined);
          break;
        case "error":
          setError(e.data.error);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback(
    (text: string) => {
      if (worker.current) {
        worker.current.postMessage({ image: text });
      }
    },
    [worker]
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (!video) return;

    function loopCapture() {
      if (!video) return;
      // Wait for the video to be loaded fully
      video.width = video.videoWidth;
      video.height = video.videoHeight;

      // Draw the video frame to canvas
      let canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      let ctx = canvas.getContext("2d");

      // Set up an interval to capture a frame every second
      intervalId = setInterval(() => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log("Captured frame");

        // Convert the canvas image to Blob
        canvas.toBlob((blob) => {
          if (blob) {
            let src = URL.createObjectURL(blob);
            classify(src);
            setPreviewSrc(src);
          }
        });
      }, 1000);
    }

    video.addEventListener("loadedmetadata", loopCapture);

    return () => {
      video.pause();
      video.srcObject = null;
      stream?.getTracks().forEach((track) => track.stop());
      video.removeEventListener("loadedmetadata", loopCapture);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [video, stream, classify]);

  const handleFileDrop = (file?: File) => {
    if (file && file.type.startsWith("image")) {
      // convert file to filepath
      let src = URL.createObjectURL(file);
      classify(src);
      setPreviewSrc(src);
    }
  };

  const handleClear = () => {
    setPreviewSrc(undefined);
    setResult(null);
    setError(undefined);
    video?.pause();
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setVideo(null);
  };

  const handleUseCamera = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log("Camera API not available");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        let video = document.createElement("video");
        video.srcObject = stream;
        video.play();
        setVideo(video);
        setStream(stream);
      })
      .catch((error) => {
        console.log("Error accessing camera: ", error);
      });
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-2 text-center">Birdie 🦆</h1>
      {!previewSrc && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <form
            className="flex gap-2 w-full"
            action={(form: FormData) => {
              const image = form.get("image") as string;
              setPreviewSrc(image);
              classify(image);
            }}
          >
            <Input
              className="w-full p-2 rounded min-h-12 text-lg font-medium"
              type="text"
              name="image"
              placeholder="Enter image URL"
            />
            <Button type="submit" className="min-h-12">
              Go
            </Button>
          </form>
          <Button
            variant="outline"
            className="w-full min-h-12 text-lg font-medium flex items-center justify-center gap-2"
            onClick={handleUseCamera}
          >
            Use Camera
            <Camera className="w-6 h-6" />
          </Button>
          <Label
            className={cn(
              "flex flex-col border-2 border-dashed p-2 min-h-12 rounded-md w-full hover:bg-secondary cursor-pointer transition-colors duration-200 ease-in-out",
              {
                "border-blue-500": isDragging,
              }
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              handleFileDrop(file);
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-medium">Drop or choose an image</p>
              <Input
                multiple
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleFileDrop(file);
                }}
              />
            </div>
          </Label>
        </div>
      )}

      {error && (
        <p className="bg-red-100 p-2 rounded w-full max-w-sm font-mono mb-3">
          {error}
        </p>
      )}

      {previewSrc && !error && (
        <img
          src={previewSrc}
          alt="Preview"
          className="rounded-md w-full max-w-sm mb-3"
        />
      )}

      {ready === false && (
        <p className="bg-yellow-100 p-2 rounded w-full max-w-sm font-mono mb-3">
          Loading model...
        </p>
      )}

      {ready !== null && !error && result !== null && (
        <div className="bg-secondary p-2 rounded w-full max-w-sm">
          <ol className="flex flex-col gap-2">
            {result.map((r) => (
              <li key={r.label} className="font-mono font-medium">
                <p>{r.label}</p>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Progress value={r.score * 100} className="mb-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Confidence: {(r.score * 100).toFixed(2)}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ol>
        </div>
      )}

      {
        /* Reset button */
        (previewSrc || result !== null || error) && (
          <Button className="mt-3" onClick={handleClear}>
            Reset
          </Button>
        )
      }
    </main>
  );
}
