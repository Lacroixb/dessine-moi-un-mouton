import type { Layer } from "../types/drawing";
import type { DrawingEvent } from "../types/events";

/**
 * Applies a drawing event to the layers array, returning a new immutable array.
 * @param layers - The current array of layers
 * @param event - The drawing event to apply
 * @returns A new array of layers with the event applied
 */
export function applyEvent(layers: Layer[], event: DrawingEvent): Layer[] {
  switch (event.type) {
    case "ADD_STROKE":
      console.assert(
        layers.some((l) => l.id === event.layerId),
        `applyEvent ADD_STROKE: layer "${event.layerId}" introuvable`
      );
      return layers.map((l) =>
        l.id === event.layerId
          ? { ...l, strokes: [...l.strokes, event.stroke] }
          : l
      );

    case "REMOVE_STROKE":
      console.assert(
        layers.some((l) => l.id === event.layerId),
        `applyEvent REMOVE_STROKE: layer "${event.layerId}" introuvable`
      );
      return layers.map((l) =>
        l.id === event.layerId
          ? { ...l, strokes: l.strokes.filter((s) => s.id !== event.stroke.id) }
          : l
      );

    case "ADD_LAYER":
      console.assert(
        !layers.some((l) => l.id === event.layer.id),
        `applyEvent ADD_LAYER: layer "${event.layer.id}" existe déjà`
      );
      return [...layers, event.layer];

    case "REMOVE_LAYER":
      console.assert(
        layers.some((l) => l.id === event.layer.id),
        `applyEvent REMOVE_LAYER: layer "${event.layer.id}" introuvable`
      );
      return layers.filter((l) => l.id !== event.layer.id);

    case "RENAME_LAYER":
      console.assert(
        layers.some((l) => l.id === event.layerId),
        `applyEvent RENAME_LAYER: layer "${event.layerId}" introuvable`
      );
      return layers.map((l) =>
        l.id === event.layerId ? { ...l, name: event.newName } : l
      );

    case "MOVE_LAYER": {
      console.assert(
        event.fromIndex >= 0 && event.fromIndex < layers.length,
        `applyEvent MOVE_LAYER: fromIndex ${event.fromIndex} hors limites (taille: ${layers.length})`
      );
      console.assert(
        event.toIndex >= 0 && event.toIndex < layers.length,
        `applyEvent MOVE_LAYER: toIndex ${event.toIndex} hors limites (taille: ${layers.length})`
      );
      const copy = [...layers];
      const [item] = copy.splice(event.fromIndex, 1);
      copy.splice(event.toIndex, 0, item);
      return copy;
    }

    case "TOGGLE_VISIBILITY":
      console.assert(
        layers.some((l) => l.id === event.layerId),
        `applyEvent TOGGLE_VISIBILITY: layer "${event.layerId}" introuvable`
      );
      return layers.map((l) =>
        l.id === event.layerId ? { ...l, visible: !l.visible } : l
      );
  }
}

/**
 * Returns the inverse event for undo functionality.
 * @param event - The original drawing event
 * @returns The inverse event that undoes the original
 */
export function invertEvent(event: DrawingEvent): DrawingEvent {
  switch (event.type) {
    case "ADD_STROKE":
      return { type: "REMOVE_STROKE", layerId: event.layerId, stroke: event.stroke };

    case "REMOVE_STROKE":
      return { type: "ADD_STROKE", layerId: event.layerId, stroke: event.stroke };

    case "ADD_LAYER":
      return { type: "REMOVE_LAYER", layer: event.layer };

    case "REMOVE_LAYER":
      return { type: "ADD_LAYER", layer: event.layer };

    case "RENAME_LAYER":
      return { type: "RENAME_LAYER", layerId: event.layerId, oldName: event.newName, newName: event.oldName };

    case "MOVE_LAYER":
      return { type: "MOVE_LAYER", layerId: event.layerId, fromIndex: event.toIndex, toIndex: event.fromIndex };

    case "TOGGLE_VISIBILITY":
      return { ...event };
  }
}
