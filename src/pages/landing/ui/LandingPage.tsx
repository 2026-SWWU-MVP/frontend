import { Link } from "react-router-dom";

import "./LandingPage.css";

function Logo() {
  return (
    <Link className="public-logo" to="/">
      <span className="public-logo__mark">▥</span>
      <strong>내신 뚝딱</strong>
    </Link>
  );
}

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="public-header">
        <Logo />
        <nav className="landing-nav" aria-label="주요 메뉴">
          <a href="#features">주요 기능</a>
          <a href="#workflow">준비 워크플로</a>
          <a href="#audience">활용 대상</a>
          <a href="#faq">자주 묻는 질문</a>
        </nav>
        <div className="public-header__actions">
          <Link to="/login">로그인</Link>
          <Link className="public-button" to="/signup">
            회원가입
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <span className="eyebrow">
            자료에서 수업까지, 내신 준비의 새로운 흐름
          </span>
          <h1>
            우리 학원 자료로
            <br />
            우리 학교에 맞는 문제를
          </h1>
          <p>
            AI로 변형하고, 선생님과 함께 검토하고, 수업에 바로 활용하세요.
            <br />
            내신뚝딱은 문제 제작부터 시험 후 리뷰까지 연결하는 내신 준비
            워크스페이스입니다.
          </p>
          <div
            className="product-preview"
            aria-label="내신 뚝딱 워크스페이스 미리보기"
          >
            <aside>
              <Logo />
              <div className="preview-workspace">봄길학원 ⌄</div>
              <div className="preview-menu is-active">▦ 워크스페이스</div>
              <div className="preview-menu">▤ 문제 세트</div>
              <div className="preview-menu">▤ 학교·시험 경향</div>
              <div className="preview-menu">▤ 데이터 리포트</div>
            </aside>
            <div className="preview-main">
              <div className="preview-top">
                봄길학원 · 워크스페이스 <span>데모 데이터 ⌕</span>
              </div>
              <h2>
                오늘의 수업 준비, 한결 가볍게{" "}
                <button>+ 새 문제 세트 만들기</button>
              </h2>
              <div className="preview-stats">
                <div>
                  <small>이번 달 제작 세트</small>
                  <strong>24개</strong>
                </div>
                <div>
                  <small>검토 대기</small>
                  <strong>3개</strong>
                </div>
                <div>
                  <small>출제된 시험 자료</small>
                  <strong>12건</strong>
                </div>
              </div>
              <div className="preview-list">
                <strong>최근 문제 세트</strong>
                <p>
                  한빛고 2학년 · 공공재와 시장 실패 <i>공동 검토</i>
                </p>
                <p>
                  한빛고 2학년 · 문학 표현과 정서 <i>확정 완료</i>
                </p>
                <p>
                  세솔중 3학년 · 이차함수 활용 <i>초안</i>
                </p>
              </div>
            </div>
          </div>
          <small className="preview-caption">
            화면 속 학교·자료·통계는 기능 설명을 위한 가상 예시입니다.
          </small>
        </section>

        <section className="workflow" id="workflow">
          <div>
            <h2>간단한 흐름으로 문제를 준비하세요</h2>
            <p>
              자료 입력부터 AI 생성, 공동 검토, PDF 출력까지 핵심 기능만으로
              빠르게 시작할 수 있어요.
            </p>
          </div>
          <div className="workflow-grid">
            <article>
              <span>♧ 01</span>
              <h3>자료 입력</h3>
              <p>
                시험지, 교과서, 보유 자료를 업로드하고 학원만의 준비 흐름을
                시작하세요.
              </p>
            </article>
            <article>
              <span>▱ 02</span>
              <h3>AI 생성</h3>
              <p>
                입력한 자료를 바탕으로 문제를 변형하고, 선생님의 검토를 위한
                초안을 빠르게 만드세요.
              </p>
            </article>
            <article>
              <span>♧ 03</span>
              <h3>공동 검토</h3>
              <p>
                팀원과 함께 검토하고, 최종 확정된 세트를 바로 PDF로 내보내세요.
              </p>
            </article>
          </div>
        </section>
        <Link className="landing-cta" to="/signup">
          시작하기
        </Link>
      </main>
    </div>
  );
}
