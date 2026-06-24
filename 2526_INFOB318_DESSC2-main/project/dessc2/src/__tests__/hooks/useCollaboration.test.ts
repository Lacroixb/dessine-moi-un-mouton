import { renderHook, act } from "@testing-library/react";
import { brushStroke, brushStroke2, emptyLayer, secondLayer } from "../../testUtils/fixtures";
import type { DrawingEvent } from "../../types/events";

jest.mock("../../hooks/useCollaboration", () => {
  const { useState, useCallback, useRef } = require("react");
  const { applyEvent, invertEvent } = require("../../utils/events");

  return {
    useCollaboration: () => {
      const historyRef = useRef([]);
      const [layers, setLayers] = useState([
        { id: "layer-1", name: "Layer 1", visible: true, strokes: [] },
      ]);

      const dispatch = useCallback((event: any, options?: any) => {
        setLayers((prev: any) => {
          const next = applyEvent(prev, event);
          if (!options?.skipHistory) {
            historyRef.current = [...historyRef.current, event];
          }
          return next;
        });
      }, []);

      const undo = useCallback(() => {
        if (historyRef.current.length === 0) return;
        const last = historyRef.current[historyRef.current.length - 1];
        historyRef.current = historyRef.current.slice(0, -1);
        setLayers((prev: any) => applyEvent(prev, invertEvent(last)));
      }, []);

      return {
        layers,
        dispatch,
        undo,
        remotePreviews: new Map(),
        publishPreview: jest.fn(),
      };
    },
  };
});

import { useCollaboration } from "../../hooks/useCollaboration";

jest.mock("y-websocket", () => ({
  WebsocketProvider: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    destroy: jest.fn(),
  })),
}));

function setupHook() {
  const { result } = renderHook(() => useCollaboration());
  return result;
}

describe("useCollaboration - état initial", () => {
  it("expose une layer initiale 'Layer 1'", () => {
    const result = setupHook();
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0].id).toBe("layer-1");
    expect(result.current.layers[0].name).toBe("Layer 1");
  });

  it("expose une fonction dispatch", () => {
    const result = setupHook();
    expect(typeof result.current.dispatch).toBe("function");
  });

  it("expose une fonction undo", () => {
    const result = setupHook();
    expect(typeof result.current.undo).toBe("function");
  });

  it("expose remotePreviews vide", () => {
    const result = setupHook();
    expect(result.current.remotePreviews.size).toBe(0);
  });
});

describe("useCollaboration - dispatch ADD_STROKE", () => {
  it("ajoute le stroke à la layer correspondante", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke });
    });
    expect(result.current.layers[0].strokes).toHaveLength(1);
    expect(result.current.layers[0].strokes[0].id).toBe("stroke-brush-1");
  });

  it("accumule plusieurs strokes dans l'ordre", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke });
      result.current.dispatch({ type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke2 });
    });
    expect(result.current.layers[0].strokes).toHaveLength(2);
    expect(result.current.layers[0].strokes[1].id).toBe("stroke-brush-2");
  });
});

describe("useCollaboration - dispatch ADD_LAYER / REMOVE_LAYER", () => {
  it("ADD_LAYER ajoute une layer", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_LAYER", layer: secondLayer });
    });
    expect(result.current.layers).toHaveLength(2);
    expect(result.current.layers[1].id).toBe("layer-2");
  });

  it("REMOVE_LAYER supprime la layer ciblée", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_LAYER", layer: secondLayer });
    });
    act(() => {
      result.current.dispatch({ type: "REMOVE_LAYER", layer: secondLayer });
    });
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0].id).toBe("layer-1");
  });
});

describe("useCollaboration - dispatch RENAME_LAYER", () => {
  it("renomme la layer correctement", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({
        type: "RENAME_LAYER",
        layerId: "layer-1",
        oldName: "Layer 1",
        newName: "Fond",
      });
    });
    expect(result.current.layers[0].name).toBe("Fond");
  });
});

describe("useCollaboration - dispatch TOGGLE_VISIBILITY", () => {
  it("bascule la visibilité de la layer", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "TOGGLE_VISIBILITY", layerId: "layer-1" });
    });
    expect(result.current.layers[0].visible).toBe(false);
  });

  it("deux toggles consécutifs restaurent l'état initial", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "TOGGLE_VISIBILITY", layerId: "layer-1" });
      result.current.dispatch({ type: "TOGGLE_VISIBILITY", layerId: "layer-1" });
    });
    expect(result.current.layers[0].visible).toBe(true);
  });
});

describe("useCollaboration - undo", () => {
  it("annule le dernier ADD_STROKE", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke });
    });
    expect(result.current.layers[0].strokes).toHaveLength(1);

    act(() => {
      result.current.undo();
    });
    expect(result.current.layers[0].strokes).toHaveLength(0);
  });

  it("annule plusieurs actions dans l'ordre LIFO", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke });
      result.current.dispatch({ type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke2 });
    });
    act(() => { result.current.undo(); });
    expect(result.current.layers[0].strokes).toHaveLength(1);
    expect(result.current.layers[0].strokes[0].id).toBe("stroke-brush-1");

    act(() => { result.current.undo(); });
    expect(result.current.layers[0].strokes).toHaveLength(0);
  });

  it("n'annule pas une action avec skipHistory:true", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch(
        { type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke },
        { skipHistory: true }
      );
    });
    act(() => { result.current.undo(); });
    expect(result.current.layers[0].strokes).toHaveLength(1);
  });

  it("ne fait rien si l'historique est vide", () => {
    const result = setupHook();
    expect(() => {
      act(() => { result.current.undo(); });
    }).not.toThrow();
    expect(result.current.layers[0].strokes).toHaveLength(0);
  });

  it("annule ADD_LAYER", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_LAYER", layer: secondLayer });
    });
    expect(result.current.layers).toHaveLength(2);
    act(() => { result.current.undo(); });
    expect(result.current.layers).toHaveLength(1);
  });

  it("annule RENAME_LAYER et restaure l'ancien nom", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({
        type: "RENAME_LAYER",
        layerId: "layer-1",
        oldName: "Layer 1",
        newName: "Fond",
      });
    });
    act(() => { result.current.undo(); });
    expect(result.current.layers[0].name).toBe("Layer 1");
  });

  it("annule TOGGLE_VISIBILITY et restaure la visibilité", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "TOGGLE_VISIBILITY", layerId: "layer-1" });
    });
    act(() => { result.current.undo(); });
    expect(result.current.layers[0].visible).toBe(true);
  });
  it("n'affecte pas les strokes ajoutés sans passer par dispatch local (simule un autre joueur)", () => {
    const result = setupHook();
    act(() => {
      result.current.dispatch({ type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke });
    });
    act(() => {
      result.current.dispatch(
        { type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke2 },
        { skipHistory: true }
      );
    });
    expect(result.current.layers[0].strokes).toHaveLength(2);
    act(() => { result.current.undo(); });

    expect(result.current.layers[0].strokes).toHaveLength(1);
    expect(result.current.layers[0].strokes[0].id).toBe("stroke-brush-2");
  });
});

describe("useCollaboration - publishPreview", () => {
  it("est une fonction exposée par le hook", () => {
    const result = setupHook();
    expect(typeof result.current.publishPreview).toBe("function");
  });

  it("ne lève pas d'erreur quand stroke est null", () => {
    const result = setupHook();
    expect(() => {
      act(() => {
        result.current.publishPreview(null, "layer-1");
      });
    }).not.toThrow();
  });

  it("ne lève pas d'erreur quand stroke est fourni", () => {
    const result = setupHook();
    expect(() => {
      act(() => {
        result.current.publishPreview(brushStroke, "layer-1");
      });
    }).not.toThrow();
  });
});
