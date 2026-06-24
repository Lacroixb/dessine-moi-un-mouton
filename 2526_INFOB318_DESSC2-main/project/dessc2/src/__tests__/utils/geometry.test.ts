import { createInitialStroke, updateStrokeWithPosition } from "../../utils/geometry";
import type {
  BrushStroke, EraserStroke, RectangleStroke,
  CircleStroke, EllipseStroke, LineStroke,
} from "../../types/drawing";

const POS = { x: 100, y: 200 };

describe("createInitialStroke", () => {

  it("génère un id UUID unique à chaque appel", () => {
    const s1 = createInitialStroke("brush", POS, "#000", 5, 1);
    const s2 = createInitialStroke("brush", POS, "#000", 5, 1);
    expect(s1.id).toBeTruthy();
    expect(s2.id).toBeTruthy();
    expect(s1.id).not.toBe(s2.id);
  });

  describe("brush", () => {
    it("retourne type 'brush' avec les points initiaux", () => {
      const s = createInitialStroke("brush", POS, "#ff0000", 5, 0.8) as BrushStroke;
      expect(s.type).toBe("brush");
      expect(s.points).toEqual([100, 200]);
    });

    it("utilise la couleur et l'opacité transmises", () => {
      const s = createInitialStroke("brush", POS, "#ff0000", 5, 0.8) as BrushStroke;
      expect(s.color).toBe("#ff0000");
      expect(s.opacity).toBe(0.8);
    });
  });

  describe("eraser", () => {
    it("force color 'rgba(0,0,0,1)' quelle que soit la couleur transmise", () => {
      const s = createInitialStroke("eraser", POS, "#ff0000", 10, 0.5) as EraserStroke;
      expect(s.color).toBe("rgba(0,0,0,1)");
    });

    it("force opacity à 1 quelle que soit l'opacité transmise", () => {
      const s = createInitialStroke("eraser", POS, "#000", 10, 0.3) as EraserStroke;
      expect(s.opacity).toBe(1);
    });

    it("retourne type 'eraser' avec les points initiaux", () => {
      const s = createInitialStroke("eraser", POS, "#000", 10, 1) as EraserStroke;
      expect(s.type).toBe("eraser");
      expect(s.points).toEqual([100, 200]);
    });
  });

  describe("rectangle", () => {
    it("retourne width/height à 0 et startX/startY = pos", () => {
      const s = createInitialStroke("rectangle", POS, "#000", 2, 1) as RectangleStroke;
      expect(s.type).toBe("rectangle");
      expect(s.x).toBe(100);
      expect(s.y).toBe(200);
      expect(s.startX).toBe(100);
      expect(s.startY).toBe(200);
      expect(s.width).toBe(0);
      expect(s.height).toBe(0);
    });
  });

  describe("square", () => {
    it("se comporte comme rectangle à l'initialisation", () => {
      const s = createInitialStroke("square", POS, "#000", 2, 1) as RectangleStroke;
      expect(s.type).toBe("square");
      expect(s.width).toBe(0);
      expect(s.height).toBe(0);
      expect(s.startX).toBe(100);
      expect(s.startY).toBe(200);
    });
  });

  describe("circle", () => {
    it("retourne radius à 0 et startX/startY = pos", () => {
      const s = createInitialStroke("circle", POS, "#000", 2, 1) as CircleStroke;
      expect(s.type).toBe("circle");
      expect(s.radius).toBe(0);
      expect(s.startX).toBe(100);
      expect(s.startY).toBe(200);
    });
  });

  describe("ellipse", () => {
    it("retourne width/height à 0 et startX/startY = pos", () => {
      const s = createInitialStroke("ellipse", POS, "#000", 2, 1) as EllipseStroke;
      expect(s.type).toBe("ellipse");
      expect(s.width).toBe(0);
      expect(s.height).toBe(0);
    });
  });

  describe("line", () => {
    it("retourne les points initiaux et startX/startY", () => {
      const s = createInitialStroke("line", POS, "#000", 2, 1) as LineStroke;
      expect(s.type).toBe("line");
      expect(s.points).toEqual([100, 200]);
      expect(s.startX).toBe(100);
      expect(s.startY).toBe(200);
    });
  });

  it("lève une erreur pour un tool inconnu", () => {
    expect(() =>
      createInitialStroke("unknown_tool", POS, "#000", 5, 1)
    ).toThrow("Unknown tool type: unknown_tool");
  });
});

describe("updateStrokeWithPosition", () => {

  describe("brush", () => {
    it("accumule les points à chaque appel", () => {
      const s = createInitialStroke("brush", { x: 0, y: 0 }, "#000", 5, 1) as BrushStroke;
      const s2 = updateStrokeWithPosition(s, { x: 10, y: 20 }) as BrushStroke;
      const s3 = updateStrokeWithPosition(s2, { x: 30, y: 40 }) as BrushStroke;
      expect(s3.points).toEqual([0, 0, 10, 20, 30, 40]);
    });

    it("ne mute pas le stroke d'entrée", () => {
      const s = createInitialStroke("brush", { x: 0, y: 0 }, "#000", 5, 1) as BrushStroke;
      const original = [...s.points];
      updateStrokeWithPosition(s, { x: 10, y: 20 });
      expect(s.points).toEqual(original);
    });
  });

  describe("eraser", () => {
    it("accumule les points comme brush", () => {
      const s = createInitialStroke("eraser", { x: 0, y: 0 }, "#000", 5, 1) as EraserStroke;
      const updated = updateStrokeWithPosition(s, { x: 5, y: 10 }) as EraserStroke;
      expect(updated.points).toEqual([0, 0, 5, 10]);
    });
  });

  describe("rectangle", () => {
    it("calcule width/height depuis startX/startY", () => {
      const s = createInitialStroke("rectangle", { x: 10, y: 10 }, "#000", 2, 1) as RectangleStroke;
      const updated = updateStrokeWithPosition(s, { x: 110, y: 60 }) as RectangleStroke;
      expect(updated.width).toBe(100);
      expect(updated.height).toBe(50);
      expect(updated.x).toBe(10);
      expect(updated.y).toBe(10);
    });

    it("supporte les dimensions négatives (dessin vers le haut-gauche)", () => {
      const s = createInitialStroke("rectangle", { x: 100, y: 100 }, "#000", 2, 1) as RectangleStroke;
      const updated = updateStrokeWithPosition(s, { x: 50, y: 40 }) as RectangleStroke;
      expect(updated.width).toBe(-50);
      expect(updated.height).toBe(-60);
    });
  });

  describe("square", () => {
    it("force width === height en prenant le max des deux deltas", () => {
      const s = createInitialStroke("square", { x: 0, y: 0 }, "#000", 2, 1) as RectangleStroke;
      const updated = updateStrokeWithPosition(s, { x: 30, y: 50 }) as RectangleStroke;
      expect(Math.abs(updated.width)).toBe(50);
      expect(Math.abs(updated.height)).toBe(50);
    });

    it("préserve le signe selon la direction de dessin", () => {
      const s = createInitialStroke("square", { x: 100, y: 100 }, "#000", 2, 1) as RectangleStroke;
      const updated = updateStrokeWithPosition(s, { x: 60, y: 120 }) as RectangleStroke;
      expect(updated.width).toBe(-40);
      expect(updated.height).toBe(40);
    });
  });

  describe("circle", () => {
    it("calcule le radius via Pythagore divisé par 2", () => {
      const s = createInitialStroke("circle", { x: 0, y: 0 }, "#000", 2, 1) as CircleStroke;
      const updated = updateStrokeWithPosition(s, { x: 30, y: 40 }) as CircleStroke;
      expect(updated.radius).toBeCloseTo(25);
    });

    it("centre le cercle entre le point de départ et la position actuelle", () => {
      const s = createInitialStroke("circle", { x: 0, y: 0 }, "#000", 2, 1) as CircleStroke;
      const updated = updateStrokeWithPosition(s, { x: 100, y: 0 }) as CircleStroke;
      expect(updated.x).toBe(50);
      expect(updated.y).toBe(0);
    });

    it("radius est toujours positif", () => {
      const s = createInitialStroke("circle", { x: 50, y: 50 }, "#000", 2, 1) as CircleStroke;
      const updated = updateStrokeWithPosition(s, { x: 0, y: 0 }) as CircleStroke;
      expect(updated.radius).toBeGreaterThanOrEqual(0);
    });
  });

  describe("ellipse", () => {
    it("calcule x/y comme le centre et width/height comme demi-axes", () => {
      const s = createInitialStroke("ellipse", { x: 0, y: 0 }, "#000", 2, 1) as EllipseStroke;
      const updated = updateStrokeWithPosition(s, { x: 100, y: 60 }) as EllipseStroke;
      expect(updated.x).toBe(50);
      expect(updated.y).toBe(30);
      expect(updated.width).toBe(50);
      expect(updated.height).toBe(30);
    });

    it("width/height sont toujours positifs", () => {
      const s = createInitialStroke("ellipse", { x: 100, y: 100 }, "#000", 2, 1) as EllipseStroke;
      const updated = updateStrokeWithPosition(s, { x: 0, y: 0 }) as EllipseStroke;
      expect(updated.width).toBeGreaterThanOrEqual(0);
      expect(updated.height).toBeGreaterThanOrEqual(0);
    });
  });

  describe("line", () => {
    it("remplace les points par [startX, startY, pos.x, pos.y]", () => {
      const s = createInitialStroke("line", { x: 10, y: 20 }, "#000", 2, 1) as LineStroke;
      const updated = updateStrokeWithPosition(s, { x: 90, y: 80 }) as LineStroke;
      expect(updated.points).toEqual([10, 20, 90, 80]);
    });

    it("mettre à jour plusieurs fois ne fait pas grossir le tableau", () => {
      const s = createInitialStroke("line", { x: 0, y: 0 }, "#000", 2, 1) as LineStroke;
      const s2 = updateStrokeWithPosition(s, { x: 10, y: 10 }) as LineStroke;
      const s3 = updateStrokeWithPosition(s2, { x: 99, y: 99 }) as LineStroke;
      expect(s3.points).toHaveLength(4);
      expect(s3.points).toEqual([0, 0, 99, 99]);
    });
  });
});
