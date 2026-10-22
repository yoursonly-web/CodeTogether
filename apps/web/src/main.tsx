import React from 'react';
import ReactDOM from 'react-dom/client';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
import { loader } from '@monaco-editor/react';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
import { App } from './App';
import './styles.css';

// Bundle the editor and worker locally: the workspace does not fetch Monaco from a CDN.
self.MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });

monaco.editor.defineTheme('together-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '66717C', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'C5A2F5' },
    { token: 'string', foreground: 'C7DCA0' },
    { token: 'number', foreground: 'E7BA8A' },
    { token: 'type.identifier', foreground: '93D7CC' },
    { token: 'identifier', foreground: 'D2D7DF' },
  ],
  colors: {
    'editor.background': '#13161C',
    'editor.foreground': '#D2D7DF',
    'editorLineNumber.foreground': '#424A57',
    'editorLineNumber.activeForeground': '#92A2B4',
    'editor.lineHighlightBackground': '#191D25',
    'editor.selectionBackground': '#2C4547',
    'editorCursor.foreground': '#A3E4CD',
    'editorIndentGuide.background1': '#242B35',
    'editorIndentGuide.activeBackground1': '#3A4951',
    'editorWidget.background': '#1B2029',
    'editorWidget.border': '#343E4C',
    'editor.findMatchBackground': '#58644080',
    'scrollbarSlider.background': '#55607040',
    'scrollbarSlider.hoverBackground': '#66708070',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
