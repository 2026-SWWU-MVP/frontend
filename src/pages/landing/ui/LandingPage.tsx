import { Link } from "react-router-dom";

import "./LandingPage.css";

const DEMO_LOGIN = "/login?demo=1";

function Logo() {
  return (
    <Link className="public-logo" to="/">
      <img className="public-logo__mark" src="/logo.png" alt="" />
      <strong>내신뿌뿌</strong>
    </Link>
  );
}

/** 데모 데이터(눈송어학원 · 압구정고 1학년)와 같은 내용의 미리보기 */
function ProductPreview() {
  return (
    <div className="landing-preview" aria-label="내신뿌뿌 화면 미리보기">
      <article className="preview-card">
        <header className="preview-card__head">
          <span className="preview-label">출제 프로필</span>
          <strong>압구정고 1학년</strong>
          <span className="preview-badge preview-badge--ok">v2 확정</span>
        </header>
        <p className="preview-meta">
          기출 3회분 · 서술형 비율 36% · 학교 DB 1회분 반영
        </p>
        <ul className="preview-rules">
          <li>
            <span className="preview-tag">기출</span>
            <span>
              어구 배열은 매 시험 출제되고, 최근 시험에서는 2문항으로 늘었다
              <small>근거: 2024년 1학기 중간고사 서답형 2번 외 3</small>
            </span>
          </li>
          <li>
            <span className="preview-tag">기출</span>
            <span>
              요약문 빈칸은 첫 글자를 주고 본문 단어를 그대로 쓰게 한다
              <small>근거: 2025년 1학기 중간고사 서답형 1번 외 2</small>
            </span>
          </li>
          <li>
            <span className="preview-tag preview-tag--teacher">강사</span>
            <span>
              올해는 조건 영작 대신 어법 오류 수정을 낸다
              <small>강사 의견: 학생 설명회</small>
            </span>
          </li>
        </ul>
        <div className="preview-chips">
          <span>지문당</span>
          <b>요약문 빈칸 1</b>
          <b>어구 배열 1</b>
          <b>어법 오류 수정 1</b>
        </div>
      </article>

      <article className="preview-card preview-card--question">
        <header className="preview-card__head">
          <span className="preview-label">문항 검수</span>
          <strong>어구 배열</strong>
          <span className="preview-badge preview-badge--ok">검증 통과</span>
        </header>
        <p className="preview-stem">
          윗글에 나온 문장이 되도록 [보기]의 어구를 배열하시오.
        </p>
        <div className="preview-box">
          <strong>[조건]</strong> [보기]의 모든 어구를 한 번씩 사용할 것. 단어를
          추가하거나 형태를 바꾸지 말 것.
        </div>
        <div className="preview-chunks">
          {[
            "the government",
            "a new plan",
            "However",
            "was unable",
            "having",
            "to do so",
            "a limited budget",
            "and had to come up with",
          ].map((chunk, index) => (
            <span key={chunk}>
              {String.fromCharCode(9312 + index)} {chunk}
            </span>
          ))}
        </div>
        <p className="preview-meta">
          정답 근거: However, having a limited budget, the government was unable
          to do so…
        </p>
        <div className="preview-actions">
          <span className="preview-button preview-button--primary">채택</span>
          <span className="preview-button">폐기</span>
          <span className="preview-button">수정</span>
        </div>
      </article>
    </div>
  );
}

const steps = [
  {
    title: "기출 올리기",
    body: "학교 기출 PDF를 올리면 AI가 지문과 문항을 뽑아내고, 이상한 곳은 점검해 표시합니다. 선생님은 표시된 곳만 원본과 비교하면 됩니다.",
  },
  {
    title: "출제 프로필 확정",
    body: "어떤 유형이 몇 문항, 어떤 [조건]으로 나오는지 규칙으로 정리합니다. 규칙마다 근거 기출 문항이 붙고, 현장에서 들은 정보를 더해 확정합니다.",
  },
  {
    title: "문제 생성",
    body: "시험범위 지문을 고르고 지문당 유형 구성을 정하면, 확정한 프로필 기준으로 서술형 문항을 만듭니다. 48문항 기준 약 2분.",
  },
  {
    title: "검수·시험지",
    body: "문항을 채택하거나 폐기하고 고칩니다. 채택한 문항으로 학원 로고가 들어간 문제지와 정답·해설지를 PDF로 받습니다.",
  },
];

const faqs = [
  {
    q: "어떤 문항 유형을 만들 수 있나요?",
    a: "영어 내신 서술형 4가지입니다: 요약문 빈칸, 어구 배열, 어법 오류 수정, 조건 영작. 유형별 문항 수와 빈칸 수·첫 글자 힌트·틀린 곳 수 같은 옵션을 정할 수 있습니다.",
  },
  {
    q: "우리 학원이 올린 기출이 다른 학원에 보이나요?",
    a: "보이지 않습니다. 학교 DB에는 회차별 유형 비중 같은 통계만 쌓이고, 기출 원문과 올린 학원은 공유되지 않습니다.",
  },
  {
    q: "우리 학원에 그 학교 기출이 없어도 쓸 수 있나요?",
    a: "다른 학원이 같은 학교·학년 기출을 올렸다면, 그 통계로 학교 경향을 보고 출제 프로필을 만들 수 있습니다. 기출을 올리면 더 정확해집니다.",
  },
  {
    q: "AI가 만든 문항의 정답은 믿을 수 있나요?",
    a: "문항마다 규칙 검증(조건·빈칸 수·본문에 있는 문장인지 등)을 하고, 정답을 모르는 AI가 다시 풀어 정답이 하나로 정해지는지 확인합니다. 애매하면 '확인 필요'로 표시해 선생님이 확인합니다.",
  },
  {
    q: "시간은 얼마나 걸리나요?",
    a: "기출 분석은 1~2분, 출제 프로필 생성은 수십 초, 문항 48개 생성은 약 2분입니다. 기다리는 동안 진행 상황을 보여줍니다.",
  },
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="public-header">
        <Logo />
        <nav className="landing-nav" aria-label="주요 메뉴">
          <a href="#workflow">준비 흐름</a>
          <a href="#features">주요 기능</a>
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
          <span className="eyebrow">영어 내신 서술형 · 학교별 출제 프로필</span>
          <h1>
            우리 학교 기출 스타일 그대로,
            <br />
            내신 서술형을 <em>뿌셔뿌셔</em>
          </h1>
          <p>
            기출을 올리면 AI가 그 학교의 출제 패턴을 정리하고, 선생님이 확정한
            기준으로 시험범위 지문에서 서술형 문항을 만듭니다. 검수부터 학원
            로고가 들어간 시험지 PDF까지 한곳에서.
          </p>
          <div className="landing-hero__actions">
            <Link
              className="public-button public-button--large"
              to={DEMO_LOGIN}
            >
              데모로 둘러보기
            </Link>
            <Link
              className="public-button public-button--ghost public-button--large"
              to="/signup"
            >
              무료로 시작하기
            </Link>
          </div>
          <p className="demo-account">
            데모 계정 <code>demo</code> / <code>1234</code> · 눈송어학원
            원장으로 로그인됩니다
          </p>
          <ProductPreview />
        </section>

        <section className="landing-section" id="workflow">
          <div className="landing-section__head">
            <span className="eyebrow">준비 흐름</span>
            <h2>기출에서 시험지까지 4단계</h2>
            <p>
              학교마다 다른 출제 방식을 먼저 정리하고, 그 기준으로 문제를
              만듭니다.
            </p>
          </div>
          <ol className="landing-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="landing-steps__no">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="landing-section landing-section--tint"
          id="features"
        >
          <div className="landing-section__head">
            <span className="eyebrow">주요 기능</span>
            <h2>그대로 시험지에 넣을 수 있게</h2>
            <p>
              AI가 만든 문항을 선생님이 믿고 쓸 수 있도록 검증하고, 쓸수록
              학원에 맞춰집니다.
            </p>
          </div>
          <div className="landing-features">
            <article>
              <h3>두 번 검증하는 문항</h3>
              <p>
                규칙 검증으로 조건·형식을 확인하고, 정답을 모르는 AI가 다시 풀어
                정답이 하나인지 봅니다. 통과하지 못하면 최대 3번 다시 만들고,
                애매하면 "확인 필요"로 알려 줍니다.
              </p>
              <div className="feature-badges">
                <span className="preview-badge preview-badge--ok">
                  검증 통과
                </span>
                <span className="preview-badge preview-badge--warn">
                  확인 필요
                </span>
                <span className="preview-badge preview-badge--bad">
                  검증 실패
                </span>
              </div>
            </article>
            <article>
              <h3>쓸수록 맞춤</h3>
              <p>
                폐기 사유와 선생님이 고친 내용이 다음 생성에 반영됩니다. 데이터
                리포트에서 생성할 때마다 채택률이 어떻게 바뀌는지 봅니다.
              </p>
              <div
                className="feature-bars"
                aria-label="생성 작업별 채택률 예시"
              >
                <span>
                  <i style={{ height: 36 }} />
                  <small>1회차 50%</small>
                </span>
                <span>
                  <i style={{ height: 58 }} />
                  <small>2회차 80%</small>
                </span>
              </div>
            </article>
            <article>
              <h3>학교 DB, 통계만 함께</h3>
              <p>
                여러 학원이 올린 기출에서 유형 비중·서술형 비중·최근 변화 같은
                통계만 모읍니다. 원문은 공유하지 않아, 기출이 적은 학교도 경향을
                볼 수 있습니다.
              </p>
              <p className="feature-quote">
                "요약문 빈칸: 기출 4회 모두 출제 · 어구 배열: 최근 3회 연속"
              </p>
            </article>
          </div>
        </section>

        <section className="landing-section" id="audience">
          <div className="landing-section__head">
            <span className="eyebrow">활용 대상</span>
            <h2>학원 팀이 함께 씁니다</h2>
          </div>
          <div className="landing-audience">
            <article>
              <h3>원장님</h3>
              <ul>
                <li>초대 코드로 강사를 초대하고 내보내기</li>
                <li>학원 로고를 올리면 모든 시험지 머리글에</li>
                <li>학교·학년별 워크스페이스와 출제 프로필을 팀이 공유</li>
              </ul>
            </article>
            <article>
              <h3>강사님</h3>
              <ul>
                <li>담당 학교의 기출을 올리고 출제 프로필을 확정</li>
                <li>시험범위 지문으로 서술형 문항을 만들고 검수</li>
                <li>채택한 문항으로 문제지·정답지 PDF를 바로 출력</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="landing-section landing-section--tint" id="faq">
          <div className="landing-section__head">
            <span className="eyebrow">자주 묻는 질문</span>
            <h2>궁금한 점</h2>
          </div>
          <div className="landing-faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="landing-cta-band">
          <h2>압구정고 1학년 데모로 바로 확인해 보세요</h2>
          <p>
            기출 3회분, 확정된 출제 프로필, 생성·검수한 문항과 시험지가 들어
            있습니다. 데모 계정 <code>demo</code> / <code>1234</code>
          </p>
          <Link
            className="public-button public-button--large public-button--light"
            to={DEMO_LOGIN}
          >
            데모로 둘러보기
          </Link>
        </section>
      </main>

      <footer className="landing-footer">© 2026 내신뿌뿌</footer>
    </div>
  );
}
