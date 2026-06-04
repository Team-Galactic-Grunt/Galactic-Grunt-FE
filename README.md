# Galactic Grunt FE

포켓몬 스타일의 탐험, 전투, 포획, 파티 관리가 가능한 프론트엔드 게임입니다.

## 주요 기능

- 맵 이동 및 이벤트 존 탐색
- 야생 포켓몬 배틀
- 기술 사용, 교체, 도망가기
- 포획 볼을 이용한 포획 시도
- 가방 아이템 사용
- 파티/박스 포켓몬 관리
- 전투 로그 출력 및 전투 연출
- BGM 및 배틀 전환 애니메이션

## 기술 스택

- React
- React Router
- JavaScript
- CSS Modules
- sessionStorage 기반 상태 관리

## 구현 화면
<img width="1080" height="720" alt="Group 531" src="https://github.com/user-attachments/assets/875222fc-59fd-4f91-9553-a8f0f53fe296" />
<img width="2131" height="967" alt="Group 533" src="https://github.com/user-attachments/assets/761170d3-6883-4f85-9bba-4c0538fdda8e" />
<img width="1080" height="720" alt="스크린샷 2026-06-03 오후 5 02 25 1" src="https://github.com/user-attachments/assets/9139200b-83df-4bb4-b9cb-1746f936cd27" />
<img width="2160" height="1440" alt="Group 532" src="https://github.com/user-attachments/assets/cc3cf716-1afb-498d-91d3-cbff950f2129" />

## 조작법

z : 선택
c : 메뉴 열기/닫기
x : 취소
방향키 : 이동

## 프로젝트 폴더 구조

- src/pages : 페이지 단위 화면
- src/components : 공용 UI 및 전투 컴포넌트
- src/hooks : 핵심 로직 훅
- src/utils : 피해 계산, 포획률, 타입 상성 같은 순수 함수
- src/api : 백엔드 통신 함수
- src/context: BGM 같은전역 텍스트

## 전투 시스템

- 플레이어와 적이 각각 스킬을 사용합니다.
- 스킬 우선순위가 더 높으면 먼저 공격합니다. (단, 우선순위가 같으면 스피드가 높은 쪽이 선공)
- 타입 상성과 랜덤 보정으로 피해량이 계산됩니다.
- 모든 기술 pp가 0 이면 발버둥으로 전환됩니다.
- 적을 쓰러뜨리면 경험치를 얻고 조건에 따라 레벨업합니다.

## 저장 방식

-전투 중 상태는 주로 sessionStorage 에 저장됩니다. 
-현재 포켓몬, 적, 파티, 가방 정보가 세션 기준으로 동기화

## 주의사항

-백엔드 Api가 동작해야 전투용 포켓몬 데이터가 정상 호출됩니다. 
-일부 상태는 새로고침 시 세션 기반으로 유지됩니다. 
-전투 중 로그는 순차 출력으로, 입력 타이밍에 주의가 필요합니다.

## 향후 확장 아이디어 

-상태 이상 추가 
-날씨/필드 효과 
-체육관장 배틀 
-도감 보상
-pvp 또는 도감 공유


## 실행 방법

###1.  의존성 설치 
npm install
###2.  개발 서버 실행
npm run dev

라이선스
::
