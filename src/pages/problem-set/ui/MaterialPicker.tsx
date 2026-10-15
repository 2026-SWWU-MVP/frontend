import { useEffect, useState } from "react";

import { listMaterials } from "@/entities/problem-set/api/repository";
import type { MaterialResponse } from "@/entities/problem-set/api/repository";
import { resolveWorkspaceId } from "@/entities/workspace/api/repository";
import { formatDateTime } from "@/shared/lib/date";
import { Button } from "@/shared/ui/Button/Button";

const statusLabels: Record<MaterialResponse["status"], string> = {
  UPLOADED: "올림",
  SPLITTING: "지문 나누는 중",
  SPLIT: "지문 분리 완료",
  FAILED: "분리 실패",
};

/** 시험범위 텍스트 붙여넣기. 지문은 "---" 줄로 구분하고, "# 제목" 줄은 지문 제목이 된다 */
export function TextMaterialForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (title: string, text: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  return (
    <form
      className="material-text"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(title.trim(), text);
      }}
    >
      <label htmlFor="material-text-title">자료 이름</label>
      <input
        id="material-text-title"
        maxLength={200}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="예: 교과서 2과"
        required
        value={title}
      />
      <label htmlFor="material-text-body">지문</label>
      <textarea
        id="material-text-body"
        maxLength={50000}
        onChange={(event) => setText(event.target.value)}
        placeholder={"# Bringing New Life to Old Cities\nAs cities age, ...\n---\n# Crime and Budget\nFor years, ..."}
        required
        rows={10}
        value={text}
      />
      <small className="field-help">여러 지문은 "---"만 있는 줄로 나누고, 지문 첫 줄을 "# 제목"으로 쓰면 제목이 됩니다.</small>
      <Button disabled={busy || !title.trim() || !text.trim()} type="submit" variant="primary">
        {busy ? "등록 중..." : "텍스트 자료 등록"}
      </Button>
    </form>
  );
}

/** 이 워크스페이스에 이전에 올린 시험범위 자료에서 고른다 */
export function ExistingMaterials({
  selectedId,
  onPick,
}: {
  selectedId?: number;
  onPick: (material: MaterialResponse) => void;
}) {
  const [materials, setMaterials] = useState<MaterialResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    resolveWorkspaceId()
      .then((workspaceId) => listMaterials(workspaceId))
      .then((items) => active && setMaterials(items))
      .catch((cause: unknown) => {
        if (!active) return;
        setMaterials([]);
        setError(cause instanceof Error && cause.message ? cause.message : "자료 목록을 불러오지 못했습니다.");
      });
    return () => {
      active = false;
    };
  }, []);

  if (materials === null) return <p className="field-help">자료 목록을 불러오는 중입니다.</p>;
  if (error) return <p className="field-help">{error}</p>;
  if (materials.length === 0) return <p className="field-help">아직 올린 자료가 없습니다. PDF를 올리거나 텍스트를 붙여넣어 주세요.</p>;

  return (
    <ul className="material-list">
      {materials.map((material) => (
        <li key={material.id}>
          <button
            aria-pressed={material.id === selectedId}
            className={material.id === selectedId ? "is-active" : undefined}
            disabled={material.status === "FAILED"}
            onClick={() => onPick(material)}
            type="button"
          >
            <strong>{material.title || material.originalFilename || `자료 ${material.id}`}</strong>
            <small>
              {material.sourceType === "TEXT" ? "텍스트" : "PDF"} · 지문 {material.passageCount ?? 0}개 · {statusLabels[material.status]}
              {material.createdByName ? ` · ${material.createdByName}` : ""} · {formatDateTime(material.createdAt)}
            </small>
          </button>
        </li>
      ))}
    </ul>
  );
}
