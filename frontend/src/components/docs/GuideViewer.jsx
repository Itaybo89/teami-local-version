// FILE: src/components/docs/GuideViewer.jsx

import React, { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import styles from './GuideViewer.module.css';

// Static map of files and optional GitHub links
const markdownOptions = {
  guide: {
    label: 'Guide',
    file: 'README_guide.md',
    github: null, // In-app only
  },
  root: {
    label: 'Root README',
    file: 'README.md',
    github: 'https://github.com/Itaybo89/teami/blob/main/README.md',
  },
  frontend: {
    label: 'Frontend README',
    file: 'README_frontend.md',
    github: 'https://github.com/Itaybo89/teami/blob/main/frontend/README_frontend.md',
  },
  backend: {
    label: 'Backend README',
    file: 'README_backend.md',
    github: 'https://github.com/Itaybo89/teami/blob/main/backend/README_backend.md',
  },
  brain: {
    label: 'Brain README',
    file: 'README_brain.md',
    github: 'https://github.com/Itaybo89/teami/blob/main/brain/README_brain.md',
  },
};

const GuideViewer = () => {
  const [selected, setSelected] = useState('guide');
  const [content, setContent] = useState('');

  // Load markdown files from /src/docs using Vite's raw import
  const mdFiles = import.meta.glob('../../docs/*.md', { as: 'raw' });

  useEffect(() => {
    const { file } = markdownOptions[selected];
    const path = `../../docs/${file}`;
    const loader = mdFiles[path];
    if (loader) {
      loader().then(setContent);
    } else {
      setContent('⚠️ Failed to load file.');
    }
  }, [selected]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.introText}>
          👋 Welcome! Start with the guide, or explore the other README files below.
        </div>
        <label htmlFor="readme-select">Select a section:</label>
        <select
          id="readme-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {Object.entries(markdownOptions).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <MarkdownRenderer content={content} />

      {markdownOptions[selected].github && (
        <div className={styles.footer}>
          <a
            href={markdownOptions[selected].github}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 View on GitHub
          </a>
        </div>
      )}
    </div>
  );
};

export default GuideViewer;
