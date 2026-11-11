<img src="images/01_header_banner.png" width="100%" alt="header" />

<br>
<div align='center'><h2>💻 배움을 멈추지 않는 개발자 이윤호입니다.</h2></div>
<br>
<div align='center'><h4> ✉ Email : <a href="mailto:ho8566z@gmail.com">ho8566z@gmail.com</a></h4></div>
<div align='center'><h4> 🔗 Notion : <a href="https://app.notion.com/p/5bf00b1cd77d83e6abff018c339379b6?source=copy_link">노션 포트폴리오</a></h4></div>
<br>
<br>

<p align="center">
  <img width="48%" src="https://github-profile-summary-cards.vercel.app/api/cards/stats?username=ho8566z&theme=tokyonight" alt="GitHub Stats" />
  <img width="48%" src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=ho8566z&theme=tokyonight" alt="Top Languages" />
</p>

---

## 📌 Projects

### 🖥 2차 프로젝트 — white-eyes

- **Overview**: 드론 관제를 통한 유동인구 분석 시스템

- **Stack**  
  <img src="images/badge_java.png" height="20" alt="Java" />&nbsp;
  <img src="images/badge_springboot.png" height="20" alt="Spring Boot" />&nbsp;
  <img src="images/badge_springsecurity.png" height="20" alt="Spring Security" />&nbsp;
  <img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
  <img src="images/badge_python.png" height="20" alt="Python" />&nbsp;
  <img src="images/badge_flask.png" height="20" alt="Flask" />&nbsp;
  <img src="images/badge_mysql.png" height="20" alt="MySQL" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;
  <img src="images/badge_wsl.png" height="20" alt="WSL" />&nbsp;
  <img src="images/badge_docker.png" height="20" alt="Docker" />&nbsp;
  <img src="images/badge_opencv.png" height="20" alt="OpenCV" />&nbsp;
  <img src="images/badge_yolov8n.png" height="20" alt="YOLOv8n" />&nbsp;

- **My Role**

  #### 🔑 공통 / 로그인 / 권한
  - **공통 오류 처리**: 오류 응답 형식을 통일하고 상태 코드별로 오류 코드와 로그 수준을 구분, 업무 오류는 스택 로그 생략  
- **비밀번호 암호화**: BCrypt로 비밀번호를 암호화해 저장, 72바이트 초과 비밀번호 처리, 초기 비밀번호는 출력할 때 가려서 표시  
  - **관리자 앱 로그인**: 환경변수 기반 최고 관리자 초기 등록, 로그인, 비밀번호 변경, 로그아웃 이동 주소와 세션 없는 요청 처리  
- **지역 · 구역 목록 API**: 지역과 구역 목록을 정렬해 제공  
  - **접근 권한 검사**: 역할에 따라 접근 가능한 화면과 API를 구분  
  - **세션 관리**: 세션 정리 주기와 만료 시간 설정, 승인 대기 화면에 다시 로그인 안내 추가  

  #### 👤 관리자 계정 관리
  - **관리자 비활성화 · 활성화**: 운영 중인 관리자 계정의 사용 여부를 변경  
  - **강제 로그아웃**: 관리자가 특정 사용자의 세션을 종료  
  - **비밀번호 재설정**: 사용자·관리자 비밀번호를 관리자가 재설정  
  - **내 정보 · 관리자 정보 수정**: 내 정보 조회·수정과 관리자 정보 수정  

  #### 📝 작업 기록
  - **작업 기록 저장**: 작업 기록 엔티티·저장 서비스·`work_history` 테이블 마이그레이션을 만들고, 관리 작업이 일어날 때마다 기록을 남김  
  - **작업 기록 조회 화면**: 기록 조회와 화면 구현, 통계 엑셀 작업 기록에 종류(kind) 추가  

  #### ⚠️ 이벤트 관리
  - **이벤트 판정**: 혼잡 이벤트, 급증 이벤트 판정과 캠 이상 감지, 급증 판정의 예외 규칙(결과 초 수 부족 시 건너뛰기, 증가율 상한)과 캠 이상 닫기 조건 정리  
  - **목록 · 요약 · 상세 조회**: 목록과 요약, 상세 화면, 오늘 이벤트 수를 요약과 지도 현황에 반영  
  - **처리 상태 변경**: 관리자가 이벤트 처리 상태를 변경  
  - **발생 시점 영상**: 이벤트 상세 창에서 발생 시점의 녹화 영상을 확인, 분 시작 시각 녹화를 찾지 못하던 오류와 가동 첫 1분 이벤트 영상 오류 수정  
  - **지도 핀 표시**: 진행 중인 이벤트를 지도 핀에 채움으로 표시  

  #### 🔔 관리자 알림
  - **알림 스트림**: 새 이벤트를 관리자 화면에 실시간으로 전달  
  - **헤더 배지 · 토스트**: 알림 개수와 새 알림을 헤더에 표시  

  #### 📊 엑셀 내려받기
  - **이벤트 엑셀**: 내려받기 구현, 최고 인원 열 추가, 목록 필터(overlap)를 따르도록 수정  
  - **통계 엑셀**: 항목별 시트를 한 시트로 통합, 지역 선택 시 구역별 행으로 표시, 시연용 열 제외  
  - **기간 계산**: 엑셀 창과 통계 그래프 창의 최대 기간 계산을 서버와 같게 말일 기준으로 수정  

  #### 🛠 화면 보완 · 버그 수정
  - **사용자 앱 구역 핀**: 구역 핀을 누르면 정보 팝업이 열리도록 수정  
  - **통계 버튼**: 캠 패널을 펼쳐도 통계 버튼이 범례에 가려지지 않고 눌리도록 수정  

  #### 📄 문서화
  - **명세 문서 관리**: 기능 변경이 생기면 `white-eyes-docs`의 명세·화면 확인 결과·캡처 보고서에 함께 반영  
  - **화면 확인 보고서**: 구현한 기능마다 화면 캡처와 확인 결과를 정리  
  - **트러블슈팅 기록**: 개발 중 만난 문제(한글 Windows 컴파일 인코딩, 테스트 클래스 인식 실패 등)와 해결 과정을 문서로 남김  

  #### ✅ 테스트
  - **기능별 테스트 작성**: 오류 응답, 로그인, 권한 검사, 작업 기록, 엑셀 등 구현한 기능마다 검수 기준 테스트를 함께 작성  

👉 [프로젝트 Repo](https://github.com/white-eyes1/white-eyes-spring) · [문서 Repo](https://github.com/white-eyes1/white-eyes-docs)

---

### 🖥 1차 프로젝트 — obsidian-shield

- **Overview**: 동영상 분석 기반 실시간 신원 탐지 시스템

- **Stack**  
  <img src="images/badge_python.png" height="20" alt="Python" />&nbsp;
  <img src="images/badge_flask.png" height="20" alt="Flask" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;
  <img src="images/badge_opencv.png" height="20" alt="OpenCV" />&nbsp;
  <img src="images/badge_yolov8n.png" height="20" alt="YOLOv8n" />&nbsp;
  <img src="images/badge_insightface.png" height="20" alt="InsightFace" />&nbsp;

- **My Role**

  #### 🗂 이벤트 로그
  - **이벤트 로그 저장**: 이벤트 발생 시 고유 ID(uuid), 발생 시간, 위치(위도·경도), 대상 ID, 이벤트 이미지 경로, 읽음 여부를 JSON에 기록  
  - **목록 · 필터 · 정렬**: 이벤트ID·대상ID·발생시간으로 키워드 검색, 읽음/읽지 않음 구분, 최신순·오래된순·이벤트ID순 정렬, 페이지당 개수 선택과 페이지 분할  
  - **이벤트 이미지 표시**: 이벤트ID를 누르면 로그에 연결된 이미지를 팝업창(모달)으로 표시, 이미지 경로(IMG_ROOT) 오류 수정  
  - **읽음 처리**: 체크박스 선택·전체 선택으로 여러 이벤트를 한 번에 읽음 처리, 로그인하지 않은 요청은 차단  

  #### 👤 사용자 로그
  - **확인 기록 자동 저장**: 이벤트를 읽음 처리하면 누가(확인자)·언제(확인시간) 확인했는지 사용자 로그에 기록  
  - **사용자별 로그 조회 · 필터**: 로그인한 사용자 기준으로 보이는 로그를 걸러서 조회, 이벤트ID·확인자·확인시간 검색과 정렬  

  #### 🔔 로그 알림
  - **실시간 알림(SSE)**: 새 이벤트 로그가 생기면 서버에서 브라우저로 바로 전달(스레드 신호로 새 로그 대기)  
  - **토스트 · 배지 · 알림음**: 새 알림을 화면에 띄우고 개수를 올리며 알림음 재생, 새 로그 행을 목록 맨 위에 추가  
  - **대시보드 연동**: 새 알림이 오면 대시보드를 갱신하고 알림음 추가  

  #### 📊 엑셀 내려받기
  - **로그 엑셀 저장**: 이벤트 로그·사용자 로그 전체를 엑셀(.xlsx) 파일로 변환해 내려받기  

  #### 🎨 화면 구현
  - **로그 화면 UI**: 목록 표, 필터, 버튼, 페이지 이동, 읽음 표시 스타일과 화면 크기에 따른 반응형 CSS  

👉 [프로젝트 Repo](https://github.com/Kanabig/obsidian-shield)

---

### 🖥 3차 개인 프로젝트 — job-feed

- **Overview**: 고용24 공채속보에서 개발·IT 채용공고를 주기적으로 수집해 노션 DB로 전달하는 채용공고 알림 서비스

- **Stack**  
  <img src="images/badge_java.png" height="20" alt="Java" />&nbsp;
  <img src="images/badge_springboot.png" height="20" alt="Spring Boot" />&nbsp;
  <img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
  <img src="images/badge_mysql.png" height="20" alt="MySQL" />&nbsp;
  <img src="images/badge_notion.png" height="20" alt="Notion" />&nbsp;  
  H2 · 고용24 OPEN-API · Notion API

- **My Role** (1인 개발: 기획 · 설계 · 구현 · 테스트 · 문서화)

  #### 📥 공고 수집
  - **고용24 연동 · 필터**: 공채속보 API 응답을 정규화하고 키워드·제외어로 걸러, (소스, 공고 ID) 기준으로 중복 없이 저장  

  #### 📤 노션 전송
  - **전송 대기열**: 새 공고를 10건씩 순차 전송, 실패 3회째 FAILED, 429·401·403은 횟수를 올리지 않고 중단  

  #### ⏰ 스케줄링 · 운영
  - **스케줄러 · 내부 API**: 수집 1시간·전송 1분 주기, 수동 수집과 전송 현황 조회 API, H2·MySQL 프로필, 비밀값은 환경변수로만 관리  

  #### ✅ 테스트 · 문서화
  - **테스트**: 통합·실패 주입 시나리오 포함 64개, 실연동으로 노션 14/14건 전송 확인  
  - **문서**: 명세서(엑셀)·ERD·흐름도·발표 자료(PPT) 작성  

👉 [프로젝트 Repo](https://github.com/ho8566z/job-feed) · [문서 Repo](https://github.com/ho8566z/job-feed_word)

---

### 🖥 2차 개인 프로젝트 — tube-filter

- **Overview**: YouTube 기본 검색에 없는 조건(정확한 길이, 조회수·구독자 범위, 업로드 요일·시간대 등)으로 영상을 걸러 주는 정밀 필터 검색 서비스

- **Stack**  
  <img src="images/badge_python.png" height="20" alt="Python" />&nbsp;
  <img src="images/badge_uv.png" height="20" alt="uv" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;  
  FastAPI · SQLAlchemy · Alembic · SQLite · Jinja2 · Chart.js · YouTube Data API v3 · pytest

- **My Role** (1인 개발: 기획 · 설계 · 구현 · 테스트 · 문서화)

  #### 🔍 검색 · 쿼터
  - **검색 파이프라인**: 조건 검증 → 후보 수집 → 영상·채널 필터(순수 함수) → 지표 계산 → 정렬·페이지·단계별 집계  
  - **쿼터 · 캐시**: 호출별 쿼터 기록과 사전 견적, 상한 초과 차단, 검색 결과·통계 캐시  

  #### 🔐 회원 · 개인화
  - **회원 · 보안**: 세션·CSRF, 이용 횟수·속도 제한, 프리셋·즐겨찾기·검색 기록  

  #### 📈 분석 · 화면
  - **시각화**: 요약, 산점도, 요일×시간대 히트맵(Chart.js), 채널 상세, CSV 내보내기  

  #### ✅ 테스트 · 문서화
  - **테스트**: mock 기반 pytest 556개 통과, API 키가 없어 실제 YouTube 응답은 확인하지 못함(README에 명시)  
  - **문서**: 명세서·단계별 구현 기록·트러블슈팅 작성  

👉 [프로젝트 Repo](https://github.com/ho8566z/tube-filter) · [문서 Repo](https://github.com/ho8566z/tube-filter_word)

---

### 🖥 1차 개인 프로젝트 — CALENDAR BOT

- **Overview**: 일정을 기록하고, 다음 주 일정을 매주 일요일 21:00에 텔레그램으로 받아보는 개인 일정 관리 웹 서비스

- **Stack**  
  <img src="images/badge_java.png" height="20" alt="Java" />&nbsp;
  <img src="images/badge_springboot.png" height="20" alt="Spring Boot" />&nbsp;
  <img src="images/badge_springsecurity.png" height="20" alt="Spring Security" />&nbsp;
  <img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
  <img src="images/badge_mybatis.png" height="20" alt="MyBatis" />&nbsp;
  <img src="images/badge_mysql.png" height="20" alt="MySQL" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;

- **My Role** (1인 개발: 기획 · 설계 · 구현 · 테스트 · 문서화)

  #### 📅 일정 관리
  - **일정 CRUD · 검색 · 통계**: 월간 달력, 이미지 첨부, 제목·내용 검색과 요일별 통계(MyBatis 동적 쿼리)  

  #### 🤖 주간 브리핑(텔레그램)
  - **계정 연동 · 자동 발송**: 연동 코드로 봇과 계정을 연결하고, 일요일 21:00에 다음 주 일정을 전송  

  #### 🔐 회원 · 보안
  - **가입 승인제 · 로그인 제한 · 소유자 검증**: 관리자 승인 후 사용, 연속 5회 실패 시 10분 잠금, 본인 일정만 접근  

  #### 📱 화면
  - **모바일 대응**: 768px 이하 접는 메뉴와 날짜별 목록  

  #### ✅ 테스트 · 문서화
  - **테스트**: JUnit 5·MockMvc 318개, 실제 MySQL로 전체 흐름 확인  
  - **문서**: README, 명세서 엑셀, 발표 자료(PPT) 작성  

👉 [프로젝트 Repo](https://github.com/ho8566z/calendar-bot) · [문서 Repo](https://github.com/ho8566z/calendar-bot_word)

---

## 🛠 Tech Stack

**Language**  
<img src="images/badge_java.png" height="20" alt="Java" />&nbsp;
<img src="images/badge_python.png" height="20" alt="Python" />&nbsp;
<img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;

**Backend**  
<img src="images/badge_springboot.png" height="20" alt="Spring Boot" />&nbsp;
<img src="images/badge_springsecurity.png" height="20" alt="Spring Security" />&nbsp;
<img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
<img src="images/badge_flask.png" height="20" alt="Flask" />&nbsp;
<img src="images/badge_mybatis.png" height="20" alt="MyBatis" />&nbsp;

**AI · Vision**  
<img src="images/badge_opencv.png" height="20" alt="OpenCV" />&nbsp;
<img src="images/badge_yolov8n.png" height="20" alt="YOLOv8n" />&nbsp;
<img src="images/badge_insightface.png" height="20" alt="InsightFace" />&nbsp;

**DB · Infra**  
<img src="images/badge_mysql.png" height="20" alt="MySQL" />&nbsp;
<img src="images/badge_docker.png" height="20" alt="Docker" />&nbsp;
<img src="images/badge_wsl.png" height="20" alt="WSL" />&nbsp;

**Tools**  
<img src="images/badge_git.png" height="20" alt="Git" />&nbsp;
<img src="images/badge_github.png" height="20" alt="GitHub" />&nbsp;
<img src="images/badge_notion.png" height="20" alt="Notion" />&nbsp;
<img src="images/badge_uv.png" height="20" alt="uv" />&nbsp;

<br>

<img src="images/02_footer_banner.png" width="100%" alt="footer" />
