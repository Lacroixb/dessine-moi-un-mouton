import { useEffect, useRef, useState, useCallback } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { Layer, Stroke } from "../types/drawing";
import type { DrawingEvent } from "../types/events";
import { applyEvent, invertEvent } from "../utils/events";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:1234";
const ROOM_NAME = "drawing-room";
const MAX_HISTORY = 50;

/**
 * Synchronise l’état local des calques vers l’état Yjs partagé.
 *
 * @param yLayers - Array Yjs partagé dans le document.
 * @param layers - Calques locaux actuels.
 */
function syncLayersToYjs(yLayers: Y.Array<Y.Map<unknown>>, layers: Layer[]) {
  console.assert(layers.length > 0, "syncLayersToYjs: tableau vide");
  const existingData = new Map<string, { name: string; visible: boolean; strokes: string }>();
  yLayers.toArray().forEach((yLayer) => {
    const id = yLayer.get("id") as string;
    if (typeof id === "string" && id.length > 0) {
      existingData.set(id, {
        name: yLayer.get("name") as string,
        visible: yLayer.get("visible") as boolean,
        strokes: yLayer.get("strokes") as string,
      });
    }
  });
  const currentIds = yLayers.toArray().map((y) => y.get("id") as string);
  const targetIds = layers.map((l) => l.id);
  const orderChanged = currentIds.join(",") !== targetIds.join(",");

  if (orderChanged) {
    yLayers.delete(0, yLayers.length);
    const newMaps = layers.map((layer) => {
      const yLayer = new Y.Map<unknown>();
      yLayer.set("id", layer.id);
      yLayer.set("name", layer.name);
      yLayer.set("visible", layer.visible);
      yLayer.set("strokes", JSON.stringify(layer.strokes));
      return yLayer;
    });
    yLayers.insert(0, newMaps);
  } else {
    yLayers.toArray().forEach((yLayer, i) => {
      const layer = layers[i];
      const cached = existingData.get(layer.id);
      if (yLayer.get("name") !== layer.name) yLayer.set("name", layer.name);
      if (yLayer.get("visible") !== layer.visible) yLayer.set("visible", layer.visible);
      const newStrokes = JSON.stringify(layer.strokes);
      if (cached?.strokes !== newStrokes) yLayer.set("strokes", newStrokes);
    });
  }
}

/**
 * Convertit le modèle Yjs (tableau de maps) en tableau de calques locaux.
 *
 * @param yLayers - Collection Yjs synchronisée des calques.
 * @returns Calques sous forme d’objets Layer typés.
 */
function yjsToLayers(yLayers: Y.Array<Y.Map<unknown>>): Layer[] {
  return yLayers.toArray().map((yLayer) => {
    const id = yLayer.get("id");
    const strokes = yLayer.get("strokes");
    console.assert(id !== undefined, "yjsToLayers: layer sans id");
    console.assert(typeof strokes === "string", `yjsToLayers: strokes invalide, reçu: ${typeof strokes}`);
    return {
      id: id as string,
      name: yLayer.get("name") as string,
      visible: yLayer.get("visible") as boolean,
      strokes: JSON.parse((strokes as string) || "[]") as Stroke[],
    };
  });
}

/**
 * Structure de l’aperçu partagé envoyé à Yjs via websocket.
 */
export interface RemotePreview {
  stroke: Stroke;
  layerId: string;
}

/**
 * Hook de synchronisation collaborative via Yjs + y-websocket.
 *
 * Expose l’état des calques, les prévisualisations distantes, et les actions
 * dispatcher/undo pour un dessin temps réel multi-utilisateur.
 * @returns Objet contenant l'état des calques, les prévisualisations distantes et les fonctions de dispatch.
 */
export function useCollaboration() {
  const docRef = useRef<Y.Doc | null>(null);
  const yLayersRef = useRef<Y.Array<Y.Map<unknown>> | null>(null);
  const yPreviewsRef = useRef<Y.Map<string> | null>(null);
  const myClientIdRef = useRef<string | null>(null);

  const isSyncingFromRemote = useRef(false);
  const historyRef = useRef<DrawingEvent[]>([]);


  const initialLayers: Layer[] = [{ id: "layer-1", name: "Layer 1", visible: true, strokes: [] }];
  const layersRef = useRef<Layer[]>(initialLayers);
  const [layers, setLayersState] = useState<Layer[]>(initialLayers);
  const [remotePreviews, setRemotePreviews] = useState<Map<string, RemotePreview>>(new Map());

  const applyLayers = useCallback((next: Layer[]) => {
    layersRef.current = next;
    setLayersState(next);
  }, []);

  const ySync = useCallback((next: Layer[]) => {
    const doc = docRef.current;
    const yLayers = yLayersRef.current;
    if (!doc || !yLayers) return;
    isSyncingFromRemote.current = true;
    doc.transact(() => syncLayersToYjs(yLayers, next));
    isSyncingFromRemote.current = false;
  }, []);

  useEffect(() => {
    const doc = new Y.Doc();
    docRef.current = doc;
    myClientIdRef.current = String(doc.clientID);

    const yLayers = doc.getArray<Y.Map<unknown>>("layers");
    yLayersRef.current = yLayers;
    const yPreviews = doc.getMap<string>("previews");
    yPreviewsRef.current = yPreviews;

    const provider = new WebsocketProvider(WS_URL, ROOM_NAME, doc);

    yLayers.observeDeep(() => {
      if (isSyncingFromRemote.current) return;
      const updated = yjsToLayers(yLayers);
      if (updated.length > 0) {
        applyLayers(updated);
      }
    });

    yPreviews.observe(() => {
      const myId = myClientIdRef.current;
      const next = new Map<string, RemotePreview>();
      yPreviews.forEach((value, clientId) => {
        if (clientId === myId) return;
        try {
          const parsed = JSON.parse(value) as RemotePreview;
          next.set(clientId, parsed);
        } catch {
          console.assert(false, `yPreviews.observe: JSON invalide pour le client "${clientId}"`);
        }
      });
      setRemotePreviews(next);
    });

    provider.on("sync", (isSynced: boolean) => {
      if (isSynced && yLayers.length === 0) {
        doc.transact(() => syncLayersToYjs(yLayers, layersRef.current));
      }
    });

    return () => {
      yPreviews.delete(String(doc.clientID));
      provider.destroy();
      doc.destroy();
    };
  }, [applyLayers]);

  /**
   * Dispatches a drawing event to update the layers state.
   * @param event - The drawing event to dispatch
   * @param options - Optional configuration for the dispatch
   * @param options.skipHistory - If true, the event won't be added to history
   */
  const dispatch = useCallback((event: DrawingEvent, options?: { skipHistory?: boolean }) => {
    const current = layersRef.current;
    const next = applyEvent(current, event);

    if (!options?.skipHistory) {
      historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), event];
    }

    ySync(next);
    applyLayers(next);
  }, [ySync, applyLayers]);

  /**
   * Annule la dernière action de dessin.
   */
  const undo = useCallback(() => {
    const history = historyRef.current;
    console.assert(history.length > 0, "undo: historique vide");
    if (history.length === 0) return;

    const lastEvent = history[history.length - 1];
    historyRef.current = history.slice(0, -1);

    dispatch(invertEvent(lastEvent), { skipHistory: true });
  }, [dispatch]);

  const publishPreview = useCallback((stroke: Stroke | null, layerId: string) => {
    const yPreviews = yPreviewsRef.current;
    const myId = myClientIdRef.current;
    if (!yPreviews || !myId) return;

    if (stroke) {
      yPreviews.set(myId, JSON.stringify({ stroke, layerId }));
    } else {
      yPreviews.delete(myId);
    }
  }, []);

  return { layers, dispatch, undo, remotePreviews, publishPreview };
}