import React from 'react';
import { Panel, Team } from '../types';

type Props = {
  panels: Panel[];
  onSelectPanel: (panel: Panel) => void;
  teams: Team[];
  teamColors: string[];
  bingoInfo?: { teamId: number; lines: number[][] } | null;
  reachInfo?: { teamId: number; lines: number[][] }[] | undefined;
};

const PanelBoard: React.FC<Props> = ({ panels, onSelectPanel, teams, teamColors, bingoInfo, reachInfo }) => {
  // 5x5の行列に変換（1行5列、左から10,20,30,50,100）
  const rows = Array.from({ length: 5 }, (_, rowIdx) =>
    panels.slice(rowIdx * 5, rowIdx * 5 + 5)
  );

  // ビンゴラインの該当パネルIDセット
  const bingoIds = bingoInfo ? new Set(bingoInfo.lines.flat()) : new Set();
  // リーチラインの該当パネルIDセット（全チーム分）
  const reachIds = new Set<number>();
  if (reachInfo && Array.isArray(reachInfo)) {
    reachInfo.forEach(obj => obj.lines.forEach(line => line.forEach(id => reachIds.add(id))));
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <h2 className="text-xl font-bold mb-2">パネル</h2>
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-5 gap-2">
            {row.map((panel) => {
              // 強調クラス
              let highlight = '';
              if (bingoIds.has(panel.id)) {
                highlight = 'ring-4 ring-yellow-400 animate-bounce';
              } else if (reachIds.has(panel.id)) {
                highlight = 'reach-glow';
              }
              if (!panel.isAnswered) {
                // 列ごとのアルファベット
                const colAlphabet = String.fromCharCode('A'.charCodeAt(0) + row.indexOf(panel));
                return (
                  <button
                    key={panel.id}
                    className={`bg-blue-200 text-lg font-bold rounded p-4 hover:bg-blue-400 transition h-16 flex items-center justify-center ${highlight}`}
                    onClick={() => onSelectPanel(panel)}
                  >
                    {`${colAlphabet}-${panel.point}`}
                  </button>
                );
              }
              // 回答済み: 正解チーム名＋色
              const team = typeof panel.answeredTeamId === 'number' ? teams[panel.answeredTeamId] : null;
              const colorClass = typeof panel.answeredTeamId === 'number' ? teamColors[panel.answeredTeamId] : 'bg-gray-400';
              return (
                <div
                  key={panel.id}
                  className={`rounded p-4 h-16 flex items-center justify-center font-bold text-lg text-white cursor-not-allowed ${colorClass} ${highlight}`}
                >
                  {team ? team.name : '---'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelBoard;
