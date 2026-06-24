import { useState, useCallback } from "react";
import type { Layer } from "../types/drawing";
import type { DrawingEvent } from "../types/events";

/**
 * Hook de gestion des calques (layers), de l’état du calque actif
 * et des opérations CRUD sur les calques.
 *
 * @param layers - Calques existants.
 * @param dispatch - Dispatch vers le reducer principal du dessin.
 * @param undo - Action d’annulation (undo) partagée.
 * @returns Objet contenant l'état et les fonctions de gestion des calques.
 */
export function useLayers(
  layers: Layer[],
  dispatch: (event: DrawingEvent) => void,
  undo: () => void
) {
  console.assert(Array.isArray(layers) && layers.length > 0, "useLayers: layers doit être un tableau non vide");

  const [activeLayerId, setActiveLayerId] = useState<string>(layers[0]?.id ?? "layer-1");

  const addLayer = useCallback(() => {
    const id = `layer-${Date.now()}`;
    console.assert(!layers.some((l) => l.id === id), `addLayer: id "${id}" déjà existant`);
    const layer: Layer = { id, name: `Layer ${layers.length + 1}`, visible: true, strokes: [] };
    dispatch({ type: "ADD_LAYER", layer });
    setActiveLayerId(id);
  }, [layers, dispatch]);

  const deleteLayer = useCallback((id: string) => {
    console.assert(typeof id === "string" && id.length > 0, `deleteLayer: id invalide — reçu: "${id}"`);
    const layer = layers.find((l) => l.id === id);
    console.assert(layer !== undefined, `deleteLayer: layer "${id}" introuvable`);
    if (!layer) return;
    if (layers.length <= 1) return;

    dispatch({ type: "REMOVE_LAYER", layer });

    if (id === activeLayerId) {
      const remaining = layers.filter((l) => l.id !== id);
      setActiveLayerId(remaining[remaining.length - 1].id);
    }
  }, [layers, activeLayerId, dispatch]);

  const moveLayer = useCallback((id: string, direction: "up" | "down") => {
    console.assert(direction === "up" || direction === "down", `moveLayer: direction invalide — reçu: "${direction}"`);
    const fromIndex = layers.findIndex((l) => l.id === id);
    console.assert(fromIndex !== -1, `moveLayer: layer "${id}" introuvable`);
    if (fromIndex === -1) return;

    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= layers.length) return;

    dispatch({ type: "MOVE_LAYER", layerId: id, fromIndex, toIndex });
  }, [layers, dispatch]);

  const toggleLayerVisibility = useCallback((id: string) => {
    console.assert(layers.some((l) => l.id === id), `toggleLayerVisibility: layer "${id}" introuvable`);
    dispatch({ type: "TOGGLE_VISIBILITY", layerId: id });
  }, [layers, dispatch]);

  const renameLayer = useCallback((id: string, newName: string) => {
    console.assert(typeof newName === "string" && newName.trim().length > 0, `renameLayer: newName invalide — reçu: "${newName}"`);
    const layer = layers.find((l) => l.id === id);
    console.assert(layer !== undefined, `renameLayer: layer "${id}" introuvable`);
    if (!layer) return;
    dispatch({ type: "RENAME_LAYER", layerId: id, oldName: layer.name, newName });
  }, [layers, dispatch]);

  return {
    activeLayerId,
    setActiveLayerId,
    addLayer,
    deleteLayer,
    moveLayer,
    toggleLayerVisibility,
    renameLayer,
    undo,
  };
}
