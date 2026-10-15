import { useEffect, useState } from "react";

import { createSchool, createWorkspace, searchSchools } from "@/entities/workspace/api/repository";
import type { SchoolResponse } from "@/entities/workspace/api/repository";
import { Button } from "@/shared/ui/Button/Button";
import { Modal } from "@/shared/ui/Modal/Modal";

import "./AddWorkspaceModal.css";

interface AddWorkspaceModalProps {
  onClose: () => void;
  onCreated: (workspaceId: number) => void;
}

/** 학교 검색 → (없으면 새 학교 등록) → 학년 선택 → 워크스페이스 만들기 */
export function AddWorkspaceModal({ onClose, onCreated }: AddWorkspaceModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchoolResponse[] | null>(null);
  const [school, setSchool] = useState<SchoolResponse | null>(null);
  const [newSchoolName, setNewSchoolName] = useState<string | null>(null);
  const [grade, setGrade] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 입력이 멈추면 검색한다
  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) return;
    let active = true;
    const timer = window.setTimeout(() => {
      searchSchools(keyword)
        .then((items) => active && setResults(items))
        .catch(() => active && setResults([]));
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const keyword = query.trim();
  const visibleResults = keyword ? results : null;
  const exactMatch = (visibleResults ?? []).some((item) => item.name === keyword);

  async function submit() {
    if (!school && !newSchoolName) {
      setError("학교를 선택해 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const target = school ?? (await createSchool(newSchoolName ?? ""));
      const workspace = await createWorkspace(target.id, grade);
      onCreated(workspace.id);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "워크스페이스를 만들지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const selectedLabel = school ? school.name : newSchoolName ? `${newSchoolName} (새 학교로 등록)` : null;

  return (
    <Modal className="add-workspace-modal" onClose={onClose} title="학교 추가">
      <div className="add-workspace">
        <p className="add-workspace__lead">학교와 학년을 고르면 워크스페이스가 만들어집니다. 기출과 출제 프로필은 워크스페이스마다 따로 관리됩니다.</p>

        <label className="add-workspace__label" htmlFor="school-query">
          학교 검색
        </label>
        <input
          autoComplete="off"
          id="school-query"
          onChange={(event) => {
            setQuery(event.target.value);
            setSchool(null);
            setNewSchoolName(null);
          }}
          placeholder="예: 압구정고, 건대부고"
          value={query}
        />

        {selectedLabel ? (
          <div className="add-workspace__selected">
            <span>{selectedLabel}</span>
            <Button
              onClick={() => {
                setSchool(null);
                setNewSchoolName(null);
              }}
              type="button"
              variant="text"
            >
              다시 고르기
            </Button>
          </div>
        ) : (
          visibleResults && (
            <ul className="add-workspace__results">
              {visibleResults.map((item) => (
                <li key={item.id}>
                  <button onClick={() => setSchool(item)} type="button">
                    <strong>{item.name}</strong>
                    {item.region && <small>{item.region}</small>}
                  </button>
                </li>
              ))}
              {!exactMatch && (
                <li>
                  <button className="add-workspace__new" onClick={() => setNewSchoolName(keyword)} type="button">
                    <strong>“{keyword}” 새 학교로 등록</strong>
                    <small>목록에 없으면 학교 이름을 정확히 입력해 등록하세요</small>
                  </button>
                </li>
              )}
            </ul>
          )
        )}

        <span className="add-workspace__label">학년</span>
        <div className="add-workspace__grades" role="group" aria-label="학년">
          {[1, 2, 3].map((value) => (
            <button
              aria-pressed={grade === value}
              className={grade === value ? "is-active" : undefined}
              key={value}
              onClick={() => setGrade(value)}
              type="button"
            >
              {value}학년
            </button>
          ))}
        </div>

        {error && (
          <p className="add-workspace__error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="modal__footer">
        <Button onClick={onClose} type="button" variant="secondary">
          취소
        </Button>
        <Button disabled={saving || !selectedLabel} onClick={() => void submit()} type="button" variant="primary">
          {saving ? "만드는 중..." : "워크스페이스 만들기"}
        </Button>
      </div>
    </Modal>
  );
}
