import { useState } from "react";
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
  published,
  onApprove,
  onUnpublish,
  onDelete,
}) {
  const [imgError, setImgError] = useState(false);
  const isAdminView = onApprove !== undefined;

  return (
    <article
      className={`post-card${isAdminView && !published ? " post-card--pending" : ""}`}
    >
      <div className="post-card-top">
        <span className="post-category">{category}</span>
        <div className="post-card-top-right">
          {isAdminView && (
            <span
              className={`post-status ${
                published ? "post-status--published" : "post-status--pending"
              }`}
            >
              {published ? "Publicado" : "Pendiente"}
            </span>
          )}
          <p className="post-date">{date}</p>
        </div>
      </div>

      <h2>{title}</h2>

      {image && !imgError ? (
        <img
          src={image}
          alt={title}
          className="post-image"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="post-image post-image-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Ver ubicación / salón
        </a>
      )}

      {isAdminView && (
        <div className="post-admin-actions">
          {!published ? (
            <button className="btn-approve" onClick={onApprove}>
              Publicar en User
            </button>
          ) : (
            <button className="btn-unpublish" onClick={onUnpublish}>
              Despublicar
            </button>
          )}
          <button className="btn-delete" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      )}

      <ReactionsBar postId={id} />
      <CommentsBox postId={id} adminView={isAdminView} />
    </article>
  );
}

export default PostCard;
