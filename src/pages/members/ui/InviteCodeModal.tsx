import { useState } from "react";

import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { Modal } from "@/shared/ui/Modal/Modal";

import "./MemberModals.css";

interface InviteCodeModalProps {
  onClose: () => void;
}

export function InviteCodeModal({ onClose }: InviteCodeModalProps) {
  const [copied, setCopied] = useState(false);

  // UI 확인용 임시 코드. 실제 발급 API 연결 후 응답값으로 교체하세요.
  const inviteCode = "BG-7K4M2P";
  const issuedAt = "2026.10.12 10:30";
  const expiresAt = "2026.10.19 10:30";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Modal
      title="강사 초대 코드 발급"
      onClose={onClose}
      className="member-modal member-modal--invite"
    >
      <div className="member-modal__content">
        <div className="member-modal__success-heading">
          <span className="member-modal__success-icon">
            <Icon name="check" size={20} />
          </span>
          <div>
            <h3>초대 코드가 발급되었어요</h3>
            <p>함께할 선생님에게 아래 코드를 전달하세요.</p>
          </div>
        </div>

        <div className="member-modal__code-box">
          <span>봄길학원 · 본원</span>
          <strong>{inviteCode}</strong>
          <small>강사 권한으로 참여</small>
        </div>

        <dl className="member-modal__dates">
          <div>
            <dt>발급일</dt>
            <dd>{issuedAt}</dd>
          </div>
          <div>
            <dt>유효기간</dt>
            <dd>{expiresAt}까지 · 7일</dd>
          </div>
        </dl>

        <div className="member-modal__instructions">
          <strong>초대받은 강사는 이렇게 참여해요</strong>
          <p>
            문항결에 로그인한 뒤 ‘워크스페이스 참여’에서 코드를 입력하면 됩니다.
            코드가 만료되면 관리자가 다시 발급할 수 있어요.
          </p>
        </div>

        <div className="member-modal__share-note">
          <Icon name="link" size={16} />
          <span>초대할 강사에게만 공유해 주세요.</span>
        </div>
      </div>

      <div className="modal__footer">
        <Button variant="secondary" type="button" onClick={onClose}>
          닫기
        </Button>
        <Button variant="primary" type="button" onClick={copyCode}>
          <Icon name="copy" size={16} />
          {copied ? "복사 완료" : "초대 코드 복사"}
        </Button>
      </div>
    </Modal>
  );
}
