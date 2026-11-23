# Git 커밋 날짜 실습

이 폴더는 Git의 author/committer 날짜와 커밋 분할을 재현하기 위한 독립 실습 자료입니다. 생성되는 2026-09-27~2026-10-22 커밋 10개는 2026-11-23에 만든 가상 기록이며, 당시 실제 포트폴리오 개발 이력을 뜻하지 않습니다.

```powershell
cd docs/git-history-practice
python create-realistic-practice.py
cd realistic-practice-repo
git log --reverse --format="%h %aI %cI %s"
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 열면 연습용 정적 쇼핑몰을 볼 수 있습니다. 생성되는 저장소에는 원격이 설정되지 않습니다.
