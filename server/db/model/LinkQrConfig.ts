interface ColorStop {
  offset: number;
  color: string;
}

interface Gradient {
  type?: "linear" | "radial";
  rotation?: number;
  colorStops: ColorStop[];
}

export interface LinkQrConfig {
  image?: string;
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
    crossOrigin?: "anonymous" | "use-credentials";
  };
  dotOptions: {
    type?:
      | "rounded"
      | "dots"
      | "classy"
      | "classy-rounded"
      | "square"
      | "extra-rounded";
    color?: string;
    gradient?: Gradient;
  };
  backgroundOptions: {
    color?: string;
    gradient?: Gradient;
  };
  cornersSquareOptions: {
    type?: "dot" | "square" | "extra-rounded";
    color?: string;
    gradient?: Gradient;
  };
  cornersDotOptions: {
    type?: "dot" | "square";
    color?: string;
    gradient?: Gradient;
  };
}
