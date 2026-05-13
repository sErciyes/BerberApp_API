type NoticeProps = {
  type?: "info" | "success" | "error";
  children: React.ReactNode;
  onClose?: () => void;
};

export function Notice({ type = "info", children, onClose }: NoticeProps) {
  return (
    <div className={`notice notice-${type}`}>
      <div className="notice-content">{children}</div>
      {onClose && (
        <button
          aria-label="Bildirimi kapat"
          className="notice-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
}
