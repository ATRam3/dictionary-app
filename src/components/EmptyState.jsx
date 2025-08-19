// EmptyState component (place near top of file or in a separate file)
const EmptyState = ({ onPick, suggestions }) => {
  // pick a random suggestion to display visually
  const random = suggestions[Math.floor(Math.random() * suggestions.length)];

  return (
    <div className="empty-state" role="region" aria-label="No search yet">
      {/* simple inline SVG illustration (optional) */}
      <div className="empty-illustration" aria-hidden="true">
        <svg width="120" height="80" viewBox="0 0 120 80">
          <rect
            x="8"
            y="12"
            width="104"
            height="56"
            rx="8"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
          />
          <circle cx="92" cy="28" r="8" fill="var(--muted)" />
          <path d="M18 28h58" stroke="var(--muted)" strokeWidth="2" />
          <path d="M18 40h58" stroke="var(--muted)" strokeWidth="2" />
        </svg>
      </div>

      <h2>No word searched yet</h2>
      <p className="muted">
        Type a word in the box above and press <strong>Enter</strong> to look it
        up.
      </p>

      <div className="examples">
        <span>Try: </span>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="example-btn"
            onClick={() => onPick(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="random">
        <span>Or try this: </span>
        <button className="random-btn" onClick={() => onPick(random)}>
          {random}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
