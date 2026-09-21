import type { Editor, Editor42 } from 'editor42';

export const validEvents = [
  'Activate',
  'AddUndo',
  'BeforeAddUndo',
  'BeforeExecCommand',
  'BeforeGetContent',
  'BeforeRenderUI',
  'BeforeSetContent',
  'BeforePaste',
  'Blur',
  'Change',
  'ClearUndos',
  'Click',
  'CommentChange',
  'CompositionEnd',
  'CompositionStart',
  'CompositionUpdate',
  'ContextMenu',
  'Copy',
  'Cut',
  'Dblclick',
  'Deactivate',
  'Dirty',
  'Drag',
  'DragDrop',
  'DragEnd',
  'DragGesture',
  'DragOver',
  'Drop',
  'ExecCommand',
  'Focus',
  'FocusIn',
  'FocusOut',
  'GetContent',
  'Hide',
  'Init',
  'Input',
  'KeyDown',
  'KeyPress',
  'KeyUp',
  'LoadContent',
  'MouseDown',
  'MouseEnter',
  'MouseLeave',
  'MouseMove',
  'MouseOut',
  'MouseOver',
  'MouseUp',
  'NodeChange',
  'ObjectResizeStart',
  'ObjectResized',
  'ObjectSelected',
  'Paste',
  'PostProcess',
  'PostRender',
  'PreProcess',
  'ProgressState',
  'Redo',
  'Remove',
  'Reset',
  'ResizeEditor',
  'SaveContent',
  'SelectionChange',
  'SetAttrib',
  'SetContent',
  'Show',
  'Submit',
  'Undo',
  'VisualAid' ] as const;

export type ValidEventTypes = Lowercase<typeof validEvents[number]>;
export type EventHandlers = {
  [K in ValidEventTypes]: (event: any, editor: Editor42) => void;
};

export const bindHandlers = (editor: Editor, eventHandlers: Partial<EventHandlers>): void => {
  validEvents.forEach( (eventName) => {
    editor.on(eventName, (e) => {
      eventHandlers[eventName.toLowerCase()]?.(e, editor);
    });
  });
};