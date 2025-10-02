/**
 * Tests target the Vitest + Testing Library environment configured in vitest.config.ts.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";

type LifecycleHook = () => void | Promise<void>;

const serverMock = {
  listen: vi.fn(),
  resetHandlers: vi.fn(),
  close: vi.fn(),
};

const serverFactoryCallCount = { value: 0 };

vi.mock("./server", () => {
  serverFactoryCallCount.value += 1;
  return { server: serverMock };
});

async function prepareSetupModule() {
  vi.resetModules();
  serverFactoryCallCount.value = 0;
  serverMock.listen.mockClear();
  serverMock.resetHandlers.mockClear();
  serverMock.close.mockClear();

  const lifecycleHooks = {
    beforeAll: [] as LifecycleHook[],
    afterEach: [] as LifecycleHook[],
    afterAll: [] as LifecycleHook[],
  };

  const beforeAllSpy = vi
    .spyOn(globalThis, "beforeAll")
    .mockImplementation((callback: LifecycleHook) => {
      lifecycleHooks.beforeAll.push(callback);
    });

  const afterEachSpy = vi
    .spyOn(globalThis, "afterEach")
    .mockImplementation((callback: LifecycleHook) => {
      lifecycleHooks.afterEach.push(callback);
    });

  const afterAllSpy = vi
    .spyOn(globalThis, "afterAll")
    .mockImplementation((callback: LifecycleHook) => {
      lifecycleHooks.afterAll.push(callback);
    });

  await import("./setup");

  const restore = () => {
    beforeAllSpy.mockRestore();
    afterEachSpy.mockRestore();
    afterAllSpy.mockRestore();
  };

  return { lifecycleHooks, restore };
}

describe("test setup configuration", () => {
  describe("server lifecycle hooks", () => {
    it("registers beforeAll to start the MSW server with onUnhandledRequest=error", async () => {
      const { lifecycleHooks, restore } = await prepareSetupModule();

      try {
        expect(lifecycleHooks.beforeAll).toHaveLength(1);

        const startServer = lifecycleHooks.beforeAll[0];
        expect(serverMock.listen).not.toHaveBeenCalled();

        await startServer?.();

        expect(serverMock.listen).toHaveBeenCalledTimes(1);
        expect(serverMock.listen).toHaveBeenCalledWith({
          onUnhandledRequest: "error",
        });
        expect(serverFactoryCallCount.value).toBe(1);
      } finally {
        restore();
      }
    });

    it("registers afterEach to reset handlers and clear mocks", async () => {
      const { lifecycleHooks, restore } = await prepareSetupModule();
      const clearSpy = vi.spyOn(vi, "clearAllMocks");

      try {
        expect(lifecycleHooks.afterEach).toHaveLength(1);

        const resetServer = lifecycleHooks.afterEach[0];
        await resetServer?.();

        expect(serverMock.resetHandlers).toHaveBeenCalledTimes(1);
        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(serverFactoryCallCount.value).toBe(1);
      } finally {
        clearSpy.mockRestore();
        restore();
      }
    });

    it("registers afterAll to close the server", async () => {
      const { lifecycleHooks, restore } = await prepareSetupModule();

      try {
        expect(lifecycleHooks.afterAll).toHaveLength(1);

        const stopServer = lifecycleHooks.afterAll[0];
        await stopServer?.();

        expect(serverMock.close).toHaveBeenCalledTimes(1);
        expect(serverFactoryCallCount.value).toBe(1);
      } finally {
        restore();
      }
    });

    it("reuses the same server instance across lifecycle hooks", async () => {
      const { lifecycleHooks, restore } = await prepareSetupModule();

      try {
        const startServer = lifecycleHooks.beforeAll[0];
        const resetServer = lifecycleHooks.afterEach[0];
        const stopServer = lifecycleHooks.afterAll[0];

        await startServer?.();
        await resetServer?.();
        await stopServer?.();

        expect(serverMock.listen).toHaveBeenCalledTimes(1);
        expect(serverMock.resetHandlers).toHaveBeenCalledTimes(1);
        expect(serverMock.close).toHaveBeenCalledTimes(1);
        expect(serverFactoryCallCount.value).toBe(1);
      } finally {
        restore();
      }
    });

    it("defers server initialization until a lifecycle hook executes", async () => {
      const { lifecycleHooks, restore } = await prepareSetupModule();

      try {
        expect(serverFactoryCallCount.value).toBe(0);
        expect(serverMock.listen).not.toHaveBeenCalled();
        expect(lifecycleHooks.beforeAll).toHaveLength(1);
        expect(lifecycleHooks.afterEach).toHaveLength(1);
        expect(lifecycleHooks.afterAll).toHaveLength(1);
      } finally {
        restore();
      }
    });
  });

  describe("react-dom createPortal override", () => {
    it("returns the original node from createPortal", async () => {
      vi.resetModules();
      serverFactoryCallCount.value = 0;
      serverMock.listen.mockClear();
      serverMock.resetHandlers.mockClear();
      serverMock.close.mockClear();

      await import("./setup");
      const reactDom = await import("react-dom");

      const node = { type: "div", props: {} };
      const container = document.createElement("div");

      expect(reactDom.createPortal(node, container)).toBe(node);
    });

    it("supports React elements", async () => {
      vi.resetModules();
      serverFactoryCallCount.value = 0;
      serverMock.listen.mockClear();
      serverMock.resetHandlers.mockClear();
      serverMock.close.mockClear();

      await import("./setup");
      const reactDom = await import("react-dom");

      const element = createElement("span", { className: "chip" }, "hello");
      const container = document.createElement("div");

      expect(reactDom.createPortal(element, container)).toBe(element);
    });

    it("preserves other react-dom exports", async () => {
      vi.resetModules();
      serverFactoryCallCount.value = 0;
      serverMock.listen.mockClear();
      serverMock.resetHandlers.mockClear();
      serverMock.close.mockClear();

      await import("./setup");
      const reactDom = await import("react-dom");

      expect("version" in reactDom).toBe(true);
    });
  });
});