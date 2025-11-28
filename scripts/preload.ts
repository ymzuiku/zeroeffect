import "fake-indexeddb/auto";
import { mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// // Mock localStorage
const createMockLocalStorage = () => {
	const storage = new Map<string, string>();

	return {
		getItem: mock((key: string) => storage.get(key) || null),
		setItem: mock((key: string, value: string) => {
			storage.set(key, value);
		}),
		removeItem: mock((key: string) => {
			storage.delete(key);
		}),
		clear: mock(() => {
			storage.clear();
		}),
		key: mock((index: number) => {
			const keys = Array.from(storage.keys());
			return keys[index] || null;
		}),
		get length() {
			return storage.size;
		},
	};
};

globalThis.localStorage = createMockLocalStorage() as unknown as Storage;

GlobalRegistrator.register();
