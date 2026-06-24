import { useState, useRef, useCallback } from "react";
import type Konva from "konva";
import type { Layer, Stroke, Position } from "../types/drawing";
import type { DrawingEvent } from "../types/events";
import { createInitialStroke, updateStrokeWithPosition } from "../utils/geometry";
import { BRUSH_CONFIG } from "../constants/tools";

/**
 * Propriétés de configuration pour le hook `useDrawing`.
 *
 * @property stageRef - Référence au stage Konva utilisé pour la position de la souris.
 * @property layers - Liste des calques dessinables.
 * @property dispatch - Fonction de dispatch pour mettre à jour l’état global du dessin.
 * @property publishPreview - Publie l’aperçu (stroke temporaire) pour la collaboration.
 * @property activeLayerId - Identifiant du calque actif dans lequel dessiner.
 * @property tool - Outil de dessin actif (p. ex. "brush").
 * @property brushColor - Couleur du pinceau.
 * @property brushSize - Taille du pinceau.
 * @property brushOpacity - Opacité du pinceau.
 * @property onPreviewUpdate - Callback facultatif quand l’aperçu change.
 */
interface UseDrawingProps {
  stageRef: React.RefObject<Konva.Stage>;
  layers: Layer[];
  dispatch: (event: DrawingEvent) => void;
  publishPreview: (stroke: Stroke | null, layerId: string) => void;
  activeLayerId: string;
  tool: string;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  onPreviewUpdate?: () => void;
}

/**
 * Hook gérant le dessin direct de l’utilisateur (pointer down / move / up)
 * et la propagation de l’aperçu vers la synchronisation distante.
 */
export function useDrawing({
  stageRef,
  layers,
  dispatch,
  publishPreview,
  activeLayerId,
  tool,
  brushColor,
  brushSize,
  brushOpacity,
  onPreviewUpdate,
}: UseDrawingProps) {
  console.assert(typeof tool === "string" && tool.length > 0, "useDrawing: tool invalide");
  console.assert(typeof activeLayerId === "string" && activeLayerId.length > 0, "useDrawing: activeLayerId invalide");
  console.assert(
    Number.isFinite(brushSize) && brushSize >= BRUSH_CONFIG.SIZE.MIN && brushSize <= BRUSH_CONFIG.SIZE.MAX,
    `useDrawing: brushSize hors limites — reçu: ${brushSize}`
  );
  console.assert(
    Number.isFinite(brushOpacity) && brushOpacity >= BRUSH_CONFIG.OPACITY.MIN && brushOpacity <= BRUSH_CONFIG.OPACITY.MAX,
    `useDrawing: brushOpacity hors limites — reçu: ${brushOpacity}`
  );

  const [previewStroke, setPreviewStroke] = useState<Stroke | null>(null);
  const previewRef = useRef<Stroke | null>(null);

  const getPointerPosition = useCallback((): Position | null => {
    return stageRef.current?.getRelativePointerPosition() || null;
  }, [stageRef]);

  const handlePointerDown = useCallback(() => {
    const pos = getPointerPosition();
    if (!pos) return;

    console.assert(
      layers.some((l) => l.id === activeLayerId),
      `handlePointerDown: layer active "${activeLayerId}" introuvable`
    );

    const stroke = createInitialStroke(tool, pos, brushColor, brushSize, brushOpacity) as Stroke;
    console.assert(stroke.id?.length > 0, "handlePointerDown: stroke créé sans id valide");

    previewRef.current = stroke;
    setPreviewStroke(stroke);
    publishPreview(stroke, activeLayerId);
  }, [getPointerPosition, layers, activeLayerId, tool, brushColor, brushSize, brushOpacity, publishPreview]);

  const handlePointerMove = useCallback(() => {
    if (!previewRef.current) return;

    const pos = getPointerPosition();
    if (!pos) return;

    const updated = updateStrokeWithPosition(previewRef.current, pos);
    previewRef.current = updated;
    setPreviewStroke(updated);
    publishPreview(updated, activeLayerId);
    onPreviewUpdate?.();
  }, [getPointerPosition, activeLayerId, publishPreview, onPreviewUpdate]);

  const handlePointerUp = useCallback(() => {
    const stroke = previewRef.current;
    if (!stroke) return;

    console.assert(
      layers.some((l) => l.id === activeLayerId),
      `handlePointerUp: layer active "${activeLayerId}" introuvable`
    );
    publishPreview(null, activeLayerId);

    dispatch({ type: "ADD_STROKE", layerId: activeLayerId, stroke });

    previewRef.current = null;
    setPreviewStroke(null);
  }, [layers, activeLayerId, dispatch, publishPreview]);

  return {
    previewStroke,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}