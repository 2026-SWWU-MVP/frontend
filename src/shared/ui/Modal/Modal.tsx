import { useEffect } from "react";
import { Icon } from "@/shared/ui/Icon/Icon";
import "./Modal.css";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  title,
  onClose,
  children,
  className = "",
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal ${className}`}
        role="dialog"
      >
        <header className="modal__header">
          <h2 id="modal-title">{title}</h2>
          <button
            aria-label="닫기"
            className="modal__close"
            onClick={onClose}
            type="button"
          >
            <Icon name="x" size={20} />
          </button>
        </header>

        {children}
      </section>
    </div>
  );
}
