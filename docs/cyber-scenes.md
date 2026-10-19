# 홈 분야 장면 수정 — 2026-10-19

- 포렌식: 원본 덮개의 구멍 여섯 곳에 나사 머리와 나사를 정렬했다. 나사를 풀고 옆으로 이동한 뒤에 덮개가 열린다. Android에서는 별도로 떠오르던 작은 실드 부품을 제거했다. 두 장면의 v3 이미지는 각각 PC·모바일 240장이다.
- 리버싱: CPU 컷아웃을 제거하고 본인 블로그의 Python 디버거 소스 화면을 가운데 배치했다. Canvas의 코드 열은 스크롤 진행도에 따라 아래로 이동하며, 멈추면 멈추고 위로 돌아가면 같은 상태를 복원한다. BBBQ VM과 디버거 학습 기록을 연결했다.
- 웹 해킹: 기존 Web3 장면을 교체했다. 정상 포트폴리오 캡처를 여덟 띠로 나누어 진행도에 따라 위치·색을 변형하고 PAGE MODIFIED 화면으로 전환한다. 프레임 판정은 720단계다. 실제 사이트의 인증·권한·데이터는 변경하지 않는 화면 내부 효과다.
- 두 새 장면은 필요한 위치에서만 런타임을 불러오며 화면 밖에서는 그리기를 생략한다. 동작 줄이기 설정에서는 첫 상태를 유지한다. 기존 카드·연결선 근처 판정, 키보드 포커스, 모바일 열기 버튼을 공유한다.

## TrustGate 활동 기록 근거

Rootkeepers 공개 저장소 `https://github.com/Rootkeepers/TrustGate`의 커밋 `c8bd191a760e4fd764cffd5ab0e904a8106082f2`를 읽고 프로젝트명, 수집 구조, 여섯 규칙, PASS/RISK/UNVERIFIABLE 판정을 반영했다. Track C의 DSSE·SLSA·Fulcio·Rekor 및 provenance 선택 과정은 `src/rootkeepers/collectors/sigstore/README.md`를 참고했다. 이 참조 저장소의 프로그램은 실행하지 않았다.

개인 기여는 사용자가 확인한 ‘Sigstore·Rekor 수집기 개발, 이후 공동 작업’으로 명시했다. 기존 `/work/collector` 주소는 유지한다. MongoDB는 `manual-collector-team-project` 한 항목의 제목·요약·태그만 업데이트하며 기존 항목은 무시된 work 폴더에 백업한다. 전체 동기화·인증 설정은 변경하지 않는다.
