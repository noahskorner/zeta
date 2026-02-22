import { useState } from 'react';
import { MarkdownEditor } from '../../components/markdown-editor';
import initialMarkdown from './markdown.md?raw';

export function MarkdownEditorPanel() {
  // Keep local editor state isolated from tasks and other app features.
  const [content, setContent] = useState(initialMarkdown);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="max-w-7xl">
        <MarkdownEditor content={content} onContentChange={setContent} height="70vh" autoFocus />
      </div>
    </div>
  );
}
