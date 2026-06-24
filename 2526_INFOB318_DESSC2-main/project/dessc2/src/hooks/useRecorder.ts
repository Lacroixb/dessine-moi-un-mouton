import { useRef, useState, useCallback } from "react";
import type Konva from "konva";
import {
  Output,
  WebMOutputFormat,
  BufferTarget,
  CanvasSource,
  QUALITY_HIGH,
} from "mediabunny";
const CAPTURE_INTERVAL_MS = 50;

/**
 * Hook for recording timelapse videos from the Konva stage.
 * @param stageRef - Reference to the Konva stage to record
 * @param targetDurationS - Target duration of the output video in seconds
 * @returns Object containing recording state and control functions
 */
export function useRecorder(
  stageRef: React.RefObject<Konva.Stage>,
  targetDurationS: number
) {
  const framesRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Démarre l'enregistrement des frames du canvas.
   */
  const startRecording = useCallback(() => {
    if (isRecording) return;
    framesRef.current = [];
    intervalRef.current = setInterval(() => {
      const stage = stageRef.current;
      if (!stage) return;
      framesRef.current.push(stage.toDataURL());
    }, CAPTURE_INTERVAL_MS);

    setIsRecording(true);
  }, [isRecording, stageRef]);

  /**
   * Arrête l'enregistrement et exporte la vidéo.
   */
  const stopAndDownload = useCallback(async () => {
    if (!isRecording) return;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    const raw = framesRef.current;
    const frames: string[] = [];
    for (let i = 0; i < raw.length; i++) {
      if (i === 0 || raw[i] !== raw[i - 1]) {
        frames.push(raw[i]);
      }
    }

    if (frames.length === 0) return;

    setIsExporting(true);

    try {
      const stage = stageRef.current;
      const width = stage ? stage.width() : 1200;
      const height = stage ? stage.height() : 750;

      const frameDurationS = targetDurationS / frames.length;

      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext("2d")!;

      const target = new BufferTarget();
      const output = new Output({
        format: new WebMOutputFormat(),
        target,
      });

      const videoSource = new CanvasSource(offscreen, {
        codec: "vp9",
        bitrate: QUALITY_HIGH,
      });

      output.addVideoTrack(videoSource, { frameRate: 1 / frameDurationS });
      await output.start();

      for (let i = 0; i < frames.length; i++) {
        const img = await new Promise<HTMLImageElement>((resolve) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.src = frames[i];
        });

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);

        await videoSource.add(i * frameDurationS, frameDurationS);
      }

      await output.finalize();

      const blob = new Blob([target.buffer!], { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `timelapse-${Date.now()}.webm`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      framesRef.current = [];
      setIsExporting(false);
    }
  }, [isRecording, stageRef, targetDurationS]);

  return { isRecording, isExporting, startRecording, stopAndDownload };
}