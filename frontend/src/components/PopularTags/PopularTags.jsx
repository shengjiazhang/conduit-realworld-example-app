import { useEffect, useState } from "react";
import getTags from "../../services/getTags";
import TagButton from "./TagButton";

function PopularTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    getTags()
      .then(setTags)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tagsWithBold = tags.map((tag, index) => ({
    tag,
    isBold: index < 5
  }));

  return (
    <aside className="col-md-3">
      <div className="sidebar">
        <h6>Popular Tags</h6>
        <div className="tag-list">
          {tags.length > 0 ? (
            tagsWithBold.map((item) => (
              <TagButton key={item.tag} name={item.tag} bold={item.isBold} />
            ))
          ) : loading ? (
            <p>Loading tags...</p>
          ) : (
            <p>Tags list not available</p>
          )}
        </div>
      </div>
    </aside>
  );
}

export default PopularTags;
