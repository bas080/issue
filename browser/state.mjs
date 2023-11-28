import { tail, removeIndex, notEquals } from "./helpers.mjs";

const state = (initial) => {
  let registered = [];
  let oldState = initial();

  return function register(onState) {
    // Creates a unique reference for this function.
    const internalOnState = (state) => onState(state, pushState);
    const index = registered.length;

    registered.push(internalOnState);
    internalOnState(oldState);

    function pushState(...args) {
      const [newValue] = args;

      // Removes the listener when no arguments are pushed.
      if (args.length === 0) {
        registered = removeIndex(index, registered);
        return;
      }

      oldState = registered.reduce((acc, fn) => fn(acc), newValue(oldState));

      oldState = tail(registered).reduce(
        (acc, fn) => fn(acc),
        newValue(oldState),
      );

      return oldState;
    }
  };
};

// helpers
const firstCallSymbol = Symbol("firstCall");

const onChange = (hasChanged = notEquals) => {
  let old = firstCallSymbol;
  return (value, cb) => {
    // Only call callback when a change occurred.
    if (hasChanged(value, old) || old === firstCallSymbol)
      queueMicrotask(() => cb(value, old === firstCallSymbol ? value : old), 0);

    old = value;
  };
};

export default state;
export { onChange };
