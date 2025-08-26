export interface ImageUploaderProps {
  onFileSelect: (files: (string | File)[]) => void;
  initialImages?: (string | File)[];
  label?: string;
  multiple?: boolean;
}
