import { useEffect, useMemo, useState } from "react";

type ChoiceOutcome = "accepted" | "dismissed";
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: ChoiceOutcome; platform: string }>;
}

function isStandalone(): boolean {
  // 데스크톱/안드로이드
  const standaloneDisplay = window.matchMedia?.("(display-mode: standalone)")
    .matches;
  // iOS PWA
  const iOSStandalone = (navigator as any).standalone === true;
  return !!standaloneDisplay || !!iOSStandalone;
}

function getIOS(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

export default function InstallPWAButton() {
  const mobileSizeBase = 768;
  const isMobile =
    "ontouchstart" in window || window.innerWidth < mobileSizeBase;

  const [deferredEvt, setDeferredEvt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(isStandalone());
  const [isIOS, _setIsIOS] = useState<boolean>(getIOS());
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [supportHint, setSupportHint] = useState<boolean>(false);

  useEffect(() => {
    // beforeinstallprompt 가로채기 (Chrome/Edge/Android/일부 데스크톱)
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferredEvt(e as BeforeInstallPromptEvent);
    };

    // 설치 완료 이벤트
    const onInstalled = () => {
      setInstalled(true);
      setDeferredEvt(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    // 지원 여부 힌트(버튼 비표시 상황 디버깅용)
    setSupportHint("onbeforeinstallprompt" in window);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canShow = useMemo(() => {
    if (installed) return false; // 이미 설치됨 → 버튼 숨김
    if (isIOS) return true; // iOS는 가이드 버튼을 노출
    return !!deferredEvt || supportHint; // 크롬/엣지: 이벤트 대기 중이거나 지원하면 노출
  }, [installed, isIOS, deferredEvt, supportHint]);

  const onClick = async () => {
    if (isIOS) {
      // iOS는 프로그래매틱 설치 불가 → 가이드 모달
      setShowGuide(true);
      return;
    }
    if (!deferredEvt) {
      // 아직 설치 가능 상태가 아니면 무시
      return;
    }
    try {
      await deferredEvt.prompt();
      const choice = await deferredEvt.userChoice;
      // 결과에 따라 후처리 가능(choice.outcome: 'accepted' | 'dismissed')
      if (choice.outcome === "accepted") {
        // 설치 수락
      }
      // 이벤트는 1회성
      setDeferredEvt(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!canShow) return null;

  return (
    <>
      <button
        onClick={onClick}
        className="bg-gradient-to-r from-[#c4c3c2] to-[#bcb6b3] text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold text-sm md:text-base
           hover:from-[#d6d6d6] hover:to-[#d1cbc5] transition-all duration-300 ease-in-out
           shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      >
        {isMobile ? "📥" : "앱 설치"}
      </button>

      {/* iOS 설치 가이드 모달 */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
              iOS에서 설치하는 방법
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-6">
              <li>Safari로 이 페이지를 여십시오.</li>
              <li>
                하단의 <strong>공유 버튼</strong>(네모 + 위 화살표)을
                누르십시오.
              </li>
              <li>
                <strong>“홈 화면에 추가”</strong>를 선택하십시오.
              </li>
              <li>
                이름을 확인하고 <strong>추가</strong>를 누르십시오.
              </li>
            </ol>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-lg border px-3 py-1.5 text-sm"
                aria-label="닫기"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
