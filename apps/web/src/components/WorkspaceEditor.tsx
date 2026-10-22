import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { editor, IDisposable } from 'monaco-editor';
import { Code2, LoaderCircle } from 'lucide-react';
import { byteLength, LANGUAGES, MAX_SOURCE_BYTES } from '../model';
import type { Settings, Workspace } from '../model';

export function WorkspaceEditor({ workspace, settings, onChange, onCursor, onLimit }: {
  workspace: Workspace; settings: Settings; onChange: (code: string) => void;
  onCursor: (line: number, column: number) => void; onLimit: () => void;
}) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const cursorRef = useRef<IDisposable | null>(null);
  const currentCode = useRef(workspace.code);
  currentCode.current = workspace.code;
  const handleMount: OnMount = instance => {
    editorRef.current = instance;
    cursorRef.current = instance.onDidChangeCursorPosition(event => onCursor(event.position.lineNumber, event.position.column));
  };
  useEffect(() => () => { cursorRef.current?.dispose(); }, []);

  return <Editor
    height="100%"
    language={workspace.language}
    path={`file:///${workspace.id}/${LANGUAGES[workspace.language].file}`}
    value={workspace.code}
    theme="together-dark"
    onMount={handleMount}
    onChange={value => {
      const next = value ?? '';
      if (byteLength(next) > MAX_SOURCE_BYTES) {
        // Revert only the exceptional oversize edit; ordinary updates never reset the model.
        editorRef.current?.setValue(currentCode.current);
        onLimit();
        return;
      }
      onChange(next);
    }}
    loading={<div className="editor-loading"><Code2 size={29} /><span><LoaderCircle size={14} className="spin" /> Getting your editor ready</span></div>}
    options={{
      fontFamily: '"Cascadia Code", "JetBrains Mono", "SFMono-Regular", Consolas, monospace',
      fontSize: settings.fontSize,
      lineHeight: 25,
      padding: { top: 24, bottom: 28 },
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      automaticLayout: true,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      tabSize: 4,
      insertSpaces: true,
      fontLigatures: true,
      renderLineHighlight: 'line',
      lineNumbersMinChars: 4,
      glyphMargin: false,
      folding: true,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      scrollbar: { verticalScrollbarSize: 7, horizontalScrollbarSize: 7 },
      bracketPairColorization: { enabled: true },
      accessibilitySupport: 'auto',
      ariaLabel: `${LANGUAGES[workspace.language].name} source code editor`,
    }}
  />;
}
