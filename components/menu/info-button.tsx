import { Info } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function InfoButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="p-2">
          <Info className="w-full h-full" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project info</DialogTitle>
          <DialogDescription>
            <p className="mb-2">
              This uses a pre-trained model to classify images of birds. The
              model contains 525 bird species and 84,635 images. The entire
              model is around 32 mb in size and is downloaded to your browser
              when the model is initialized. All processing is done in your
              browser and no data is sent to any server.
            </p>
            <p className="mb-2">
              This means this website can be hosted for free as a static site.
            </p>
            <p className="mb-2">
              You can save this app to your home screen and use it offline.
            </p>
            <p className="text-center">
              <a href="https://github.com/ozzyonfire" target="_blank">
                ozzyonfire 🔥
              </a>
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
