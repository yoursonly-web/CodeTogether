export type Language = 'python' | 'cpp' | 'java';
export type View = 'editor' | 'workspaces';
export type ResultTab = 'output' | 'errors' | 'details';
export type PreviewState = 'empty' | 'queued' | 'running' | 'success' | 'compile-error' | 'time-limit';

export interface Workspace {
  id: string;
  name: string;
  language: Language;
  code: string;
  stdin: string;
  updatedAt: number;
}

export interface Settings {
  fontSize: number;
  wordWrap: boolean;
}

export interface StoredState {
  version: 1;
  workspaces: Workspace[];
  activeId: string;
  settings: Settings;
}

export interface PreviewExecution {
  id: string;
  workspaceId: string;
  state: Exclude<PreviewState, 'empty'>;
  source: string;
  stdin: string;
  language: Language;
  createdAt: number;
}

export const LANGUAGES: Record<Language, { name: string; version: string; file: string; short: string; color: string; starter: string; input: string }> = {
  python: {
    name: 'Python', version: 'Python', file: 'main.py', short: 'Py', color: '#E1BF77',
    starter: '# Find a pair. Make something click.\n\ndef two_sum(numbers, target):\n    """Return the indices of two numbers that add to target."""\n    seen = {}\n\n    for index, number in enumerate(numbers):\n        complement = target - number\n        if complement in seen:\n            return [seen[complement], index]\n        seen[number] = index\n\n    return []\n\nnumbers = list(map(int, input().split()))\ntarget = int(input())\n\nprint(two_sum(numbers, target))\n',
    input: '2 7 11 15\n9',
  },
  cpp: {
    name: 'C++', version: 'C++17', file: 'main.cpp', short: 'C++', color: '#91B9F0',
    starter: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::getline(std::cin, name);\n\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}\n',
    input: 'world',
  },
  java: {
    name: 'Java', version: 'Java', file: 'Main.java', short: 'Ja', color: '#DFA18C',
    starter: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String name = scanner.nextLine();\n\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}\n',
    input: 'world',
  },
};

export const STORAGE_KEY = 'codetogether.local.v1';
export const MAX_SOURCE_BYTES = 64 * 1024;
export const MAX_INPUT_BYTES = 16 * 1024;
export const MAX_LOCAL_WORKSPACES = 12;

export function byteLength(value: string) { return new TextEncoder().encode(value).length; }

export function newWorkspace(name: string, language: Language): Workspace {
  return { id: crypto.randomUUID(), name: name.trim(), language, code: LANGUAGES[language].starter, stdin: LANGUAGES[language].input, updatedAt: Date.now() };
}

export function initialState(): StoredState {
  const workspace = newWorkspace('Python playground', 'python');
  return { version: 1, workspaces: [workspace], activeId: workspace.id, settings: { fontSize: 14, wordWrap: false } };
}

function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Workspace>;
  return typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 80
    && typeof item.name === 'string' && item.name.length > 0 && item.name.length <= 48
    && (item.language === 'python' || item.language === 'cpp' || item.language === 'java')
    && typeof item.code === 'string' && byteLength(item.code) <= MAX_SOURCE_BYTES
    && typeof item.stdin === 'string' && byteLength(item.stdin) <= MAX_INPUT_BYTES
    && typeof item.updatedAt === 'number' && Number.isFinite(item.updatedAt);
}

export function restoreState(raw: string | null): StoredState | null {
  if (!raw || raw.length > 2_000_000) return null;
  try {
    const data = JSON.parse(raw) as Partial<StoredState>;
    if (data.version !== 1 || !Array.isArray(data.workspaces) || data.workspaces.length < 1
      || data.workspaces.length > MAX_LOCAL_WORKSPACES || !data.workspaces.every(isWorkspace)) return null;
    if (new Set(data.workspaces.map(workspace => workspace.id)).size !== data.workspaces.length) return null;
    const activeId = data.workspaces.some(workspace => workspace.id === data.activeId) ? data.activeId! : data.workspaces[0].id;
    const fontSize = data.settings?.fontSize;
    return { version: 1, workspaces: data.workspaces, activeId, settings: {
      fontSize: typeof fontSize === 'number' && Number.isInteger(fontSize) && fontSize >= 12 && fontSize <= 20 ? fontSize : 14,
      wordWrap: data.settings?.wordWrap === true,
    } };
  } catch { return null; }
}

export function loadState(): { state: StoredState; warning?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const restored = restoreState(raw);
    if (raw && !restored) return { state: initialState(), warning: 'The saved draft could not be read. Download any code you want to keep before replacing it.' };
    return { state: restored ?? initialState() };
  } catch {
    return { state: initialState(), warning: 'Browser storage is unavailable. Download your code before leaving.' };
  }
}

export function formatUpdated(timestamp: number) {
  const seconds = Math.max(0, (Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
