import { useFeedContext } from "../../context/FeedContext";

function TagButton({ name, bold = false }) {
  const { changeTab } = useFeedContext();

  const handleClick = (e) => {
    changeTab(e, "tag");
  };

  return (
    <button
      className="tag-pill tag-default"
      onClick={handleClick}
      style={bold ? { fontWeight: 'bold' } : {}}
    >
      {name}
    </button>
  );
}

export default TagButton;
