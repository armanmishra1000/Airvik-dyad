export async function register() {
  // Node.js 25+ enables webstorage by default. Without --localstorage-file,
  // the localStorage/sessionStorage globals exist but are non-functional
  // (getItem/setItem are undefined). This breaks SSR libraries like next-themes
  // that detect their presence. Remove the broken globals on the server.
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof globalThis.localStorage.getItem !== "function"
  ) {
    delete (globalThis as Record<string, unknown>).localStorage;
  }
  if (
    typeof globalThis.sessionStorage !== "undefined" &&
    typeof globalThis.sessionStorage.getItem !== "function"
  ) {
    delete (globalThis as Record<string, unknown>).sessionStorage;
  }
}
