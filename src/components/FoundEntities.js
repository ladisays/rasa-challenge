import React from "react";

const FoundEntities = ({ text, findEntities, deleteEntity }) => {
  let entities = [];

  if (typeof findEntities === "function") {
    entities = findEntities() || [];
  }

  if (!entities.length) {
    return null;
  }

  return (
    <div style={{ marginTop: 10 }}>
      {entities.map((e, i) => (
        <span key={i}>
          {text.slice(e.start, e.end)} ({e.label})
          <button
            style={{
              border: "0 none",
              cursor: "pointer",
              backgroundColor: "transparent",
            }}
            onClick={() => deleteEntity(e)}
          >
            <span role="img" aria-label="Delete">
              🗑️
            </span>
          </button>
        </span>
      ))}
    </div>
  );
};

export default FoundEntities;
