import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { Modal } from "@/shared/ui/Modal/Modal";

import "./MemberModals.css";

export interface MemberForModal {
  id: number;
  initials: string;
  name: string;
  email: string;
  role: "관리자" | "강사";
}

interface RemoveMemberModalProps {
  member: MemberForModal;
  onClose: () => void;
  onConfirm: (member: MemberForModal) => void;
}

export function RemoveMemberModal({
  member,
  onClose,
  onConfirm,
}: RemoveMemberModalProps) {
  return (
    <Modal title="강사 내보내기" onClose={onClose} className="member-modal">
      <div className="member-modal__content">
        <h3>{member.name}을(를) 팀에서 내보낼까요?</h3>
        <p className="member-modal__description">
          내보내면 봄길학원 워크스페이스에 더 이상 접근할 수 없습니다. 진행하기
          전에 아래 내용을 확인해 주세요.
        </p>

        <div className="member-modal__member">
          <span className="member-modal__avatar">{member.initials}</span>
          <div className="member-modal__member-info">
            <strong>{member.name}</strong>
            <span>
              {member.email} · {member.role}
            </span>
          </div>
        </div>

        <div className="member-modal__notice">
          <Icon name="lock-keyhole" size={18} />
          <p>팀 자료, 문제 세트, 리포트의 조회·수정 권한이 즉시 해제됩니다.</p>
        </div>

        <div className="member-modal__notice">
          <Icon name="files" size={18} />
          <p>
            작성한 문제 세트와 검토 기록은 팀에 그대로 남습니다. 강사의 개인
            계정은 삭제되지 않습니다.
          </p>
        </div>

        <div className="member-modal__warning">
          <Icon name="alert-circle" size={16} />
          <p>
            이 작업은 되돌릴 수 없습니다. 다시 함께하려면 새 초대 코드를
            전달해야 합니다.
          </p>
        </div>
      </div>

      <div className="modal__footer">
        <Button variant="secondary" type="button" onClick={onClose}>
          취소
        </Button>
        <Button
          variant="primary"
          type="button"
          className="member-modal__danger-button"
          onClick={() => onConfirm(member)}
        >
          강사 내보내기
        </Button>
      </div>
    </Modal>
  );
}
