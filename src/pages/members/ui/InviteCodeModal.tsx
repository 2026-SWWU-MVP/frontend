import { useState } from "react";

import type { InviteCode } from "@/entities/academy/api/repository";
import { formatDateTime } from "@/shared/lib/date";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { Modal } from "@/shared/ui/Modal/Modal";

import "./MemberModals.css";

interface InviteCodeModalProps {
  academyName: string;
  invite: InviteCode;
  onClose: () => void;
}

export function InviteCodeModal({ academyName, invite, onClose }: InviteCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const inviteCode = invite.code;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopied(false);
      setCopyFailed(true);
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
          <span>{academyName}</span>
          <strong>{inviteCode}</strong>
          <small>강사 권한으로 참여</small>
        </div>

        <dl className="member-modal__dates">
          <div>
            <dt>발급일</dt>
            <dd>{formatDateTime(invite.createdAt)}</dd>
          </div>
          <div>
            <dt>유효기간</dt>
            <dd>{formatDateTime(invite.expiresAt)}까지</dd>
          </div>
        </dl>

        <div className="member-modal__instructions">
          <strong>초대받은 강사는 이렇게 참여해요</strong>
          <p>
            회원가입·로그인 후 ‘학원 연결’ 화면의 ‘초대 코드 입력’에 코드를
            넣으면 됩니다. 코드는 강사 한 명만 쓸 수 있고, 만료되면 원장이 다시
            발급할 수 있어요.
          </p>
        </div>

        <div className="member-modal__share-note">
          <Icon name="link" size={16} />
          <span>
            {copyFailed
              ? "복사하지 못했습니다. 코드를 직접 선택해 복사해 주세요."
              : "초대할 강사에게만 공유해 주세요."}
          </span>
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
