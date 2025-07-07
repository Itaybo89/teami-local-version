// FILE: src/components/docs/MarkdownRenderer.jsx

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './GuideViewer.module.css';

const MarkdownRenderer = ({ content }) => {
  if (!content) return <div>Loading content...</div>;

  return (
    <div className={styles.markdownContent}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
