import { useState } from 'react';
import initialMarkdown from './markdown.md?raw';
import { MarkdownEditor } from '../../components/markdown-editor/markdown-editor';

export function MarkdownEditorPanel() {
  // Keep local editor state isolated from tasks and other app features.
  const [content, setContent] = useState(initialMarkdown);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <MarkdownEditor content={content} onContentChange={setContent} height="70vh" autoFocus />
      </div>
    </div>
  );
}
