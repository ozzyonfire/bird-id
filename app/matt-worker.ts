"use client";

import {
  ImageClassificationPipeline,
  env,
  pipeline,
} from "@xenova/transformers";

// Skip local model check
env.allowLocalModels = false;

export interface WorkerMessage {
  status: "complete" | "error" | "initiate" | "ready";
  output: { label: string; score: number }[];
  error?: string;
}

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static model = "chriamue/bird-species-classifier";
  static instance: Promise<ImageClassificationPipeline> | undefined;

  static async getInstance(progress_callback?: (x: any) => void) {
    if (this.instance === undefined) {
      this.instance = pipeline<"image-classification">(
        "image-classification",
        this.model,
        {
          progress_callback,
          quantized: false,
          revision: "refs/pr/1",
        }
      );
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  // Retrieve the classification pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  let classifier = await PipelineSingleton.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    self.postMessage(x);
  });

  const imagePath = event.data.image;

  // Actually perform the classification
  try {
    let output = await classifier(imagePath, {
      topk: 3,
    });
    // Send the output back to the main thread
    self.postMessage({
      status: "complete",
      output: output,
    });
  } catch (e) {
    // Send an error message back to the main thread
    if (e instanceof Error) {
      self.postMessage({
        status: "error",
        error: e.message,
      });
    } else {
      self.postMessage({
        status: "error",
        error: "An unknown error occurred.",
      });
    }
  }
});
