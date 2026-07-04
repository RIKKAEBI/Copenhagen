"use client";

import { useEffect } from "react";

/** 本番ビルドでのみ Service Worker を登録する（開発時はキャッシュが邪魔になるため） */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // 登録失敗時も通常の Web ページとして動作する
    });
  }, []);

  return null;
}
