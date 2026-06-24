import { renderHook, act } from "@testing-library/react";
import { useLayers } from "../../hooks/useLayers";
import { emptyLayer, secondLayer, thirdLayer, twoLayers, threeLayers } from "../../testUtils/fixtures";
import type { DrawingEvent } from "../../types/events";
import type { Layer } from "../../types/drawing";

function setup(layers: Layer[] = twoLayers) {
  const dispatch = jest.fn();
  const undo = jest.fn();
  const { result, rerender } = renderHook(
    ({ l }) => useLayers(l, dispatch, undo),
    { initialProps: { l: layers } }
  );
  return { result, rerender, dispatch, undo };
}

describe("useLayers - activeLayerId", () => {
  it("initialise activeLayerId avec l'id de la première layer", () => {
    const { result } = setup([emptyLayer, secondLayer]);
    expect(result.current.activeLayerId).toBe("layer-1");
  });

  it("setActiveLayerId met à jour l'id actif", () => {
    const { result } = setup();
    act(() => result.current.setActiveLayerId("layer-2"));
    expect(result.current.activeLayerId).toBe("layer-2");
  });
});

describe("useLayers - addLayer", () => {
  it("dispatche ADD_LAYER avec une layer visible et sans strokes", () => {
    const { result, dispatch } = setup([emptyLayer]);
    act(() => result.current.addLayer());

    expect(dispatch).toHaveBeenCalledTimes(1);
    const event = dispatch.mock.calls[0][0] as DrawingEvent;
    expect(event.type).toBe("ADD_LAYER");
    if (event.type === "ADD_LAYER") {
      expect(event.layer.visible).toBe(true);
      expect(event.layer.strokes).toHaveLength(0);
      expect(event.layer.id).toBeTruthy();
    }
  });

  it("nomme la nouvelle layer 'Layer N+1'", () => {
    const { result, dispatch } = setup([emptyLayer]);
    act(() => result.current.addLayer());
    const event = dispatch.mock.calls[0][0] as DrawingEvent;
    if (event.type === "ADD_LAYER") {
      expect(event.layer.name).toBe("Layer 2");
    }
  });

  it("met à jour activeLayerId vers la nouvelle layer", () => {
    const { result } = setup([emptyLayer]);
    act(() => result.current.addLayer());
    expect(result.current.activeLayerId).not.toBe("layer-1");
  });
});

describe("useLayers - deleteLayer", () => {
  it("dispatche REMOVE_LAYER avec la layer complète", () => {
    const { result, dispatch } = setup(twoLayers);
    act(() => result.current.deleteLayer("layer-1"));

    expect(dispatch).toHaveBeenCalledTimes(1);
    const event = dispatch.mock.calls[0][0] as DrawingEvent;
    expect(event.type).toBe("REMOVE_LAYER");
    if (event.type === "REMOVE_LAYER") {
      expect(event.layer.id).toBe("layer-1");
    }
  });

  it("ne dispatche rien s'il ne reste qu'une seule layer", () => {
    const { result, dispatch } = setup([emptyLayer]);
    act(() => result.current.deleteLayer("layer-1"));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("met à jour activeLayerId si la layer active est supprimée", () => {
    const { result, rerender } = setup(twoLayers);
    act(() => result.current.setActiveLayerId("layer-1"));
    act(() => result.current.deleteLayer("layer-1"));
    rerender({ l: [secondLayer] });

    expect(result.current.activeLayerId).toBe("layer-2");
  });

  it("ne change pas activeLayerId si une autre layer est supprimée", () => {
    const { result, dispatch } = setup(twoLayers);
    act(() => result.current.setActiveLayerId("layer-1"));
    act(() => result.current.deleteLayer("layer-2"));
    expect(result.current.activeLayerId).toBe("layer-1");
  });
});

describe("useLayers - moveLayer", () => {
  it("dispatche MOVE_LAYER avec fromIndex/toIndex corrects pour 'up'", () => {
    const { result, dispatch } = setup(threeLayers);

    act(() => result.current.moveLayer("layer-2", "up"));

    expect(dispatch).toHaveBeenCalledTimes(1);
    const event = dispatch.mock.calls[0][0] as DrawingEvent;
    expect(event.type).toBe("MOVE_LAYER");
    if (event.type === "MOVE_LAYER") {
      expect(event.fromIndex).toBe(1);
      expect(event.toIndex).toBe(0);
    }
  });

  it("dispatche MOVE_LAYER avec fromIndex/toIndex corrects pour 'down'", () => {
    const { result, dispatch } = setup(threeLayers);
    act(() => result.current.moveLayer("layer-1", "down"));

    const event = dispatch.mock.calls[0][0] as DrawingEvent;
    if (event.type === "MOVE_LAYER") {
      expect(event.fromIndex).toBe(0);
      expect(event.toIndex).toBe(1);
    }
  });

  it("ne dispatche rien si la layer est déjà en haut et direction 'up'", () => {
    const { result, dispatch } = setup(twoLayers);
    act(() => result.current.moveLayer("layer-1", "up"));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("ne dispatche rien si la layer est déjà en bas et direction 'down'", () => {
    const { result, dispatch } = setup(twoLayers);
    act(() => result.current.moveLayer("layer-2", "down"));
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("useLayers - toggleLayerVisibility", () => {
  it("dispatche TOGGLE_VISIBILITY avec le bon layerId", () => {
    const { result, dispatch } = setup(twoLayers);
    act(() => result.current.toggleLayerVisibility("layer-2"));

    expect(dispatch).toHaveBeenCalledTimes(1);
    const event = dispatch.mock.calls[0][0] as DrawingEvent;
    expect(event.type).toBe("TOGGLE_VISIBILITY");
    if (event.type === "TOGGLE_VISIBILITY") {
      expect(event.layerId).toBe("layer-2");
    }
  });
});

describe("useLayers - renameLayer", () => {
  it("dispatche RENAME_LAYER avec oldName et newName corrects", () => {
    const { result, dispatch } = setup([emptyLayer]);
    act(() => result.current.renameLayer("layer-1", "Fond"));

    expect(dispatch).toHaveBeenCalledTimes(1);
    const event = dispatch.mock.calls[0][0] as DrawingEvent;
    expect(event.type).toBe("RENAME_LAYER");
    if (event.type === "RENAME_LAYER") {
      expect(event.oldName).toBe("Layer 1");
      expect(event.newName).toBe("Fond");
      expect(event.layerId).toBe("layer-1");
    }
  });

  it("ne dispatche rien si la layer n'existe pas", () => {
    const { result, dispatch } = setup([emptyLayer]);
    act(() => result.current.renameLayer("layer-inexistante", "X"));
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("useLayers - undo", () => {
  it("appelle la fonction undo passée en paramètre", () => {
    const { result, undo } = setup();
    act(() => result.current.undo());
    expect(undo).toHaveBeenCalledTimes(1);
  });
});
