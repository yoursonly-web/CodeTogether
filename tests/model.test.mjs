import test from 'node:test';
import assert from 'node:assert/strict';
import { byteLength, initialState, LANGUAGES, MAX_SOURCE_BYTES, newWorkspace, restoreState } from '../apps/web/src/model.ts';

test('a draft round-trip preserves source, stdin and distinct language workspaces', () => {
  const state = initialState();
  for (const language of ['cpp', 'java']) state.workspaces.push(newWorkspace(`My ${language}`, language));
  state.workspaces[0].code = 'print("नमस्ते")\n';
  state.workspaces[0].stdin = '<input>\n42';
  state.activeId = state.workspaces[2].id;
  assert.deepEqual(restoreState(JSON.stringify(state)), state);
});

test('bad or incomplete storage never creates a partly loaded draft', () => {
  for (const raw of [null, '', '{broken', 'null', '{}', '{"version":2}', '{"version":1,"workspaces":[]}']) {
    assert.equal(restoreState(raw), null);
  }
});

test('restoring an unknown active ID safely selects an existing draft', () => {
  const state = initialState();
  state.activeId = 'a-removed-workspace';
  assert.equal(restoreState(JSON.stringify(state)).activeId, state.workspaces[0].id);
});

test('duplicate workspace identities are rejected rather than mixing source', () => {
  const state = initialState();
  state.workspaces.push({ ...state.workspaces[0], code: 'different source' });
  assert.equal(restoreState(JSON.stringify(state)), null);
});

test('source limits use UTF-8 bytes, including multi-byte text', () => {
  const state = initialState();
  assert.equal(byteLength('🙂'), 4);
  state.workspaces[0].code = '🙂'.repeat(MAX_SOURCE_BYTES / 4);
  assert.ok(restoreState(JSON.stringify(state)));
  state.workspaces[0].code += 'a';
  assert.equal(restoreState(JSON.stringify(state)), null);
});

test('invalid preferences fall back without destroying valid code', () => {
  const state = initialState();
  state.settings = { fontSize: 200, wordWrap: 'yes' };
  const restored = restoreState(JSON.stringify(state));
  assert.deepEqual(restored.settings, { fontSize: 14, wordWrap: false });
  assert.equal(restored.workspaces[0].code, state.workspaces[0].code);
});

test('the Java starter follows the fixed Main.java entry contract', () => {
  assert.equal(LANGUAGES.java.file, 'Main.java');
  assert.match(LANGUAGES.java.starter, /public class Main/);
  assert.match(LANGUAGES.java.starter, /public static void main\(String\[\] args\)/);
});

test('unsupported languages and excessive input are rejected during restore', () => {
  const state = initialState();
  state.workspaces[0].language = 'unknown';
  assert.equal(restoreState(JSON.stringify(state)), null);
  state.workspaces[0].language = 'python';
  state.workspaces[0].stdin = 'a'.repeat(16 * 1024 + 1);
  assert.equal(restoreState(JSON.stringify(state)), null);
});
