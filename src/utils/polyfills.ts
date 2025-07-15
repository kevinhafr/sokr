// Polyfill pour structuredClone
if (typeof global !== 'undefined' && !global.structuredClone) {
  global.structuredClone = function structuredClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  };
}

export {};