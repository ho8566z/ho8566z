<img src="images/01_header_banner.png" width="100%" alt="header" />

<br>
<div align='center'>💻 배움을 멈추지 않는 개발자 이윤호입니다.</div>
<br>
<div align='center'> ✉ Email : <a href="mailto:ho8566z@gmail.com">ho8566z@gmail.com</a></div>
<div align='center'> 🔗 Notion : <a href="https://app.notion.com/p/5bf00b1cd77d83e6abff018c339379b6?source=copy_link">노션 포트폴리오</a></div>
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
  <img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
  <img src="images/badge_python.png" height="20" alt="Python" />&nbsp;
  <img src="images/badge_flask.png" height="20" alt="Flask" />&nbsp;
  <img src="images/badge_mysql.png" height="20" alt="MySQL" />&nbsp;
  <img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;
  <img src="images/badge_wsl.png" height="20" alt="WSL" />&nbsp;
  <img src="images/badge_docker.png" height="20" alt="Docker" />&nbsp;
  <img src="images/badge_opencv.png" height="20" alt="OpenCV" />&nbsp;
  <img src="images/badge_yolov8m.png" height="20" alt="YOLOv8m" />&nbsp;

- **My Role**

  #### 🔑 공통 / 로그인 / 권한
  - **공통 오류 처리 · 비밀번호 암호화**: 오류 응답 형식을 통일하고 비밀번호를 암호화해 저장  
  - **관리자 앱 로그인**: 최고 관리자 초기 등록, 로그인, 비밀번호 변경, 로그아웃 이동 주소와 세션 없는 요청 처리  
  - **접근 권한 검사**: 역할에 따라 접근 가능한 화면과 API를 구분  
  - **세션 관리**: 세션 정리 주기와 만료 시간 설정, 승인 대기 화면에 다시 로그인 안내 추가  

  #### 👤 관리자 계정 관리
  - **관리자 비활성화 · 활성화**: 운영 중인 관리자 계정의 사용 여부를 변경  
  - **강제 로그아웃**: 관리자가 특정 사용자의 세션을 종료  
  - **비밀번호 재설정**: 사용자·관리자 비밀번호를 관리자가 재설정  
  - **내 정보 · 관리자 정보 수정**: 내 정보 조회·수정과 관리자 정보 수정  

  #### 📝 작업 기록
  - **작업 기록 저장**: 관리 작업이 일어날 때마다 기록을 남김  
  - **작업 기록 조회 화면**: 기록 조회와 화면 구현, 통계 엑셀 작업 기록에 종류(kind) 추가  

  #### ⚠️ 이벤트 관리
  - **이벤트 판정**: 혼잡 이벤트, 급증 이벤트 판정과 캠 이상 감지  
  - **목록 · 요약 · 상세 조회**: 목록과 요약, 상세 화면, 오늘 이벤트 수를 요약과 지도 현황에 반영  
  - **처리 상태 변경**: 관리자가 이벤트 처리 상태를 변경  
  - **발생 시점 영상**: 이벤트 상세 창에서 발생 시점의 녹화 영상을 확인, 가동 첫 1분 이벤트 영상 오류 수정  
  - **지도 핀 표시**: 진행 중인 이벤트를 지도 핀에 채움으로 표시  

  #### 🔔 관리자 알림
  - **알림 스트림**: 새 이벤트를 관리자 화면에 실시간으로 전달  
  - **헤더 배지 · 토스트**: 알림 개수와 새 알림을 헤더에 표시  

  #### 📊 엑셀 내려받기
  - **이벤트 엑셀**: 내려받기 구현, 최고 인원 열 추가, 목록 필터(overlap)를 따르도록 수정  
  - **통계 엑셀**: 항목별 시트를 한 시트로 통합, 지역 선택 시 구역별 행으로 표시, 시연용 열 제외  
  - **기간 계산**: 최대 기간 계산을 서버와 같게 말일 기준으로 수정  

  #### 📄 문서화
  - **명세 문서 관리**: 기능 변경이 생기면 `white-eyes-docs`의 명세·화면 확인 결과·캡처 보고서에 함께 반영  

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

  #### 🗂 로그 관리
  - **사용자별 로그 조회 · 필터**: 로그인한 사용자 기준으로 보이는 로그를 걸러서 조회  
  - **이벤트 이미지 표시**: 로그에 연결된 이벤트 이미지를 화면에 표시  

  #### 🔔 로그 알림
  - **로그 알림 기능**: 새 로그가 생기면 알림으로 확인  

👉 [프로젝트 Repo](https://github.com/Kanabig/obsidian-shield)

---

## 🛠 Tech Stack

**Language**  
<img src="images/badge_java.png" height="20" alt="Java" />&nbsp;
<img src="images/badge_python.png" height="20" alt="Python" />&nbsp;
<img src="images/badge_javascript.png" height="20" alt="JavaScript" />&nbsp;

**Backend**  
<img src="images/badge_springboot.png" height="20" alt="Spring Boot" />&nbsp;
<img src="images/badge_springdatajpa.png" height="20" alt="Spring Data JPA" />&nbsp;
<img src="images/badge_flask.png" height="20" alt="Flask" />&nbsp;

**AI · Vision**  
<img src="images/badge_opencv.png" height="20" alt="OpenCV" />&nbsp;
<img src="images/badge_yolov8m.png" height="20" alt="YOLOv8m" />&nbsp;
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

<br>

<img src="images/02_footer_banner.png" width="100%" alt="footer" />
