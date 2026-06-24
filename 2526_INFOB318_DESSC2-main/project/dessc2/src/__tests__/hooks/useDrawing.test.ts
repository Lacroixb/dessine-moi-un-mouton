import { renderHook, act } from "@testing-library/react";
import { useDrawing } from "../../hooks/useDrawing";
import { emptyLayer, secondLayer } from "../../testUtils/fixtures";
import { BRUSH_CONFIG } from "../../constants/tools";
import type { Layer } from "../../types/drawing";

function makeStageRef(pos: { x: number; y: number } | null = { x: 50, y: 80 }) {
  return {
    current: pos
      ? { getRelativePointerPosition: () => pos }
      : { getRelativePointerPosition: () => null },
  } as any;
}

const DEFAULT_PROPS = {
  layers: [emptyLayer],
  activeLayerId: "layer-1",
  tool: "brush",
  brushColor: "#000000",
  brushSize: BRUSH_CONFIG.SIZE.DEFAULT as number,
  brushOpacity: BRUSH_CONFIG.OPACITY.DEFAULT as number,
};

function setup(overrides: Partial<typeof DEFAULT_PROPS> = {}, pos = { x: 50, y: 80 }) {
  const stageRef = makeStageRef(pos);
  const dispatch = jest.fn();
  const publishPreview = jest.fn();
  const props = { stageRef, dispatch, publishPreview, ...DEFAULT_PROPS, ...overrides };
  const { result, rerender } = renderHook(() => useDrawing(props));
  return { result, rerender, dispatch, publishPreview, stageRef };
}

describe("useDrawing - état initial", () => {
  it("previewStroke est null au départ", () => {
    const { result } = setup();
    expect(result.current.previewStroke).toBeNull();
  });

  it("expose les handlers pointerDown, pointerMove, pointerUp", () => {
    const { result } = setup();
    expect(typeof result.current.handlePointerDown).toBe("function");
    expect(typeof result.current.handlePointerMove).toBe("function");
    expect(typeof result.current.handlePointerUp).toBe("function");
  });
});


describe("useDrawing - handlePointerDown", () => {
  it("crée un previewStroke avec le bon type d'outil", () => {
    const { result } = setup({ tool: "brush" });
    act(() => result.current.handlePointerDown());
    expect(result.current.previewStroke).not.toBeNull();
    expect(result.current.previewStroke?.type).toBe("brush");
  });

  it("initialise les points à la position du pointeur", () => {
    const { result } = setup({ tool: "brush" }, { x: 100, y: 200 });
    act(() => result.current.handlePointerDown());
    const stroke = result.current.previewStroke as any;
    expect(stroke.points).toEqual([100, 200]);
  });

  it("appelle publishPreview avec le stroke et le layerId", () => {
    const { result, publishPreview } = setup();
    act(() => result.current.handlePointerDown());
    expect(publishPreview).toHaveBeenCalledTimes(1);
    expect(publishPreview).toHaveBeenCalledWith(
      expect.objectContaining({ type: "brush" }),
      "layer-1"
    );
  });

  it("ne dispatche rien au pointerDown", () => {
    const { result, dispatch } = setup();
    act(() => result.current.handlePointerDown());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("ne fait rien si le stageRef ne retourne pas de position", () => {
    const stageRef = makeStageRef(null);
    const dispatch = jest.fn();
    const publishPreview = jest.fn();
    const { result } = renderHook(() =>
      useDrawing({ stageRef, dispatch, publishPreview, ...DEFAULT_PROPS })
    );
    act(() => result.current.handlePointerDown());
    expect(result.current.previewStroke).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("crée un eraser avec color rgba(0,0,0,1) et opacity 1", () => {
    const { result } = setup({ tool: "eraser", brushColor: "#ff0000", brushOpacity: 0.5 });
    act(() => result.current.handlePointerDown());
    expect(result.current.previewStroke?.color).toBe("rgba(0,0,0,1)");
    expect(result.current.previewStroke?.opacity).toBe(1);
  });
});

describe("useDrawing - handlePointerMove", () => {
  it("ne fait rien si aucun pointerDown n'a eu lieu", () => {
    const { result, dispatch, publishPreview } = setup();
    act(() => result.current.handlePointerMove());
    expect(result.current.previewStroke).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
    expect(publishPreview).not.toHaveBeenCalled();
  });

  it("accumule les points du brush après pointerDown + pointerMove", () => {
    const stageRef = makeStageRef({ x: 0, y: 0 });
    const dispatch = jest.fn();
    const publishPreview = jest.fn();

    const { result, rerender } = renderHook(
      ({ pos }) =>
        useDrawing({
          stageRef: makeStageRef(pos),
          dispatch,
          publishPreview,
          ...DEFAULT_PROPS,
        }),
      { initialProps: { pos: { x: 0, y: 0 } } }
    );

    act(() => result.current.handlePointerDown());
    rerender({ pos: { x: 30, y: 40 } });
    act(() => result.current.handlePointerMove());

    const stroke = result.current.previewStroke as any;
    expect(stroke.points).toContain(30);
    expect(stroke.points).toContain(40);
  });

  it("appelle publishPreview à chaque mouvement", () => {
    const { result, publishPreview } = setup();
    act(() => result.current.handlePointerDown());
    act(() => result.current.handlePointerMove());
    expect(publishPreview).toHaveBeenCalledTimes(2);
  });
});

describe("useDrawing - handlePointerUp", () => {
  it("dispatche ADD_STROKE avec le stroke final au pointerUp", () => {
    const { result, dispatch } = setup();
    act(() => result.current.handlePointerDown());
    act(() => result.current.handlePointerUp());

    expect(dispatch).toHaveBeenCalledTimes(1);
    const event = dispatch.mock.calls[0][0];
    expect(event.type).toBe("ADD_STROKE");
    expect(event.layerId).toBe("layer-1");
    expect(event.stroke).toBeTruthy();
  });

  it("réinitialise previewStroke à null après pointerUp", () => {
    const { result } = setup();
    act(() => result.current.handlePointerDown());
    expect(result.current.previewStroke).not.toBeNull();
    act(() => result.current.handlePointerUp());
    expect(result.current.previewStroke).toBeNull();
  });

  it("appelle publishPreview(null) pour effacer la preview partagée", () => {
    const { result, publishPreview } = setup();
    act(() => result.current.handlePointerDown());
    act(() => result.current.handlePointerUp());
    expect(publishPreview).toHaveBeenLastCalledWith(null, "layer-1");
  });

  it("ne dispatche rien si pointerUp sans pointerDown préalable", () => {
    const { result, dispatch } = setup();
    act(() => result.current.handlePointerUp());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("le stroke dispatchée contient les points accumulés pendant le move", () => {
    const capturedDispatch = jest.fn();
    const { result: r, rerender } = renderHook(
      ({ pos }) =>
        useDrawing({
          stageRef: makeStageRef(pos),
          dispatch: capturedDispatch,
          publishPreview: jest.fn(),
          ...DEFAULT_PROPS,
        }),
      { initialProps: { pos: { x: 0, y: 0 } } }
    );

    act(() => r.current.handlePointerDown());
    rerender({ pos: { x: 50, y: 60 } });
    act(() => r.current.handlePointerMove());
    act(() => r.current.handlePointerUp());

    const event = capturedDispatch.mock.calls[0][0];
    expect(event.stroke.points).toContain(50);
    expect(event.stroke.points).toContain(60);
  });

  it("dispatche exactement une fois par trait complet (down -> move × N -> up)", () => {
    const stageRef = makeStageRef({ x: 0, y: 0 });
    const dispatch = jest.fn();
    const publishPreview = jest.fn();

    const { result, rerender } = renderHook(
      ({ pos }) =>
        useDrawing({ stageRef: makeStageRef(pos), dispatch, publishPreview, ...DEFAULT_PROPS }),
      { initialProps: { pos: { x: 0, y: 0 } } }
    );

    act(() => result.current.handlePointerDown());
    rerender({ pos: { x: 10, y: 10 } });
    act(() => result.current.handlePointerMove());
    rerender({ pos: { x: 20, y: 20 } });
    act(() => result.current.handlePointerMove());
    rerender({ pos: { x: 30, y: 30 } });
    act(() => result.current.handlePointerMove());
    act(() => result.current.handlePointerUp());

    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe("useDrawing - outils formes", () => {
  it("crée un rectangle avec startX/startY au pointerDown", () => {
    const { result } = setup({ tool: "rectangle" }, { x: 20, y: 30 });
    act(() => result.current.handlePointerDown());
    const stroke = result.current.previewStroke as any;
    expect(stroke.type).toBe("rectangle");
    expect(stroke.startX).toBe(20);
    expect(stroke.startY).toBe(30);
  });

  it("met à jour width/height du rectangle au pointerMove", () => {
    const dispatch = jest.fn();
    const publishPreview = jest.fn();
    const { result, rerender } = renderHook(
      ({ pos }) =>
        useDrawing({
          stageRef: makeStageRef(pos),
          dispatch,
          publishPreview,
          ...DEFAULT_PROPS,
          tool: "rectangle",
        }),
      { initialProps: { pos: { x: 0, y: 0 } } }
    );

    act(() => result.current.handlePointerDown());
    rerender({ pos: { x: 100, y: 50 } });
    act(() => result.current.handlePointerMove());

    const stroke = result.current.previewStroke as any;
    expect(stroke.width).toBe(100);
    expect(stroke.height).toBe(50);
  });

  it("crée un circle avec radius 0 au pointerDown", () => {
    const { result } = setup({ tool: "circle" });
    act(() => result.current.handlePointerDown());
    const stroke = result.current.previewStroke as any;
    expect(stroke.type).toBe("circle");
    expect(stroke.radius).toBe(0);
  });

  it("dispatche le stroke de la bonne layer active", () => {
    const layers: Layer[] = [
      { id: "layer-1", name: "L1", visible: true, strokes: [] },
      { id: "layer-2", name: "L2", visible: true, strokes: [] },
    ];
    const { result, dispatch } = setup({ layers, activeLayerId: "layer-2" });
    act(() => result.current.handlePointerDown());
    act(() => result.current.handlePointerUp());

    const event = dispatch.mock.calls[0][0];
    expect(event.layerId).toBe("layer-2");
  });
});