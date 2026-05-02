type NoticeProps = {
  type?: "info" | "success" | "error";
  children: React.ReactNode;
};

export function Notice({ type = "info", children }: NoticeProps) {
  return <div className={`notice notice-${type}`}>{children}</div>;
}
