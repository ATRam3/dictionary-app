// EmptyState component (place near top of file or in a separate file)
import NoSearch from "../assets/images/NoSearch.png";
import NoSearch1 from "../assets/images/No_search1.png";
const EmptyState = ({ onPick, suggestions }) => {
  // pick a random suggestion to display visually
  const random = suggestions[Math.floor(Math.random() * suggestions.length)];

  return (
    <div className="empty-state" role="region" aria-label="No search yet">
      {/* simple inline SVG illustration (optional) */}
      <div className="empty-illustration" aria-hidden="true">
        <img src={NoSearch} alt="" className="empty-img" />
      </div>

      <h2>No word searched yet</h2>

      <div className="examples">
        <span>Try: </span>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="example-btn"
            onClick={(e) => {
              console.log("Empty state clicked: ", s, "event: ", e.type);
              e.preventDefault();
              e.stopPropagation();
              onPick(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="random">
        <span>Or try this: </span>
        <button
          className="random-btn"
          type="button"
          onClick={(e) => {
            console.log("Empty state clicked: ", s, "event: ", e.type);
            e.preventDefault();
            e.stopPropagation();
            onPick(s);
          }}
        >
          {random}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
