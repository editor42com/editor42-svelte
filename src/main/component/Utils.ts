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
// TinyMCE-style numeric channels have no meaning on cdn.editor42.com. Migrated code that
// pinned one gets the stable 'latest' alias instead: the 42 major never breaks by policy.
export const normalizeChannel = (channel: string | undefined): string => {
  if (channel === undefined || channel === '') {
    return 'latest';
  }
  if (/^[4-8]([.-]|$)/.test(channel)) {
    // eslint-disable-next-line no-console
    console.warn(`editor42-svelte: channel '${channel}' is a TinyMCE channel; loading 'latest' instead.`);
    return 'latest';
  }
  return channel;
};
