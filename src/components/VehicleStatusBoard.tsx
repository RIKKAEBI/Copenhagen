"use client";

import { useEffect, useState } from "react";
import { CAR_LIST } from "@/lib/cars";
import { isAllDay, type Reservation } from "@/lib/types";
import { fmtJst } from "@/lib/datetime";
import { Car, MapPin } from "lucide-react";

/** 既定の所在地（予約履歴が無い場合） */
const DEFAULT_LOCATION = "本社 第1駐車場";

function fmt(iso: string): string {
  return fmtJst(iso, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function dateOnly(iso: string): string {
  return fmtJst(iso, { month: "2-digit", day: "2-digit" });
}

type CarStatus = {
  /** 現在使用中の予約 */
  current: Reservation | null;
  /** 次に始まる予約 */
  next: Reservation | null;
  /** 待機中の推定所在地（直近に返却された場所） */
  idleLocation: string;
};

/** 車両の現在状態（所在地 / 使用中）と次の予約を車ごとに1行（モバイルは2行）で表示する */
export function VehicleStatusBoard({
  reservations,
  onCancel,
}: {
  reservations: Reservation[];
  onCancel: (id: number) => void;
}) {
  // 現在時刻依存なのでマウント後に算出（ハイドレーション不一致防止）
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  function statusOf(carId: string, ts: number): CarStatus {
    const list = reservations.filter((r) => r.carId === carId);
    const current =
      list.find((r) => new Date(r.startAt).getTime() <= ts && ts < new Date(r.endAt).getTime()) ?? null;
    const next =
      list
        .filter((r) => new Date(r.startAt).getTime() > ts)
        .sort((a, b) => a.startAt.localeCompare(b.startAt))[0] ?? null;
    const past = list
      .filter((r) => new Date(r.endAt).getTime() <= ts)
      .sort((a, b) => b.endAt.localeCompare(a.endAt));
    return { current, next, idleLocation: past[0]?.returnLocation ?? DEFAULT_LOCATION };
  }

  const activeCount =
    now === null ? null : reservations.filter((r) => new Date(r.endAt).getTime() >= now).length;

  const cancelButton = (id: number) => (
    <button
      type="button"
      onClick={() => onCancel(id)}
      className="shrink-0 rounded border border-black/15 px-2 py-0.5 text-[11px] text-black/50 transition-colors hover:border-red-400/50 hover:text-red-600"
    >
      取消
    </button>
  );

  return (
    <div className="hud-frame p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.3em] text-black/40">VEHICLE STATUS</div>
        <div className="font-mono text-[10px] text-black/40">
          {activeCount === null ? "…" : `${activeCount} ACTIVE`}
        </div>
      </div>

      <ul className="space-y-1.5">
        {CAR_LIST.map((car) => {
          const st = now === null ? null : statusOf(car.id, now);
          const inUse = !!st?.current;
          return (
            <li
              key={car.id}
              className="border-l-2 bg-black/[0.03] px-2.5 py-1.5"
              style={{ borderColor: car.accent }}
            >
              {/* モバイル: 2行（現在状態 / 次の予約）、sm 以上: 1行 */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                {/* 現在状態 */}
                <div className="flex min-w-0 items-center gap-2 sm:flex-1">
                  <span className="w-12 shrink-0 text-sm font-bold" style={{ color: car.accent }}>
                    {car.name}
                  </span>
                  <span
                    className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] tracking-widest"
                    style={{
                      color: inUse ? "#b45309" : car.accent,
                      background: inUse ? "#f59e0b22" : `${car.accent}22`,
                    }}
                  >
                    {st === null ? "…" : inUse ? "IN USE" : "READY"}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-1 truncate text-[12px] text-black/75">
                    {st === null ? (
                      <span className="text-black/35">読み込み中...</span>
                    ) : st.current ? (
                      <>
                        <Car size={14} className="shrink-0 text-black/45" />
                        <span className="truncate">
                          使用中（{st.current.userName} さん）
                          <span className="text-black/45">
                            {" "}
                            ・ 返却 {fmt(st.current.endAt)} ・ {st.current.returnLocation}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin size={14} className="shrink-0 text-black/40" />
                        <span className="truncate">{st.idleLocation}</span>
                      </>
                    )}
                  </span>
                  {st?.current && cancelButton(st.current.id)}
                </div>

                {/* 次の予約 */}
                <div className="flex min-w-0 items-center gap-2 pl-14 sm:flex-1 sm:border-l sm:border-black/10 sm:pl-3">
                  <span className="shrink-0 font-mono text-[10px] tracking-widest text-black/40">NEXT</span>
                  {st === null ? (
                    <span className="flex-1 text-[12px] text-black/35">…</span>
                  ) : st.next ? (
                    <>
                      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-black/75">
                        {isAllDay(st.next) ? (
                          <>{dateOnly(st.next.startAt)} 終日</>
                        ) : (
                          <>
                            {fmt(st.next.startAt)} <span className="text-black/35">→</span> {fmt(st.next.endAt)}
                          </>
                        )}
                        <span className="text-black/45"> ・ {st.next.userName} ・ {st.next.returnLocation}</span>
                      </span>
                      {cancelButton(st.next.id)}
                    </>
                  ) : (
                    <span className="flex-1 text-[12px] text-black/40">予約なし</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
