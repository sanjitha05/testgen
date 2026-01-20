import "./StreamSelectModal.css";

const StreamSelectModal = ({ examName, streams, onSelect, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Select Stream for {examName}</h2>

        <div className="stream-grid">
          {streams.map(stream => (
            <button
              key={stream.id}
              className="stream-btn"
              onClick={() => onSelect(stream)}
            >
              {stream.name}
            </button>
          ))}
        </div>

        <button className="modal-close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default StreamSelectModal;
