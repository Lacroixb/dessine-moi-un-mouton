# Dessine-moi un mouton - Hooks Architecture Documentation

## Custom React Hooks Architecture

The application is built around four custom React hooks, each responsible for a specific aspect of the drawing platform.

```text
          useCollaboration
                 │
                 ▼ 
               layers
                 │
 ┌───────────────┼─────────┐
 ▼               ▼         ▼
useDrawing   useLayers   useRecorder
```

This architecture follows the **Separation of Concerns** principle, making the application easier to maintain, test, and extend.

---

# useCollaboration

## Purpose

`useCollaboration` is the core of the collaborative drawing system.

It is responsible for:

* Synchronizing the drawing state between users
* Managing WebSocket communication
* Managing shared layers
* Handling remote previews
* Maintaining undo history

## Technologies

* React Hooks
* Yjs
* y-websocket

## Initialization

When the hook starts, it creates a shared Yjs document and connects to the collaboration server.

```ts
const doc = new Y.Doc();
const provider = new WebsocketProvider(...);
```

This creates:

* A shared collaborative document
* A WebSocket connection
* A shared drawing room

## Layer Synchronization

The function:

```ts
syncLayersToYjs(...)
```

synchronizes local React state with the shared Yjs state.

```text
Local React State
        ↓
Shared Yjs State
```

This ensures all users see the same drawing.

## Remote Updates

The hook listens for modifications made by other users.

```ts
yLayers.observeDeep(...)
```

Whenever a change occurs:

```text
Client A
   ↓
 Shared Yjs State
   ↓
Client B
Client C
Client D
```

All connected clients automatically receive updates.

## Undo System

The hook stores drawing events in a local history.

```ts
historyRef
```

When Undo is triggered:

```ts
invertEvent(lastEvent)
```

An opposite event is generated automatically.

Example:

```text
ADD_STROKE
    ↓
REMOVE_STROKE
```

This allows efficient undo functionality without storing complete canvas snapshots.

---

# useDrawing

## Purpose

`useDrawing` manages all drawing interactions performed by the user.

Responsibilities include:

* Pointer down events
* Pointer move events
* Pointer up events
* Local stroke preview
* Remote preview synchronization

## Pointer Down

When the user presses the mouse button:

```ts
handlePointerDown()
```

A new stroke is created.

```text
User Click
     ↓
Create Stroke
     ↓
Local Preview
     ↓
Remote Preview
```

The preview is immediately visible to both the local user and collaborators.

## Pointer Move

While the pointer moves:

```ts
handlePointerMove()
```

New points are continuously added to the stroke.

```ts
updateStrokeWithPosition(...)
```

This creates a smooth drawing experience.

## Pointer Up

When the user releases the pointer:

```ts
handlePointerUp()
```

The preview becomes a permanent stroke.

```text
Preview Stroke
      ↓
ADD_STROKE Event
      ↓
Layer State
```

The preview is then removed.

---

# useLayers

## Purpose

`useLayers` manages all layer-related operations.

Responsibilities include:

* Creating layers
* Deleting layers
* Reordering layers
* Renaming layers
* Visibility management
* Active layer selection

## Layer Creation

```ts
addLayer()
```

Creates a new empty layer.

Example:

```text
Layer 1
Layer 2
Layer 3
```

## Layer Deletion

```ts
deleteLayer()
```

Removes a layer from the drawing.

The implementation prevents deleting the final remaining layer.

```ts
if (layers.length <= 1) return;
```

This guarantees that the canvas always contains at least one drawable layer.

## Layer Reordering

```ts
moveLayer()
```

Allows users to change rendering order.

Example:

```text
Before:
Layer 1
Layer 2
Layer 3

After:
Layer 2
Layer 1
Layer 3
```

## Visibility Toggle

```ts
toggleLayerVisibility()
```

Allows users to hide or show layers.

This works similarly to layer visibility systems found in software such as Photoshop, Krita, or GIMP.

## Layer Renaming

```ts
renameLayer()
```

Example:

```text
Layer 1
```

becomes

```text
Background
```

This improves project organization.

---

# useRecorder

## Purpose

`useRecorder` enables exporting the drawing process as a timelapse video.

This feature records the evolution of the drawing and generates a downloadable video.

## Frame Capture

Every 50 milliseconds:

```ts
stage.toDataURL()
```

captures the current state of the canvas.

```text
Canvas
   ↓
Image Frame
   ↓
Stored in Memory
```

## Frame Optimization

Before encoding:

```ts
if (raw[i] !== raw[i - 1])
```

identical consecutive frames are removed.

Benefits:

* Smaller file size
* Faster encoding
* Better performance

## Video Encoding

The implementation uses:

* MediaBunny
* VP9 codec
* WebM format

```text
Captured Frames
        ↓
VP9 Encoding
        ↓
WebM Video
```

## Export

The generated file is automatically downloaded.

Example:

```text
timelapse-123456.webm
```

---

# Software Engineering Concepts Demonstrated

This architecture demonstrates several important software engineering concepts:

## Separation of Concerns

Each hook has a single responsibility:

* Collaboration
* Drawing
* Layer Management
* Recording

## State Management

React state and references are used to maintain application consistency.

## Event-Driven Architecture

User actions generate events that update the application state.

## Real-Time Collaboration

Yjs enables efficient synchronization between multiple users.

## Layer-Based Rendering

The drawing model is organized using independent layers.

## Media Processing

Timelapse generation demonstrates image capture and video encoding techniques.

---

# Summary

The hook-based architecture provides a modular and maintainable structure for the collaborative drawing application.

By separating collaboration, drawing logic, layer management, and recording functionality into dedicated hooks, the project achieves:

* High maintainability
* Clear responsibility boundaries
* Real-time collaboration
* Extensibility for future features
* Improved code readability

This design reflects modern React development practices and software engineering principles.
