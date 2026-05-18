import ReactionsBar from "./ReactionsBar";
import CommentsBox from "./CommentsBox";

function PostCard({
  id,
  title,
  image,
  category,
  date,
  description,
  locationUrl,
}) {
  return (
    <article className="post-card">
      <div className="post-card-top">
        <span className="post-category">{category}</span>
        <p className="post-date">{date}</p>
      </div>

      <h2>{title}</h2>

      {image ? (
        <img src={image} alt={title} className="post-image" />
      ) : (
        <div className="post-image post-image-placeholder">
          Sin imagen
        </div>
      )}

      <p className="post-description">{description}</p>

      {locationUrl && (
        <a
          href={locationUrl}
          target="_blank"
          rel="noreferrer"
          className="post-location-link"
        >
          Ver ubicación / salón
        </a>
      )}

      <ReactionsBar postId={id} />
      <CommentsBox postId={id} />
    </article>
  );
}

export default PostCard;