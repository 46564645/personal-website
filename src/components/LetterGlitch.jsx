import React, { useEffect, useMemo, useRef, useState } from 'react';

const fontSize = 16;
const charWidth = 10;
const charHeight = 20;
const focusScale = 2;
const focusRows = 3;
const focusColumnPadding = 2;

const LetterGlitch = ({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  className = '',
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789',
  embeddedText = '',
  embeddedSide = 'left',
  embeddedPhase = 'reveal',
  embeddedCycle = 0,
  revealDuration = 1400,
  onEmbeddedMetrics
}) => {
  const rootRef = useRef(null);
  const focusedTextRef = useRef(null);
  const charRefs = useRef([]);
  const embeddedStartedAt = useRef(Date.now());
  const [grid, setGrid] = useState({ columns: 0, rows: 0 });
  const [letters, setLetters] = useState([]);

  const charactersList = useMemo(() => Array.from(characters), [characters]);

  const getRandomChar = () => charactersList[Math.floor(Math.random() * charactersList.length)];
  const getRandomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];

  const getEdgePadding = textLength => {
    const responsivePadding = Math.floor(grid.columns * 0.08);
    const focusRoom = Math.ceil((textLength * (focusScale - 1)) / 2) + 2;
    const maxPadding = Math.max(2, Math.floor((grid.columns - textLength) / 2));

    return Math.min(Math.max(2, responsivePadding, focusRoom), maxPadding);
  };

  const getEmbeddedPosition = () => {
    const textLength = embeddedText.length;
    const row = Math.max(0, Math.floor(grid.rows / 2));
    const edgePadding = getEdgePadding(textLength);
    const startColumn =
      embeddedSide === 'right'
        ? Math.max(edgePadding, grid.columns - textLength - edgePadding)
        : edgePadding;

    return {
      row,
      startColumn,
      length: textLength,
      x: startColumn * charWidth,
      y: row * charHeight,
      width: textLength * charWidth,
      height: charHeight
    };
  };

  const getScanPosition = (length, type = 'short') => {
    const rowOffset = type === 'near' ? 0 : length > 12 ? 2 : -2;
    const row = Math.max(1, Math.min(grid.rows - 2, Math.floor(grid.rows / 2) + rowOffset));
    const edgePadding = getEdgePadding(Math.max(length, embeddedText.length));
    const embeddedStart =
      embeddedSide === 'right'
        ? Math.max(edgePadding, grid.columns - embeddedText.length - edgePadding)
        : edgePadding;
    const sideOffset = type === 'near' ? 14 : length > 12 ? 7 : 2;
    const startColumn =
      type === 'near'
        ? embeddedSide === 'right'
          ? Math.max(edgePadding, embeddedStart - sideOffset)
          : Math.min(grid.columns - length - edgePadding, embeddedStart + sideOffset)
        : embeddedSide === 'right'
          ? Math.max(edgePadding, grid.columns - length - edgePadding - sideOffset)
          : edgePadding + sideOffset;

    return {
      row,
      startColumn,
      length,
      x: startColumn * charWidth,
      y: row * charHeight,
      width: length * charWidth,
      height: charHeight
    };
  };

  const getActivePosition = () => {
    if (embeddedPhase === 'scan-short') return getScanPosition(8);
    if (embeddedPhase === 'scan-long') return getScanPosition(22);
    if (embeddedPhase === 'scan-near') return getScanPosition(14, 'near');
    if (!embeddedText) return null;

    const position = getEmbeddedPosition();
    return embeddedPhase === 'reveal' || embeddedPhase === 'focus' || embeddedPhase === 'hold' ? position : null;
  };

  const getFocusedPosition = position => {
    if (!position) return null;

    const width = position.width * focusScale + focusColumnPadding * charWidth * 2;
    const height = charHeight * focusRows;
    const centeredX = position.x + position.width / 2 - width / 2;
    const maxX = Math.max(0, grid.columns * charWidth - width);
    const x = Math.round(Math.max(0, Math.min(maxX, centeredX)) / charWidth) * charWidth;
    const y = Math.max(0, position.y - charHeight);

    return {
      ...position,
      x,
      y,
      width,
      height,
      scale: focusScale
    };
  };

  const getGridText = position => {
    if (!position) return '';

    return Array.from({ length: position.length }, (_, offset) => {
      const index = position.row * grid.columns + position.startColumn + offset;
      return letters[index]?.char || getRandomChar();
    }).join('');
  };

  const getEmbeddedChar = offset => {
    if (!embeddedText) return '';

    if (embeddedPhase === 'focus' || embeddedPhase === 'hold') return embeddedText[offset] || '';
    if (embeddedPhase === 'exit') return embeddedText[offset] === ' ' ? ' ' : getRandomChar();
    if (embeddedPhase !== 'reveal') return getRandomChar();

    const elapsed = Date.now() - embeddedStartedAt.current;
    const revealCount = Math.min(
      embeddedText.length,
      Math.floor((elapsed / revealDuration) * (embeddedText.length + 1))
    );
    const char = embeddedText[offset] || '';
    if (char === ' ') return ' ';
    return offset < revealCount ? char : getRandomChar();
  };

  const isWithinPosition = (index, position) => {
    if (!position) return false;
    const row = Math.floor(index / grid.columns);
    const column = index % grid.columns;
    return row === position.row && column >= position.startColumn && column < position.startColumn + position.length;
  };

  const measureCells = position => {
    if (!position || !rootRef.current) return null;

    const rootRect = rootRef.current.getBoundingClientRect();
    const startIndex = position.row * grid.columns + position.startColumn;
    const endIndex = startIndex + position.length - 1;
    const firstCell = charRefs.current[startIndex];
    const lastCell = charRefs.current[endIndex];

    if (!firstCell || !lastCell) return null;

    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    return {
      ...position,
      x: firstRect.left - rootRect.left,
      y: firstRect.top - rootRect.top,
      width: lastRect.right - firstRect.left,
      height: Math.max(firstRect.height, lastRect.height)
    };
  };

  useEffect(() => {
    const measure = () => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const columns = Math.ceil(rect.width / charWidth);
      const rows = Math.ceil(rect.height / charHeight);

      setGrid({ columns, rows });
      setLetters(
        Array.from({ length: columns * rows }, () => ({
          char: getRandomChar(),
          color: getRandomColor()
        }))
      );
    };

    measure();
    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLetters(current => {
        if (current.length === 0) return current;
        const next = current.slice();
        const updateCount = Math.max(1, Math.floor(current.length * 0.05));

        for (let i = 0; i < updateCount; i += 1) {
          const index = Math.floor(Math.random() * next.length);
          next[index] = {
            char: getRandomChar(),
            color: getRandomColor()
          };
        }

        return next;
      });
    }, glitchSpeed);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, charactersList, glitchColors]);

  useEffect(() => {
    embeddedStartedAt.current = Date.now();
  }, [embeddedCycle, embeddedText, embeddedPhase]);

  useEffect(() => {
    if (!onEmbeddedMetrics) return;

    const frame = window.requestAnimationFrame(() => {
      const activePosition = getActivePosition();
      let metrics = null;

      if (embeddedPhase === 'scan-short' || embeddedPhase === 'scan-long' || embeddedPhase === 'scan-near' || embeddedPhase === 'reveal') {
        metrics = measureCells(activePosition);
        if (metrics) {
          metrics.text = embeddedPhase === 'reveal' ? embeddedText : getGridText(activePosition);
        }
      }

      if (embeddedPhase === 'focus' || embeddedPhase === 'hold') {
        const embeddedPosition = getEmbeddedPosition();
        metrics = {
          ...getFocusedPosition(embeddedPosition),
          text: embeddedText
        };
      }

      if (metrics) onEmbeddedMetrics(metrics);
    });

    return () => window.cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, letters, embeddedText, embeddedSide, embeddedPhase, embeddedCycle, revealDuration, onEmbeddedMetrics]);

  const embeddedPosition = embeddedText ? getEmbeddedPosition() : null;
  const focusedPosition =
    embeddedText && (embeddedPhase === 'focus' || embeddedPhase === 'hold') ? getFocusedPosition(embeddedPosition) : null;

  return (
    <div
      ref={rootRef}
      className={`letter-glitch-dom ${className}`}
      style={{
        gridTemplateColumns: `repeat(${grid.columns || 1}, ${charWidth}px)`,
        gridAutoRows: `${charHeight}px`
      }}
    >
      {letters.map((letter, index) => {
        const row = Math.floor(index / grid.columns);
        const column = index % grid.columns;
        const inEmbedded = isWithinPosition(index, embeddedPosition);
        const inFocused = focusedPosition
          ? column * charWidth >= focusedPosition.x &&
            column * charWidth < focusedPosition.x + focusedPosition.width &&
            row * charHeight >= focusedPosition.y &&
            row * charHeight < focusedPosition.y + focusedPosition.height
          : false;
        const embeddedOffset = inEmbedded ? column - embeddedPosition.startColumn : -1;
        const isRevealSlot =
          inEmbedded &&
          (embeddedPhase === 'reveal' ||
            embeddedPhase === 'focus' ||
            embeddedPhase === 'hold' ||
            embeddedPhase === 'exit');
        const char = isRevealSlot && !focusedPosition ? getEmbeddedChar(embeddedOffset) : letter.char;

        return (
          <span
            key={index}
            ref={element => (charRefs.current[index] = element)}
            className={`letter-cell ${isRevealSlot && !focusedPosition ? 'is-embedded' : ''} ${inFocused ? 'is-cleared' : ''}`}
            data-row={row}
            data-column={column}
            style={{ color: isRevealSlot ? '#d8d0ff' : letter.color }}
          >
            {inFocused ? '' : char}
          </span>
        );
      })}

      {focusedPosition && (
        <span
          ref={focusedTextRef}
          className="letter-focused-text"
          style={{
            left: `${focusedPosition.x}px`,
            top: `${focusedPosition.y}px`,
            width: `${focusedPosition.width}px`,
            height: `${focusedPosition.height}px`
          }}
        >
          <span className="letter-focused-text__inner">{embeddedText}</span>
        </span>
      )}

      {outerVignette && <div className="letter-vignette letter-vignette--outer" />}
      {centerVignette && <div className="letter-vignette letter-vignette--center" />}
    </div>
  );
};

export default LetterGlitch;
