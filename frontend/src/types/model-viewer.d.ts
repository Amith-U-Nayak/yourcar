import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "shadow-intensity"?: string;
          "touch-action"?: string;
          poster?: string;
        },
        HTMLElement
      >;
    }
  }
}
