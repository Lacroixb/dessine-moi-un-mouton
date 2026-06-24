import { applyEvent, invertEvent } from "../../utils/events";
import {
  brushStroke, rectangleStroke, circleStroke,
  emptyLayer, layerWithStrokes, hiddenLayer,
  secondLayer,
  twoLayers, threeLayers,
} from "../../testUtils/fixtures";
import type { Layer } from "../../types/drawing";

describe("applyEvent", () => {
  describe("ADD_STROKE", () => {
    it("ajoute le stroke à la bonne layer", () => {
      const result = applyEvent(twoLayers, {
        type: "ADD_STROKE",
        layerId: "layer-1",
        stroke: brushStroke,
      });
      expect(result[0].strokes).toHaveLength(1);
      expect(result[0].strokes[0]).toEqual(brushStroke);
    });

    it("n'affecte pas les autres layers", () => {
      const result = applyEvent(twoLayers, {
        type: "ADD_STROKE",
        layerId: "layer-1",
        stroke: brushStroke,
      });
      expect(result[1].strokes).toHaveLength(0);
    });

    it("préserve l'ordre des strokes existants", () => {
      const result = applyEvent([layerWithStrokes], {
        type: "ADD_STROKE",
        layerId: "layer-1",
        stroke: circleStroke,
      });
      expect(result[0].strokes[0].id).toBe("stroke-brush-1");
      expect(result[0].strokes[1].id).toBe("stroke-rect-1");
      expect(result[0].strokes[2].id).toBe("stroke-circle-1");
    });

    it("ne mute pas le tableau d'entrée", () => {
      const layers = [{ ...emptyLayer, strokes: [] }];
      applyEvent(layers, { type: "ADD_STROKE", layerId: "layer-1", stroke: brushStroke });
      expect(layers[0].strokes).toHaveLength(0);
    });
  });

  describe("REMOVE_STROKE", () => {
    it("supprime uniquement le stroke ciblé par id", () => {
      const result = applyEvent([layerWithStrokes], {
        type: "REMOVE_STROKE",
        layerId: "layer-1",
        stroke: brushStroke,
      });
      expect(result[0].strokes).toHaveLength(1);
      expect(result[0].strokes[0].id).toBe("stroke-rect-1");
    });

    it("ne touche pas les strokes des autres layers", () => {
      const layerA: Layer = { id: "layer-1", name: "A", visible: true, strokes: [brushStroke] };
      const layerB: Layer = { id: "layer-2", name: "B", visible: true, strokes: [rectangleStroke] };
      const result = applyEvent([layerA, layerB], {
        type: "REMOVE_STROKE",
        layerId: "layer-1",
        stroke: brushStroke,
      });
      expect(result[1].strokes).toHaveLength(1);
    });

    it("ne mute pas le tableau d'entrée", () => {
      const layers = [{ ...layerWithStrokes, strokes: [...layerWithStrokes.strokes] }];
      applyEvent(layers, { type: "REMOVE_STROKE", layerId: "layer-1", stroke: brushStroke });
      expect(layers[0].strokes).toHaveLength(2);
    });

    it("est idempotent si le stroke n'existe pas", () => {
      const result = applyEvent([emptyLayer], {
        type: "REMOVE_STROKE",
        layerId: "layer-1",
        stroke: brushStroke,
      });
      expect(result[0].strokes).toHaveLength(0);
    });
  });

  describe("ADD_LAYER", () => {
    it("ajoute la layer à la fin", () => {
      const result = applyEvent([emptyLayer], { type: "ADD_LAYER", layer: secondLayer });
      expect(result).toHaveLength(2);
      expect(result[1].id).toBe("layer-2");
    });

    it("ne modifie pas les layers existantes", () => {
      const result = applyEvent([emptyLayer], { type: "ADD_LAYER", layer: secondLayer });
      expect(result[0]).toEqual(emptyLayer);
    });

    it("ne mute pas le tableau d'entrée", () => {
      const layers = [{ ...emptyLayer }];
      applyEvent(layers, { type: "ADD_LAYER", layer: secondLayer });
      expect(layers).toHaveLength(1);
    });

    it("préserve les strokes de la nouvelle layer", () => {
      const result = applyEvent([emptyLayer], { type: "ADD_LAYER", layer: layerWithStrokes });
      expect(result[result.length - 1].strokes).toHaveLength(2);
    });
  });

  describe("REMOVE_LAYER", () => {
    it("supprime la layer ciblée", () => {
      const result = applyEvent(twoLayers, { type: "REMOVE_LAYER", layer: emptyLayer });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("layer-2");
    });

    it("ne mute pas le tableau d'entrée", () => {
      const layers = [...twoLayers];
      applyEvent(layers, { type: "REMOVE_LAYER", layer: emptyLayer });
      expect(layers).toHaveLength(2);
    });
  });

  describe("RENAME_LAYER", () => {
    it("renomme uniquement la layer ciblée", () => {
      const result = applyEvent(twoLayers, {
        type: "RENAME_LAYER",
        layerId: "layer-1",
        oldName: "Layer 1",
        newName: "Fond",
      });
      expect(result[0].name).toBe("Fond");
      expect(result[1].name).toBe("Layer 2");
    });

    it("ne mute pas le tableau d'entrée", () => {
      const layers = [{ ...emptyLayer }];
      applyEvent(layers, {
        type: "RENAME_LAYER",
        layerId: "layer-1",
        oldName: "Layer 1",
        newName: "X",
      });
      expect(layers[0].name).toBe("Layer 1");
    });
  });

  describe("MOVE_LAYER", () => {
    it("déplace une layer vers le haut (index diminue)", () => {
      const result = applyEvent(threeLayers, {
        type: "MOVE_LAYER",
        layerId: "layer-2",
        fromIndex: 1,
        toIndex: 0,
      });
      expect(result[0].id).toBe("layer-2");
      expect(result[1].id).toBe("layer-1");
      expect(result[2].id).toBe("layer-3");
    });

    it("déplace une layer vers le bas (index augmente)", () => {
      const result = applyEvent(threeLayers, {
        type: "MOVE_LAYER",
        layerId: "layer-1",
        fromIndex: 0,
        toIndex: 2,
      });
      expect(result[0].id).toBe("layer-2");
      expect(result[1].id).toBe("layer-3");
      expect(result[2].id).toBe("layer-1");
    });

    it("ne mute pas le tableau d'entrée", () => {
      const layers = [...threeLayers];
      applyEvent(layers, {
        type: "MOVE_LAYER",
        layerId: "layer-1",
        fromIndex: 0,
        toIndex: 1,
      });
      expect(layers[0].id).toBe("layer-1");
    });
  });

  describe("TOGGLE_VISIBILITY", () => {
    it("passe visible:true à false", () => {
      const result = applyEvent([emptyLayer], {
        type: "TOGGLE_VISIBILITY",
        layerId: "layer-1",
      });
      expect(result[0].visible).toBe(false);
    });

    it("passe visible:false à true", () => {
      const result = applyEvent([hiddenLayer], {
        type: "TOGGLE_VISIBILITY",
        layerId: "layer-3",
      });
      expect(result[0].visible).toBe(true);
    });

    it("ne touche pas les autres layers", () => {
      const result = applyEvent(twoLayers, {
        type: "TOGGLE_VISIBILITY",
        layerId: "layer-1",
      });
      expect(result[1].visible).toBe(true);
    });
  });
});

describe("invertEvent", () => {

  it("ADD_STROKE -> REMOVE_STROKE avec le même stroke et layerId", () => {
    const event = { type: "ADD_STROKE" as const, layerId: "layer-1", stroke: brushStroke };
    const inverse = invertEvent(event);
    expect(inverse.type).toBe("REMOVE_STROKE");
    if (inverse.type === "REMOVE_STROKE") {
      expect(inverse.stroke).toEqual(brushStroke);
      expect(inverse.layerId).toBe("layer-1");
    }
  });

  it("REMOVE_STROKE -> ADD_STROKE avec le même stroke", () => {
    const event = { type: "REMOVE_STROKE" as const, layerId: "layer-1", stroke: brushStroke };
    const inverse = invertEvent(event);
    expect(inverse.type).toBe("ADD_STROKE");
    if (inverse.type === "ADD_STROKE") {
      expect(inverse.stroke).toEqual(brushStroke);
    }
  });

  it("ADD_LAYER -> REMOVE_LAYER avec la même layer", () => {
    const event = { type: "ADD_LAYER" as const, layer: secondLayer };
    const inverse = invertEvent(event);
    expect(inverse.type).toBe("REMOVE_LAYER");
    if (inverse.type === "REMOVE_LAYER") {
      expect(inverse.layer).toEqual(secondLayer);
    }
  });

  it("REMOVE_LAYER -> ADD_LAYER - restaure la layer avec tous ses strokes", () => {
    const event = { type: "REMOVE_LAYER" as const, layer: layerWithStrokes };
    const inverse = invertEvent(event);
    expect(inverse.type).toBe("ADD_LAYER");
    if (inverse.type === "ADD_LAYER") {
      expect(inverse.layer.strokes).toHaveLength(2);
    }
  });

  it("RENAME_LAYER inverse oldName et newName", () => {
    const event = {
      type: "RENAME_LAYER" as const,
      layerId: "layer-1",
      oldName: "Avant",
      newName: "Après",
    };
    const inverse = invertEvent(event);
    expect(inverse.type).toBe("RENAME_LAYER");
    if (inverse.type === "RENAME_LAYER") {
      expect(inverse.newName).toBe("Avant");
      expect(inverse.oldName).toBe("Après");
    }
  });

  it("MOVE_LAYER inverse fromIndex et toIndex", () => {
    const event = {
      type: "MOVE_LAYER" as const,
      layerId: "layer-1",
      fromIndex: 0,
      toIndex: 2,
    };
    const inverse = invertEvent(event);
    expect(inverse.type).toBe("MOVE_LAYER");
    if (inverse.type === "MOVE_LAYER") {
      expect(inverse.fromIndex).toBe(2);
      expect(inverse.toIndex).toBe(0);
    }
  });

  it("TOGGLE_VISIBILITY est self-inverse", () => {
    const event = { type: "TOGGLE_VISIBILITY" as const, layerId: "layer-1" };
    expect(invertEvent(event)).toEqual(event);
  });


  it("apply * invert * apply = identité pour ADD_STROKE", () => {
    const initial = [{ ...emptyLayer }];
    const event = { type: "ADD_STROKE" as const, layerId: "layer-1", stroke: brushStroke };
    const after = applyEvent(initial, event);
    const restored = applyEvent(after, invertEvent(event));
    expect(restored[0].strokes).toHaveLength(0);
  });

  it("apply * invert * apply = identité pour MOVE_LAYER", () => {
    const event = {
      type: "MOVE_LAYER" as const,
      layerId: "layer-1",
      fromIndex: 0,
      toIndex: 2,
    };
    const after = applyEvent(threeLayers, event);
    const restored = applyEvent(after, invertEvent(event));
    expect(restored.map(l => l.id)).toEqual(["layer-1", "layer-2", "layer-3"]);
  });

  it("apply * invert * apply = identité pour RENAME_LAYER", () => {
    const event = {
      type: "RENAME_LAYER" as const,
      layerId: "layer-1",
      oldName: "Layer 1",
      newName: "Fond",
    };
    const after = applyEvent([{ ...emptyLayer }], event);
    const restored = applyEvent(after, invertEvent(event));
    expect(restored[0].name).toBe("Layer 1");
  });

  it("apply * invert * apply = identité pour TOGGLE_VISIBILITY", () => {
    const initial = [{ ...emptyLayer }];
    const event = { type: "TOGGLE_VISIBILITY" as const, layerId: "layer-1" };
    const after = applyEvent(initial, event);
    expect(after[0].visible).toBe(false);
    const restored = applyEvent(after, invertEvent(event));
    expect(restored[0].visible).toBe(true);
  });

  it("apply * invert * apply = identité pour ADD_LAYER / REMOVE_LAYER", () => {
    const addEvent = { type: "ADD_LAYER" as const, layer: secondLayer };
    const after = applyEvent([emptyLayer], addEvent);
    expect(after).toHaveLength(2);
    const restored = applyEvent(after, invertEvent(addEvent));
    expect(restored).toHaveLength(1);
    expect(restored[0].id).toBe("layer-1");
  });
});
