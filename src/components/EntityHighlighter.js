import React, { useState, useEffect, useRef } from "react";

import Highlight from "./Highlight";
import FoundEntities from "./FoundEntities";

const styles = {
  text: {},
  highlightText: {
    color: "transparent",
    pointerEvents: "none",
    padding: "0",
    whiteSpace: "pre-wrap",
    fontFamily:
      'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
    fontSize: 14,
  },
  zeroPos: {
    textAlign: "left",
    position: "absolute",
    top: 1,
    left: 1,
  },
  input: {
    fontFamily:
      'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
    fontSize: 14,
    background: "none",
    border: "1px solid",
    width: "100%",
    resize: "none",
  },
};

const EntityHighlighter = ({ text, entities = [], onChange }) => {
  const [state, setState] = useState({
    selectionStart: 0,
    selectionEnd: 0,
    label: "",
  });
  const textareaRef = useRef(null);
  const inputRef = useRef(null);

  const handleTextChange = (event) => {
    const newText = event.target.value;
    const newEntities = [];

    // update the entity boudaries

    entities.forEach((entity) => {
      const selection = text.slice(entity.start, entity.end);

      const findClosestStart = (lastMatch = null) => {
        if (lastMatch === null) {
          const index = newText.indexOf(selection);
          if (index === -1) return index;

          return findClosestStart(index);
        }
        const from = lastMatch + selection.length;
        const index = newText.indexOf(selection, from);
        if (index === -1) return lastMatch;

        const prevDiff = Math.abs(entity.start - lastMatch);
        const nextDiff = Math.abs(entity.start - index);
        if (prevDiff < nextDiff) return lastMatch;

        return findClosestStart(index);
      };

      const start = findClosestStart();
      if (start === -1) return;

      newEntities.push({
        ...entity,
        start,
        end: start + selection.length,
      });
    });

    onChange(newText, newEntities);
  };

  const deleteEntity = (entity) => {
    const allEntities = [...entities];
    const idxToDelete = allEntities.findIndex(
      (e) =>
        e.start === entity.start &&
        e.end === entity.end &&
        e.label === entity.label
    );
    if (idxToDelete > -1) {
      // only update if entity was found
      allEntities.splice(idxToDelete, 1);
      onChange(text, allEntities);
    }
  };
  const handleLabelChange = (event) => {
    const { value } = event.target;
    setState((s) => ({ ...s, label: value }));
  };
  const handleClick = () => {
    const entity = {
      start: state.selectionStart,
      end: state.selectionEnd,
      label: state.label,
    };
    onChange(text, [...entities, entity]);
    setState((s) => ({
      ...s,
      label: "",
    }));
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    const selectionHandler = (event) => {
      const { selectionStart, selectionEnd } = event.target;
      setState((s) => ({
        ...s,
        selectionStart,
        selectionEnd,
      }));
    };
    textarea.addEventListener("select", selectionHandler, false);
    textarea.addEventListener("click", selectionHandler, false);
    textarea.addEventListener("keydown", selectionHandler, false);
    return () => {
      textarea.removeEventListener("select", selectionHandler, false);
      textarea.removeEventListener("click", selectionHandler, false);
      textarea.removeEventListener("keydown", selectionHandler, false);
    };
  }, []);

  const { label, selectionStart, selectionEnd } = state;
  const isSameStartAndEnd = selectionStart === selectionEnd;
  const findEntities = () =>
    entities.filter((e) => e.start <= selectionStart && e.end > selectionStart);

  return (
    <div>
      <div style={{ position: "relative" }}>
        <textarea
          style={styles.input}
          ref={textareaRef}
          onChange={handleTextChange}
          value={text}
          rows={10}
        />
        {entities.map((entity, index) => (
          <Highlight
            key={index}
            text={text}
            entity={entity}
            styles={{ ...styles.zeroPos, ...styles.highlightText }}
          />
        ))}
      </div>
      <br />
      <div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Entity label"
          value={label}
          onChange={handleLabelChange}
          disabled={isSameStartAndEnd}
        />
        <button onClick={handleClick} disabled={isSameStartAndEnd}>
          Add entity for selection
        </button>
      </div>
      {isSameStartAndEnd && (
        <FoundEntities
          text={text}
          isSameStartAndEnd={isSameStartAndEnd}
          findEntities={findEntities}
          deleteEntity={deleteEntity}
        />
      )}
    </div>
  );
};

export default EntityHighlighter;
