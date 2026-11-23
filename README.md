<img src="images/01_header_banner.png" width="100%" alt="header" />

<br>
<div align='center'><h1>💻 배움을 멈추지 않는 개발자 이윤호입니다.</h1></div>
<br>
<div align='center'><h3> ✉ Email : <a href="mailto:ho8566z@gmail.com">ho8566z@gmail.com</a></h4></div>
<br>
<p align="center">
  <a href="https://app.notion.com/p/5bf00b1cd77d83e6abff018c339379b6?source=copy_link">
    <img src="images/btn_notion_portfolio.svg" width="300" alt="노션 포트폴리오 보기" />
  </a>
  &nbsp;&nbsp;
  <a href="https://ho8566z.github.io/yunho-portfolio-2611/">
    <img src="images/btn_web_portfolio.svg" width="300" alt="웹 포트폴리오 보기" />
  </a>
</p>
<br>
<br>

<p align="center">
  <img width="48%" src="https://github-profile-summary-cards.vercel.app/api/cards/stats?username=ho8566z&theme=tokyonight" alt="GitHub Stats" />
  <img width="48%" src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=ho8566z&theme=tokyonight" alt="Top Languages" />
</p>

---

# 📌 Projects

## 🖥 2차 프로젝트 — white-eyes

- **Overview**: 드론·CCTV 영상에서 사람 수, 유입/유출, 체류 시간을 분석해 구역별 통계와 혼잡 이벤트 알림으로 보여 주는 유동인구 분석 시스템

- **Info**: 2026.10.06 ~ 2026.11.23 · 팀 6인 · **담당: 보안 · 계정 · 이벤트** (인증·권한 보안과 혼잡·급증 이벤트 알림)

- **Tech Point**: Java 관리자 앱(Spring Boot·Spring Security)과 Python 분석 서버(Flask, YOLOv8 + OpenCV)를 분리한 멀티 서비스 구조이며, Docker·WSL 환경에서 MySQL로 연동하고 SSE로 혼잡 이벤트를 화면에 실시간 전달

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

  > 기능 하나를 이슈 하나, PR 하나로 나눠 white-eyes-spring에 **PR 41건(39건 dev 병합)**, 담당 기능 27개를 자동 테스트와 화면·통합 시험으로 확인, 이슈 27건(버그·명세 불일치·개선 제안) 등록, white-eyes-docs에도 PR 41건(병합 37건)으로 화면 확인 캡처 보고서와 명세 보완

  ### 🔑 공통 / 로그인 / 권한
  - **공통 오류 처리**: 오류 응답 형식을 통일하고 상태 코드별로 오류 코드와 로그 수준을 구분, 업무 오류는 스택 로그 생략  
  - **비밀번호 암호화**: BCrypt로 비밀번호를 암호화해 저장, 72바이트 초과 비밀번호 처리, 초기 비밀번호는 출력할 때 가려서 표시  
  - **관리자 앱 로그인**: 환경변수 기반 최고 관리자 초기 등록, 로그인, 비밀번호 변경, 로그아웃 이동 주소와 세션 없는 요청 처리, 사용자 앱과 관리자 앱의 로그인을 서로 독립시켜 구성  
  - **지역 · 구역 목록 API**: 지역과 구역 목록을 정렬해 제공  
  - **접근 권한 검사**: 역할(비회원 / 미승인 사용자 / 사용자 / 관리자 / 최고 관리자)에 따라 접근 가능한 화면과 API를 구분  
  - **세션 관리**: 세션 정리 주기와 만료 시간 설정, 승인 대기 화면에 다시 로그인 안내 추가  

  ### 👤 관리자 계정 관리
  - **관리자 비활성화 · 활성화**: 운영 중인 관리자 계정의 사용 여부를 변경, 비활성화 시 접속 중인 세션도 함께 지워 바로 차단  
  - **강제 로그아웃**: 관리자가 특정 사용자의 세션을 종료  
  - **비밀번호 재설정**: 사용자·관리자 비밀번호를 관리자가 재설정  
  - **내 정보 · 관리자 정보 수정**: 내 정보 조회·수정과 관리자 정보 수정  

  ### 📝 작업 기록
  - **작업 기록 저장**: 작업 기록 엔티티·저장 서비스·`work_history` 테이블 마이그레이션을 만들고, 관리 작업이 일어날 때마다 기록을 남김  
  - **작업 기록 조회 화면**: 기록 조회와 화면 구현, 통계 엑셀 작업 기록에 종류(kind) 추가  

  ### ⚠️ 이벤트 관리
  - **이벤트 판정**: 혼잡 이벤트, 급증 이벤트 판정과 캠 이상 감지, 급증 판정의 예외 규칙(결과 초 수 부족 시 건너뛰기, 증가율 상한)과 캠 이상 닫기 조건 정리  
  - **목록 · 요약 · 상세 조회**: 목록과 요약, 상세 화면, 오늘 이벤트 수를 요약과 지도 현황에 반영  
  - **처리 상태 변경**: 관리자가 이벤트 처리 상태를 변경, 두 관리자가 같은 이벤트를 동시에 처리해도 한 명만 성공하도록 방지  
  - **발생 시점 영상**: 이벤트 상세 창에서 발생 시점의 녹화 영상을 확인, 분 시작 시각 녹화를 찾지 못하던 오류와 가동 첫 1분 이벤트 영상 오류 수정  
  - **지도 핀 표시**: 진행 중인 이벤트를 지도 핀에 채움으로 표시  

  ### 🔔 관리자 알림
  - **알림 스트림(SSE)**: 새 이벤트를 관리자 화면에 실시간으로 전달  
  - **헤더 배지 · 토스트**: 알림 개수와 새 알림을 헤더에 표시  

  ### 📊 엑셀 내려받기
  - **이벤트 엑셀**: 내려받기 구현, 최고 인원 열 추가, 목록 필터(overlap)를 따르도록 수정  
  - **통계 엑셀**: 항목별 시트를 한 시트로 통합, 지역 선택 시 구역별 행으로 표시, 시연용 열 제외  
  - **기간 계산**: 엑셀 창과 통계 그래프 창의 최대 기간 계산을 서버와 같게 말일 기준으로 수정  

  ### 🛠 화면 보완 · 버그 수정
  - **사용자 앱 구역 핀**: 구역 핀을 누르면 정보 팝업이 열리도록 수정  
  - **통계 버튼**: 캠 패널을 펼쳐도 통계 버튼이 범례에 가려지지 않고 눌리도록 수정  

  ### 📄 문서화
  - **명세 문서 관리**: 기능 변경이 생기면 `white-eyes-docs`의 명세·화면 확인 결과·캡처 보고서에 함께 반영  
  - **화면 확인 보고서**: 구현한 기능마다 화면 캡처와 확인 결과를 정리  
  - **트러블슈팅 기록**: 개발 중 만난 문제(한글 Windows 컴파일 인코딩, 테스트 클래스 인식 실패 등)와 해결 과정을 문서로 남김  
  - **README 작성**: spring · flask · introduce 저장소의 README 작성 (spring #388, flask #68은 리뷰 대기 중)  

  ### ✅ 테스트
  - **기능별 테스트 작성**: 오류 응답, 로그인, 권한 검사, 작업 기록, 엑셀 등 구현한 기능마다 검수 기준 테스트를 함께 작성 (test → feat 순서로 진행)  

👉 [실행 화면](https://ho8566z.github.io/yunho-portfolio-2611/projects/white-eyes.html) · [프로젝트 소개 Repo](https://github.com/white-eyes1/white-eyes-introduce) · [프로젝트 코드 Repo](https://github.com/white-eyes1/white-eyes-spring) · [프로젝트 분석 Repo](https://github.com/white-eyes1/white-eyes-flask) · [문서 Repo](https://github.com/white-eyes1/white-eyes-docs) · [Notion](https://app.notion.com/p/41400b1cd77d8003b89edf0efe261379)

---

## 🖥 1차 프로젝트 — obsidian-shield

- **Overview**: CCTV와 드론 영상에서 AI가 보행자를 탐지·추적하고, 등록된 대상 인물이 발견되면 실시간으로 알려 주는 동영상 분석 기반 신원 탐지 관제 시스템

- **Info**: 2026.06.25 ~ 2026.07.24 · 팀 5인 · **담당: 로그 분석** (이벤트 로그 히스토리 기능 전체)

- **Tech Point**: Flask 위에서 YOLOv8n · InsightFace · OpenCV로 보행자를 탐지하고 얼굴까지 식별, 그 결과를 SSE(서버 푸시)로 실시간 알림. DB 없이 JSON 파일로 데이터 저장

- **Stack**  
  <img src="images/badge_python.png" height="20" alt="Python" />&nbsp;
  <img src="images/badge_flask.png" height="20" alt="Flask" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;
  <img src="images/badge_opencv.png" height="20" alt="OpenCV" />&nbsp;
  <img src="images/badge_yolov8n.png" height="20" alt="YOLOv8n" />&nbsp;
  <img src="images/badge_insightface.png" height="20" alt="InsightFace" />&nbsp;

- **My Role**

  > logger 브랜치를 logger → logger9로 단계별로 나눠 **PR 23건(19건 main 병합)**, 읽음 처리 때 사용자 로그가 1건만 남는 문제 · SSE 연결 중복 · 캡처 이미지 키 불일치를 직접 찾아 해결

  ### 🗂 이벤트 로그
  - **이벤트 로그 저장**: 이벤트 발생 시 고유 ID(uuid), 발생 시간, 위치(위도·경도), 대상 ID, 이벤트 이미지 경로, 읽음 여부를 JSON에 기록  
  - **목록 · 필터 · 정렬**: 이벤트ID·대상ID·발생시간으로 키워드 검색, 읽음/읽지 않음 구분, 최신순·오래된순·이벤트ID순 정렬, 페이지당 개수 선택과 페이지 분할, 검색 + 필터 동시 적용  
  - **이벤트 이미지 표시**: 이벤트ID를 누르면 로그에 연결된 이미지를 팝업창(모달)으로 표시, 이미지 경로(IMG_ROOT) 오류 수정  
  - **읽음 처리**: 체크박스 선택·전체 선택으로 여러 이벤트를 한 번에 읽음 처리, 로그인하지 않은 요청은 차단  

  ### 👤 사용자 로그
  - **확인 기록 자동 저장**: 이벤트를 읽음 처리하면 누가(확인자)·언제(확인시간) 확인했는지 사용자 로그에 기록  
  - **사용자별 로그 조회 · 필터**: 로그인한 사용자 기준으로 보이는 로그를 걸러서 조회, 이벤트ID·확인자·확인시간 검색과 정렬  

  ### 🔔 로그 알림
  - **실시간 알림(SSE)**: 새 이벤트 로그가 생기면 서버에서 브라우저로 바로 전달(스레드 신호로 새 로그 대기), 새 로그만 요청해 목록에 추가  
  - **토스트 · 배지 · 알림음**: 새 알림을 화면에 띄우고 개수를 올리며 알림음 재생, 새 로그 행을 목록 맨 위에 추가  
  - **대시보드 연동**: 새 알림이 오면 대시보드를 갱신하고 알림음 추가  

  ### 📊 엑셀 내려받기
  - **로그 엑셀 저장**: 이벤트 로그·사용자 로그 전체를 엑셀(.xlsx) 파일로 변환해 내려받기  

  ### 🎨 화면 구현
  - **로그 화면 UI**: 목록 표, 필터, 버튼, 페이지 이동, 읽음 표시 스타일과 화면 크기에 따른 반응형 CSS  

  ### 🧩 트러블슈팅
  - **사용자 로그 누락(501)**: 일괄 읽음 처리 시 마지막 1건만 기록되던 문제 → 로그 저장 호출을 반복문 안으로 옮기고 이미 읽은 이벤트는 건너뛰어 중복 방지  
  - **SSE 연결 중복(502)**: 페이지마다 연결이 새로 생겨 알림음·토스트가 중복되던 문제 → 연결 객체를 보관해 이미 있으면 새로 만들지 않고, 오류 시 닫고 초기화해 재연결  
  - **키 불일치(503)**: 이미지 조회 시 KeyError → 키 상수를 JSON에 저장된 실제 키(IMG_ROOT)와 일치시킴  

👉 [실행 화면](https://ho8566z.github.io/yunho-portfolio-2611/projects/obsidian-shield.html) · [프로젝트 Repo](https://github.com/Kanabig/obsidian-shield) · [Notion](https://app.notion.com/p/41400b1cd77d800fb83bcc3a81c240c1)

---

## 🖥 2차 개인 프로젝트 — nado-gam (나도 감)

- **Overview**: 가고 싶은 여행지를 고르면 항공편·투어·호텔·크루즈를 보여 주고, 비행 경로를 3D 지구본으로 보여 주며 장바구니·모의 결제·QR 예약 확인까지 이어지는 여행사 웹 서비스

- **Info**: 2026.11.19 ~ 2026.11.22 · 개인 프로젝트 (1인)

- **Tech Point**: 서버가 가격을 다시 계산하는 장바구니·모의 결제와 `seats_left >= 인원` 조건부 UPDATE 좌석 차감(부족하면 결제 전체 롤백), 사용자·관리자(`/admin`) 필터 체인과 계정 테이블 분리, 읽기(JdbcClient)·쓰기(JPA) 분리

- **Stack**  
  <img src="images/badge_java.png" height="20" alt="Java" />&nbsp;
  <img src="images/badge_springboot.png" height="20" alt="Spring Boot" />&nbsp;
  <img src="images/badge_springsecurity.png" height="20" alt="Spring Security" />&nbsp;
  <img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
  <img src="images/badge_mysql.png" height="20" alt="MySQL" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;  
  Thymeleaf · globe.gl · H2 · ZXing(QR)

- **My Role** (1인 개발: 기획 · 설계 · 구현 · 테스트 · 문서화 · 발표)

  ### 🌍 탐색
  - **지구본 메인 · 해외 여행**: 도시 100곳 사이의 비행 경로가 흐르는 3D 지구본(끌어서 놓은 방향으로 관성 회전), 여행지 98곳(권역 탭·검색·정렬 5종) → 출발지 → 직항/경유 → 항공편 상세, 항공편에 마우스를 올리면 경로 강조  
  - **투어 · 국내여행 · 호텔 · 크루즈**: 투어 142개(3테마·기간별 옵션·대륙/국가 필터·정렬), 국내 11개 도시 이동편·숙소, 호텔 354개·크루즈 7곳

  ### 🛒 예약
  - **장바구니 · 모의 결제 · QR**: 항공권·투어·호텔·크루즈·이동편을 담아 결제하면 좌석이 줄고 예약 번호와 QR(ZXing 서버 SVG)이 발급, 휴대폰으로 예약 확인, 관리자가 QR 토큰으로 체크인  

  ### 🛠 관리자 · 운영
  - **관리자 화면**: 항공편·특별전·투어·호텔 등록·수정·삭제(삭제 탭에서 복구), 노출 중지·재개와 작업 이력, 회원 정지, 팝업·고객문의 답변  

  ### ✅ 테스트 · 문서화
  - **테스트**: 자동 테스트 169개 통과(22개 클래스), 담기 → 결제 → 예약·QR → 체크인과 390px 화면, 휴대폰 QR 스캔을 직접 확인 (MySQL 프로필 실제 실행은 미확인)  
  - **트러블슈팅**: 10건 기록 (Thymeleaf 조각의 빈 호출 금지, 성공 알림이 오류처럼 보이던 색 충돌, 동시 결제 좌석 초과 방지 등)  
  - **문서**: 명세서(엑셀 13시트: 요구 88·기능 48·API 56·테이블 25)·설계서·ERD·발표 자료(PPT 32장)·노션 정리  

👉 [실행 화면](https://ho8566z.github.io/yunho-portfolio-2611/projects/nado-gam.html) · [프로젝트 Repo](https://github.com/ho8566z/nado-gam) · [문서 Repo](https://github.com/ho8566z/nado-gam_word) · [Notion](https://app.notion.com/p/41f00b1cd77d8020a023e67adbd29f95)

---

## 🖥 1차 개인 프로젝트 — nado-ham (나도 함)

- **Overview**: 월간 달력으로 일정을 기록하고, 다음 주 일정을 매주 일요일 21:00에 텔레그램으로 받아보는 개인 일정 관리 웹 서비스

- **Info**: 2026.11.07 ~ 2026.11.12 · 개인 프로젝트 (1인)

- **Tech Point**: 쓰기·단순 조회는 JPA, 검색·통계 같은 동적 조회는 MyBatis로 역할을 나눠 함께 사용하고, 스케줄러와 Telegram Bot API(롱 폴링)로 주간 브리핑 발송

- **Stack**  
  <img src="images/badge_java.png" height="20" alt="Java" />&nbsp;
  <img src="images/badge_springboot.png" height="20" alt="Spring Boot" />&nbsp;
  <img src="images/badge_springsecurity.png" height="20" alt="Spring Security" />&nbsp;
  <img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
  <img src="images/badge_mybatis.png" height="20" alt="MyBatis" />&nbsp;
  <img src="images/badge_mysql.png" height="20" alt="MySQL" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;

- **My Role** (1인 개발: 기획 · 설계 · 구현 · 테스트 · 문서화)

  ### 📅 일정 관리
  - **일정 CRUD · 검색 · 통계**: 월간 달력, 시작 시간(HH:mm), 이미지 첨부(선택), 제목·내용 검색과 요일별·주별 월 통계(MyBatis 동적 쿼리, 외부 차트 라이브러리 없이 표와 CSS 막대)  

  ### 🤖 주간 브리핑(텔레그램)
  - **계정 연동 · 자동 발송**: 1회용 연동 코드(10분 만료)로 봇과 계정을 연결하고, 일요일 21:00(KST)에 다음 주 일정을 날짜순으로 전송, 지금 보내기(10초 간격 제한) · 수신 켜기/끄기 · 발송 기록, 한 번 실패해도 다음 주 실행이 이어지도록 처리  

  ### 🔐 회원 · 보안
  - **가입 승인제 · 로그인 제한 · 소유자 검증**: 관리자 승인 후 사용, 연속 5회 실패 시 10분 잠금, 본인 일정만 접근(남의 일정 번호는 404), 폼 바인딩 허용 필드 제한, 이미지가 아닌 파일 업로드 거부, 비밀 값은 환경변수로 분리  

  ### 📱 화면
  - **모바일 대응**: 13개 화면에 viewport 메타와 768px 이하 반응형 CSS, 접는 메뉴와 날짜별 목록, 갤럭시(Chrome)에서 확인  

  ### ✅ 테스트 · 문서화
  - **테스트**: JUnit 5·MockMvc 318개(317개는 DB 없이 통과, 1개는 DB·메일·관리자 환경변수 필요), 실제 MySQL로 가입 → 승인 → 로그인 → 일정 → 검색 → 통계 → 브리핑 흐름 확인  
  - **트러블슈팅**: 29건 기록 (평문 비밀번호 커밋, 일정 소유자 검증 누락, 요청 폼 값 신뢰, 리눅스 MySQL 테이블명 대소문자, 달 이동 시 응답 순서 꼬임 등), 미해결 항목은 한계로 문서에 명시  
  - **문서**: README, 명세서 엑셀, 발표 자료(PPT) 작성  

👉 [실행 화면](https://ho8566z.github.io/yunho-portfolio-2611/projects/nado-ham.html) · [프로젝트 Repo](https://github.com/ho8566z/nado-ham) · [문서 Repo](https://github.com/ho8566z/nado-ham_word) · [Notion](https://app.notion.com/p/41400b1cd77d80a1a8faf9bc78e7d37d)

---

# 🛠 Tech Stack

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
