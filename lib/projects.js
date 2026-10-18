export const projects = [
  {
    slug: "cce-2026",
    type: "competition",
    category: "CTF & RESPONSE",
    title: "15분 안에,\n분석에서 대응까지.",
    name: "CCE 2026 · Live Fire",
    short:
      "코엑스 본선 17위. 빠르게 바뀌는 Live Fire 문제에서 팀의 대응에 기여했습니다.",
    date: "2026.10",
    tags: ["Live Fire", "Incident Response", "Teamwork"],
    metric: "17",
    unit: "본선 팀 순위",
    visual: "response",
    source: "https://iljae627.github.io/posts/cce2026/",
    role: "살려주CCE요 팀원 · Live Fire 분석 및 대응",
    problem:
      "15분마다 출제되고 사라지는 문제를 제한 시간 안에 분석하고 대응해야 했습니다. Jeopardy, Live Fire, KOTH, A&D가 동시에 진행되는 환경이었습니다.",
    approach: [
      "Jeopardy와 Live Fire를 우선 공략하는 팀 전략에 따라 문제를 분석했습니다.",
      "Live Fire에서 여러 문제를 빠르게 해결하며 실시간 대응에 집중했습니다.",
      "후반부 자동화 분석의 토큰 부족과 전략 전환의 한계를 회고에 기록했습니다.",
    ],
    result:
      "팀 최종 본선 17위. 회고에 따르면 Live Fire 섹터에서 팀 전체 1등 점수를 기록했고, 해당 섹터에서 본인의 기여도가 가장 높았습니다.",
    caveat:
      "순위는 팀 성과이며, 개인의 역할 설명은 본인이 작성한 회고를 근거로 합니다.",
  },
  {
    slug: "defcon-bbbq",
    type: "research",
    category: "REVERSE ENGINEERING",
    title: "바이트코드에서\n다시 찾은 실행의 원리.",
    name: "DEF CON 34 · BBBQ VM",
    short:
      "커스텀 VM 명령을 복원하고, 실행 명령 수와 메모리 사용량의 관계를 분석했습니다.",
    date: "2026.08",
    tags: ["ELF", "GDB", "Bytecode", "Python"],
    metric: "VM",
    unit: "명령어 · 제어 흐름 분석",
    visual: "bytecode",
    source:
      "https://iljae627.github.io/posts/defcon-34-finals-bbbq-koth-review/",
    role: "본선 KOTH 참가 · VM 분석 및 바이트코드 최적화 실험",
    problem:
      "FIFO 큐 기반 커스텀 VM에서 프로그램 크기, 동적 실행 명령 수, 메모리 최고 사용량을 함께 줄여야 했습니다.",
    approach: [
      "Python 래퍼를 넘어 실제 bbbq ELF의 dispatch와 handler를 분석했습니다.",
      "4바이트 명령을 분해하고 GDB로 QPUSH·QPOP·분기를 추적했습니다.",
      "분기 변위와 코드 포인터를 재계산하는 assembler·relocator 관점으로 최적화했습니다.",
    ],
    result:
      "후보 파일의 차이를 제어 흐름으로 해석하고, 큐 회전 비용과 메모리 사용량 사이의 상충 관계를 정리했습니다.",
    caveat:
      "팀의 전체 성과와 개인 실험을 구분합니다. 본선 최종 순위나 개인 우승을 주장하지 않습니다.",
  },
  {
    slug: "distribution-server",
    type: "development",
    category: "PROTOCOL & DEVELOPMENT",
    title: "사라진 연결을\n다시 만드는 일.",
    name: "DS / 3DS Distribution Server",
    short:
      "레거시 게임 통신을 위한 Python 서버와 배포 파일 변환 도구를 개발했습니다.",
    date: "2026.10",
    tags: ["Python", "HTTP", "DNS", "Binary Format"],
    metric: "DS",
    unit: "레거시 프로토콜 · 도구 개발",
    visual: "protocol",
    source: "https://github.com/iljae627/DS-3DS_-private_distribution_server",
    role: "개인 개발 · 서버 및 파일 변환 도구",
    problem:
      "서비스가 종료된 게임의 배포 통신을 이해하고, DS에서 사용할 수 있는 배포 파일과 서버 실행 흐름을 구성하는 프로젝트입니다.",
    approach: [
      "공개 README 기준, 4세대 PCD 배포를 위한 HTTP/HTTPS 부트스트랩과 DNS 연결 흐름을 구성했습니다.",
      "PK4를 856바이트 PCD Wonder Card로 바꾸는 Windows용 변환기를 제공했습니다.",
      "핫스팟 준비, 서버 실행, DS 연결과 오류 해결 절차를 문서화했습니다.",
    ],
    result:
      "README에 서버 실행 방법과 변환기 사용법을 공개했습니다. README는 생성 파일의 실제 DS 수신 확인을 명시합니다.",
    caveat:
      "공개 README의 4세대 기능을 근거로 소개합니다. 저장소 이름만으로 3DS의 모든 기능이 완성되었다고 주장하지 않습니다.",
  },
  {
    slug: "android-security",
    type: "research",
    category: "MOBILE SECURITY",
    title: "앱이 신뢰하는\n경계를 살펴봅니다.",
    name: "Android Security Lab",
    short:
      "HexTree, MASTG, Allsafe를 통해 앱의 저장소·컴포넌트·런타임을 분석했습니다.",
    date: "2026.10",
    tags: ["Android", "Frida", "JADX", "ADB"],
    metric: "14/14",
    unit: "HexTree Android Track 완료 기록",
    visual: "android",
    source: "https://iljae627.github.io/posts/hextree-android-track/",
    role: "교육용 취약 앱 실습 · 분석 및 기술 문서화",
    problem:
      "Android 앱에서 Intent, Content Provider, WebView와 런타임 로직이 만드는 신뢰 경계를 이해하는 학습입니다.",
    approach: [
      "HexTree Android Track 14개 과정의 실습 흐름을 기록했습니다.",
      "OWASP MASTG Hacking Playground의 24개 취약점 항목을 실습했습니다.",
      "Allsafe 12개 문제에서 로그 노출, SQL injection, Smali 패치, JNI 후킹 등을 분석했습니다.",
    ],
    result:
      "도구 실행과 분석 흐름을 기술 블로그에 남겼습니다. 학습 내용을 원문과 함께 확인할 수 있습니다.",
    caveat:
      "교육용 환경 실습이며 실제 서비스 취약점 제보나 버그바운티 수상 실적으로 표시하지 않습니다.",
    related: [
      "https://iljae627.github.io/posts/mastg-hacking-playground-24/",
      "https://iljae627.github.io/posts/allsafe-android-writeup/",
    ],
  },
  {
    slug: "digital-forensics",
    type: "research",
    category: "DIGITAL FORENSICS",
    title: "흩어진 흔적으로\n하나의 흐름을.",
    name: "Digital Forensic Challenge",
    short:
      "메모리, 로그, 클라우드 스토리지의 단서를 연결하고 분석 과정을 기록했습니다.",
    date: "2026.09",
    tags: ["Forensics", "MinIO", "Log Analysis", "Python"],
    metric: "DFC",
    unit: "2026 챌린지 분석 기록",
    visual: "forensics",
    source: "https://iljae627.github.io/posts/dfc-2-2026/",
    role: "챌린지 참가 · 아티팩트 분석 및 Write-up",
    problem:
      "남아 있는 메모리·로그·클라우드 흔적에서 사건의 흐름을 추론하는 챌린지를 분석했습니다.",
    approach: [
      "DFC 2026 101·151·152 문제의 분석을 기록했습니다.",
      "Who Stole My Storage에서 MinIO와 클라우드 로그를 분석했습니다.",
      "Dreamhack Forensics Path에서 파일 및 디스크 분석의 기초를 학습했습니다.",
    ],
    result: "분석 대상, 사용 도구와 단서의 연결 과정을 공개 글로 남겼습니다.",
    caveat:
      "챌린지 참여와 풀이 기록을 소개하며 실제 수사 경력이나 DFC 수상을 주장하지 않습니다.",
    related: [
      "https://iljae627.github.io/posts/DFC2026/",
      "https://iljae627.github.io/posts/dreamhack-forensics-pass/",
    ],
  },
  {
    slug: "infosec-hub",
    type: "development",
    category: "WEB DEVELOPMENT",
    title: "배운 지식이\n서로 연결되도록.",
    name: "InfoSec Hub",
    short:
      "다섯 보안 도메인의 지식을 모으는 팀 프로젝트에서 아키텍처와 스크립트를 맡았습니다.",
    date: "2026.06",
    tags: ["HTML", "CSS", "JavaScript", "PM"],
    metric: "5",
    unit: "보안 지식 도메인",
    visual: "web",
    source: "https://iljae627.github.io/posts/wep-programing-team-project/",
    role: "PM · 전체 아키텍처 및 UI 인프라 스크립트",
    problem:
      "분산된 정보보호 전공 지식을 공통 UI와 일관된 구조로 탐색할 수 있는 웹 아카이브가 필요했습니다.",
    approach: [
      "팀원 3명과 보안 도메인별로 콘텐츠와 구현 역할을 나눴습니다.",
      "공통 스타일·스크립트 구조를 설계하고 메인·포렌식·포너블 페이지를 담당했습니다.",
      "가상 메모리 구조 등 복잡한 전공 개념을 웹 화면으로 구조화했습니다.",
    ],
    result:
      "보안 지식 아카이브의 프론트엔드와 개발 과정을 기술 블로그에 기록했습니다.",
    caveat:
      "팀 프로젝트입니다. 디자인 및 다른 도메인의 콘텐츠는 팀원의 역할을 존중하여 구분합니다.",
  },
];

export const milestones = [
  {
    date: "2026.10",
    title: "CCE 2026 본선 17위",
    text: "살려주CCE요 팀 · Live Fire 문제 분석과 대응",
    url: "https://iljae627.github.io/posts/cce2026/",
  },
  {
    date: "2026.09",
    title: "JBU-CTF 장려상",
    text: "형진과 재재이야 팀 · 대회 풀이 및 회고",
    url: "https://iljae627.github.io/posts/jbuctf2026/",
  },
  {
    date: "2026.08",
    title: "DEF CON 34 본선 KOTH 참가",
    text: "BBBQ VM 리버싱과 바이트코드 최적화",
    url: "https://iljae627.github.io/posts/defcon-34-finals-bbbq-koth-review/",
  },
  {
    date: "2026.05",
    title: "DEF CON 34 예선 · 팀 6위",
    text: "2bird2can 로컬 재현 · rfc1149a 패킷 복원 분석",
    url: "https://iljae627.github.io/posts/defcon-34-qualifiers-review/",
  },
  {
    date: "2026.05",
    title: "TJCTF · 참가 팀 1위 / 947팀",
    text: "Jinddabi’s 팀원으로 참가 · 개인 기여의 한계와 학습을 회고",
    url: "https://iljae627.github.io/posts/tjctf-1st/",
  },
  {
    date: "2025",
    title: "네트워크관리사 2급 취득",
    text: "TCP/IP, 라우터, Windows 서버와 네트워크 기초",
    url: "https://iljae627.github.io/posts/network-specialist/",
  },
  {
    date: "2021",
    title: "DSA-CS Korea 자율주행 프로젝트",
    text: "카메라 기반 도로·표지판 인식 및 주행 제어 · 장려상",
    url: "https://iljae627.github.io/posts/dsa-cs-2021/",
  },
];
