import React from 'react';
import { Team } from '../types';

type Props = {
  teams: Team[];
  currentTeam: number;
  teamColors: string[];
  teamTextColors: string[];
};

const TeamScoreBoard: React.FC<Props> = ({ teams, currentTeam, teamColors, teamTextColors }) => {
  // 並び順は初期順（props.teamsの順番）
  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <h2 className="text-xl font-bold mb-2">チームスコア</h2>
      <div className="grid grid-cols-4 gap-4 bg-white rounded shadow p-4">
        {teams.map((team, idx) => {
          const colorClass = teamColors[team.id] || 'bg-gray-200';
          const textColorClass = teamTextColors[team.id] || 'text-gray-900';
          const isActive = team.id === currentTeam;
          // 得点降順で順位を計算（同点は同順位）
          const sorted = [...teams].sort((a, b) => b.score - a.score);
          let rank = 1;
          for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].id === team.id) {
              // i番目が自分
              // 同点順位判定
              if (i === 0) {
                rank = 1;
              } else {
                // 直前と同点なら同順位、違えばi+1位
                rank = sorted[i].score === sorted[i - 1].score ? (sorted.findIndex((t) => t.score === sorted[i].score) + 1) : i + 1;
              }
              break;
            }
          }
          return (
            <div
              key={team.id}
              className={`flex flex-col items-center rounded p-2 ${colorClass} ${textColorClass} ${isActive ? 'ring-4 ring-pink-400 scale-105 font-bold shadow-lg' : ''} transition`}
            >
              <span className="font-semibold text-lg">{team.name}</span>
              <span className="font-bold text-xl">{team.score}点</span>
              <span className="text-xs text-gray-700 bg-white bg-opacity-50 rounded px-1 mt-1">{rank}位</span>
              {isActive && <span className="mt-1 text-xs font-bold text-pink-700">優先回答権</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamScoreBoard;
