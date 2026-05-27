# 힐링비트 애플 인앱 

React Native 및 Expo 프레임워크 기반 프로젝트 
* - AI 얼굴분석 BPM, HRV, 스트레스 지수 측정 및 결과 페이지
* - 백그라운드 오디오 재생 
* - 오프라인 전용 화면 및 저장된 음원 재생
* - 음원 스트리밍, 스트리밍 미니, 풀 사이즈 컨트롤러 화면 

## 1. 프레임워크 및 핵심 라이브러리 정보

### 핵심 플랫폼 및 프레임워크

| 라이브러리 / 프레임워크 | 버전 |
| :--- | :--- |
| expo | ~54.0.25 |
| react | 19.1.0 |
| react-native | 0.81.5 |
| typescript | ~5.9.2 |

### AI 및 미디어 기능 라이브러리

| 라이브러리 / 프레임워크 | 버전 |
| :--- | :--- |
| @tensorflow/tfjs | ^4.22.0 |
| @tensorflow-models/blazeface | ^0.1.0 |
| @tensorflow/tfjs-react-native | ^1.0.0 |
| expo-camera | ~17.0.10 |
| react-native-track-player | ^4.1.2 |
| react-native-blob-util | ^0.24.7 |
| react-native-fs | ^2.20.0 |

### 네이티브 디바이스 연동 라이브러리

| 라이브러리 / 프레임워크 | 버전 |
| :--- | :--- |
| react-native-health | ^1.19.0 |
| react-native-health-connect | ^3.5.0 |
| react-native-watch-connectivity | ^1.1.0 |

### 상태 관리 및 UI 라이브러리

| 라이브러리 / 프레임워크 | 버전 |
| :--- | :--- |
| zustand | ^5.0.8 |
| @react-navigation/native | ^7.1.22 |
| @gorhom/bottom-sheet | ^5.2.14 |
| react-native-reanimated | ^3.19.5 |
| react-native-gesture-handler | ~2.28.0 |


## 2. 폴더 구조

```filepath
HealingBeat_APPLE_INAPP/
├── android/                   # 안드로이드 네이티브 프로젝트 폴더
├── ios/                       # iOS 네이티브 프로젝트 폴더
├── assets/                    # 이미지, 아이콘, 스플래시 화면 등 정적 리소스 자원
├── patches/                   # react-native-track-player 네이티브 오그멘테이션 패치 파일
├── plugins/                   # Expo Prebuild 커스텀 플러그인 (WatchApp, Health Connect 빌드 세팅용)
├── targets/                   # WatchOS companion 빌드 대상 리소스
├── watch_backup/              # 애플워치 소스코드 백업 자료
├── package.json               # 프로젝트 빌드 스크립트 및 프레임워크 라이브러리 목록
├── app.json                   # iOS 번들 식별자 및 안드로이드 권한 설정 등 Expo 통합 구성
│
└── src/                       # 소스코드 메인 디렉토리
    ├── app/                   # 애플리케이션 진입점 및 전역 설정
    │   └── navigation/        # 앱 전체 스택 및 바텀 탭바(Bottom Tab) 네비게이션 제어
    │
    ├── pages/                 # 화면 단위 컴포넌트 및 페이지 뷰
    │   ├── heart-rate/        # 실시간 심박수 측정 결과 및 인터랙션 화면
    │   ├── home/              # 메인 홈 대시보드 화면
    │   ├── measurement/       # 전면 카메라 AI 안면 인식 스트레스 측정 화면
    │   ├── mypage/            # 마이페이지 및 개발자 도구 (오프라인 토글 기능 등)
    │   ├── permission/        # 카메라 및 바이탈 헬스 권한 승인 유도 화면
    │   └── sleep/             # 슬립 타이머 연동 및 전용 수면 화면
    │
    ├── widgets/               # 페이지 간 조립 가능한 독립 비즈니스 덩어리 UI
    │   ├── custom-tab-bar/    # 모션이 적용된 하단 커스텀 탭바 UI 컴포넌트
    │   └── player/            # 미니 오디오 플레이어 및 플레이리스트 통합 컨트롤러
    │
    ├── features/              # 비즈니스 가치가 높은 독립적 기능 제어 로직
    │   ├── download-track/    # 음원 캐싱 관리 및 로컬 저장 기능
    │   ├── measure-stress/    # TensorFlow 안면 ROI 및 BlazeFace 활용 실시간 스트레스 검출
    │   ├── onboarding/        # 최초 기동 슬라이드 및 시작 조건 판별
    │   ├── play-audio/        # 오디오 드라이버 구동, RemoteDuck 수신 컨트롤
    │   └── pomodoro-timer/    # 집중 유도 뽀모도로 타이머 기능
    │
    ├── entities/              # 도메인 데이터 모델 및 비즈니스 전역 스토어
    │   ├── health/            # 건강vital 데이터 폴링 타이머 제어 스토어
    │   ├── network/           # 네트워크 물리 상태 및 임의 오프라인 상태 저장 스토어
    │   └── playlist/          # 음원 탐색 목록 및 캐시 리스트 보존 스토어
    │
    └── shared/                # 도메인 종속이 전혀 없는 다용도 기초 모듈
        ├── constants/         # 디스크 키값 등 전역 고정 데이터 정의
        ├── lib/               # 유틸리티 성격의 서브 기능 모음
        │   ├── audio/         # DownloadManager 및 플레이어 백그라운드 구동 인프라 서비스
        │   ├── context/       # 스크롤 최적화 처리용 리액트 Context 모음
        │   └── health/        # HealthKit 및 Health Connect 연동 구체 스크립트
        └── ui/                # Toast 디자인 구성 등 전역 UI 빌더
```

## 3. 주요 기능 및 구현 상세

### 3.1 AI 카메라 측정
* 구현 위치: src/features/measure-stress, src/pages/measurement
* 기술 스택: @tensorflow/tfjs, @tensorflow-models/blazeface, expo-camera
* 동작 원리:
  * 전면 카메라를 통해 들어오는 실시간 영상 데이터를 TensorFlow.js 텐서 형태로 수집
  * BlazeFace 안면 인식 모델을 사용하여 얼굴을 감지
  * 감지된 얼굴의 중심점이 화면 중앙의 원형 가이드 영역(Region of Interest, ROI) 내부에 들어와 있는지 실시간으로 검사
  * 모바일 기기의 하드웨어 리소스 과부하를 방지하기 위해 매 3프레임마다 연산을 수행하도록 프레임 레이트 제한 로직이 추가됨

### 3.2 건강 데이터 연동 - ❗️개발중
* 구현 위치: src/shared/lib/health
* iOS (Apple HealthKit):
  * react-native-health 라이브러리를 사용하여 사용자의 심박수 및 운동 데이터를 연동
  * CommonJS 모듈 형식 호환성 문제로 인해 `require` 구문을 사용하여 안정적으로 초기화 및 데이터를 조회
* Android (Health Connect):
  * react-native-health-connect 라이브러리를 사용해 심박수 및 수면 상태 데이터를 읽어옴
  * Native Activity가 준비될 수 있도록 초기화 함수에 지연 시간(500ms)을 설정하여 안정성을 높임

### 3.3 웨어러블 워치 디바이스 연동- ❗️개발중
* 구현 위치: src/pages/heart-rate, src/entities/health
* 기술 스택: react-native-watch-connectivity
* 동작 원리:
  * iPhone과 애플워치가 정상 페어링되어 있는지 감지
  * 사용자가 모바일 앱에서 '측정 시작'을 누르면 워크아웃 세션(Workout Session)을 연동하는 iOS 네이티브 모듈인 `WatchLauncherModule`을 호출하여 워치 앱을 즉시 실행(Wakeup)시킴
  * 워치 디바이스가 측정한 실시간 심박수 데이터를 `sendMessage` 및 `watchEvents` 리스너를 통해 수신하여 앱 화면에 즉시 렌더링하고 스트레스 분석에 활용

### 3.4 음원 재생 및 다운로드
* 구현 위치: src/shared/lib/audio, src/features/play-audio, src/widgets/player
* 기술 스택: react-native-track-player, react-native-blob-util, react-native-fs
* 동작 원리:
  * 앱이 백그라운드로 진입하거나 잠금 화면 상태가 되어도 중단 없는 오디오 재생을 지원
  * 다른 소리(전화 수신, 내비게이션 안내 등)가 들려올 경우 일시정지하고 상황에 맞춰 복구하는 RemoteDuck 기능 포함
  * DownloadManager를 통해 원격 음원을 로컬 디바이스 내부 디렉토리(`dirs.DocumentDir/downloads`)에 다운로드하여 관리
  * 네트워크 연결이 끊긴 상태(오프라인 모드)에서도 로컬에 저장된 음원을 통해 끊김 없이 플레이어를 사용할 수 있도록 오프라인 예외 처리

### 3.5 오프라인 모드 
* 구현 위치: src/entities/network, src/shared/lib/audio, App.tsx
* 기술 스택: @react-native-community/netinfo, zustand
* 동작 원리:
  * NetInfo 리스너를 통해 네트워크 연결 상태를 실시간 감지하여 전역 네트워크 스토어에 상태 보존
  * 인터넷이 연결되지 않은 상태이거나 마이페이지 내 오프라인 시뮬레이션 스위치 작동 시 오프라인 모드로 즉시 전환
  * 로컬 문서 디렉토리에 저장된 음원 파일 유무를 식별하고, 다운로드 완료된 파일 경로를 로컬 URI 경로로 자동 대치하여 재생 연동
  * 오프라인 전용 안내 화면을 노출하며 스트리밍 통신 시도를 사전 차단하여 네트워크 관련 오류 발생 방지

### 3.6 개발자 테스트 모드
* 구현 위치: src/pages/mypage
* 기능 상세:
  * 알림 메시지 디자인이 정상 표시되는지 테스트할 수 있는 버튼을 제공
  * 오프라인 시뮬레이션 스위치 기능을 제공하여, 이를 켜면 실제 디바이스 상태와 상관없이 네트워크 단절 예외 화면으로 즉시 전환하여 오프라인 재생 로직을 테스트 가능

### 3.7 애플워치 컴패니언 앱 소스코드 백업 및 자동 연동
* 구현 위치: watch_backup/, plugins/withWatchApp.js
* 기술 스택: Swift (SwiftUI / HealthKit), Expo Config Plugins
* 동작 원리:
  * `npx expo prebuild --clean` 실행 시 네이티브 `ios/` 폴더가 매번 초기화(Clean)되므로, 애플워치용 컴패니언 앱의 네이티브 소스코드를 프로젝트 외부 `watch_backup/` 디렉토리에 백업하여 보존
  * `watch_backup/HealingBeatWatch Watch App` 내부에 워치 독립 UI(`ContentView.swift`), 엔트리 포인트(`HealingBeatWatchApp.swift`), 모바일 스마트폰과의 바이탈 수집 통신 세션 매니저(`WatchSessionManager.swift`)를 포함
  * 모바일 앱에서 HealthKit 심박수를 수집하기 위해 워크아웃 세션으로 워치 앱을 자동 강제 구동시키는 Swift 기반의 `WatchLauncherModule.swift`를 보존
  * `plugins/withWatchApp` 커스텀 빌드 플러그인이 프리빌드 시점에 이 백업 폴더를 자동으로 읽어 들여 Xcode 프로젝트 파일 내부에 Watch App Target을 생성하고 필요한 Swift 파일과 프레임워크 권한을 동적으로 결합 및 컴파일

## 4. 빌드 및 개발 환경 설정

### 4.1 개발 환경 구성
* Expo Dev Client 설치 필수
* Xcode 및 Android Studio 설정 필요

1. 의존성 패키지 설치
   `npm install`

2. 네이티브 빌드 리소스 클리닝 및 프리빌드
   `npx expo prebuild --clean`

### 4.2 프로젝트 실행 명령어

* iOS 시뮬레이터로 빌드 및 실행:
  `npm run ios:sim` 
* iOS 실물 디바이스로 빌드 및 실행:
  `npm run ios:device` 
* Android 에뮬레이터/디바이스로 빌드 및 실행:
  `npm run android`
* Android 실물 디바이스로 빌드 및 실행:
  `npm run android:device`
* Android 릴리즈(배포) 버전 빌드 및 기기 실행:
  `npm run android:release`
* Metro 번들러 실행:
  `npm run start`
