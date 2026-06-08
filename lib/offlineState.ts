type Listener = (offline: boolean) => void;

let _offline = false;
const _listeners = new Set<Listener>();

export function setOfflineState(v: boolean) {
  if (_offline === v) return;
  _offline = v;
  _listeners.forEach((fn) => fn(v));
}

export function getOfflineState() {
  return _offline;
}

export function subscribeOffline(fn: Listener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
