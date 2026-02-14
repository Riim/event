Object.defineProperty(exports, Symbol.toStringTag, {
  value: 'Module'
});

//#region src/event.ts
var LISTENERS = Symbol("listeners");
var CONTEXT = Symbol("context");
function subscribe(evt, listener) {
  (evt[LISTENERS] ??= /* @__PURE__ */new Set()).add(listener);
  return () => unsubscribe(evt, listener);
}
function unsubscribe(evt, listener) {
  evt[LISTENERS]?.delete(listener);
}
function once(evt, listener) {
  var disposer = subscribe(evt, data => {
    disposer();
    listener(data);
  });
  return disposer;
}
function clearEvent(evt) {
  evt[LISTENERS]?.clear();
}
function hasListeners(evt) {
  return (evt[LISTENERS]?.size ?? 0) != 0;
}
function fireEvent(evt, data) {
  var context = evt[CONTEXT];
  evt[LISTENERS]?.forEach(listener => listener.call(context, data));
}
function event(context) {
  var evt = listener => subscribe(evt, listener);
  evt[LISTENERS] = null;
  evt[CONTEXT] = context ?? globalThis;
  return evt;
}
function isEvent(value) {
  return typeof value == "function" && LISTENERS in value;
}

//#endregion
exports.CONTEXT = CONTEXT;
exports.LISTENERS = LISTENERS;
exports.clearEvent = clearEvent;
exports.event = event;
exports.fireEvent = fireEvent;
exports.hasListeners = hasListeners;
exports.isEvent = isEvent;
exports.once = once;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;