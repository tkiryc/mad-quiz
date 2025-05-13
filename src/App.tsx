import React, { useState, useEffect, useCallback } from 'react';
import TeamScoreBoard from './components/TeamScoreBoard';
import PanelBoard from './components/PanelBoard';
import QuizModal from './components/QuizModal';
import { Team, Panel, Quiz } from './types';
import quizzes from './data/quizzes.json';

// チームごとの色（ユニークな色を割り当て）
const TEAM_COLORS = [
  'bg-red-300',    // チームA
  'bg-blue-300',   // チームB
  'bg-green-300',  // チームC
  'bg-yellow-300', // チームD
];
const TEAM_TEXT_COLORS = [
  'text-red-900',
  'text-blue-900',
  'text-green-900',
  'text-yellow-900',
];

const initialTeams: Team[] = [
  { id: 0, name: 'チームA', score: 0 },
  { id: 1, name: 'チームB', score: 0 },
  { id: 2, name: 'チームC', score: 0 },
  { id: 3, name: 'チームD', score: 0 },
];

// 行ごとに同じ点数（1行目10点×5、2行目20点×5...）
const panelPoints = [10, 20, 30, 50, 100];
const initialPanels: Panel[] = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  point: panelPoints[Math.floor(i / 5)],
  isAnswered: false,
  answeredTeamId: undefined,
}));

// クイズデータ（jsonから取得）
const quizzesData: Quiz[] = quizzes as Quiz[];

// クイズ配列をシャッフルする関数
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 永続化用キー
const STORAGE_KEY = 'mad-quiz-state-v1';


const App: React.FC = () => {
  // --- タイマー機能 ---
  const INITIAL_TIME = 5 * 60; // 5分（秒）
  const [timerSeconds, setTimerSeconds] = useState<number>(INITIAL_TIME);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // タイマー開始（動作中でも即リセットして再スタート）
  const handleTimerStart = () => {
    setTimerSeconds(INITIAL_TIME);
    setTimerRunning(false); // 一度止めてから再スタート
    setTimeout(() => setTimerRunning(true), 0);
  };

  // カウントダウン処理
  useEffect(() => {
    if (!timerRunning) return;
    if (timerSeconds === 0) {
      setTimerRunning(false);
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds(sec => (sec > 0 ? sec - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // 永続化
  const loadState = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  const saveState = useCallback((state: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  // クイズ割り当てをリセットする関数
  const resetPanelQuizzes = () => shuffle(quizzesData).slice(0, 25);

  // 初期化
  const [teams, setTeams] = useState<Team[]>(() => loadState()?.teams || initialTeams);
  const [panels, setPanels] = useState<Panel[]>(() => loadState()?.panels || initialPanels);
  const [currentTeam, setCurrentTeam] = useState<number>(() => loadState()?.currentTeam || 0);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  // クイズ配列（各パネルに割り当てたもの）
  const [panelQuizzes, setPanelQuizzes] = useState<Quiz[]>(() => loadState()?.panelQuizzes || shuffle(quizzesData).slice(0, 25));
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isGameEnd, setIsGameEnd] = useState<boolean>(() => loadState()?.isGameEnd || false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean|null>(null);
  // ビンゴ・リーチ演出用
  const [bingoInfo, setBingoInfo] = useState<{teamId: number, lines: number[][]} | null>(null);
  // ビンゴ成立済みフラグ
  const [isBingoed, setIsBingoed] = useState<boolean>(false);
  const [reachInfo, setReachInfo] = useState<{teamId: number, lines: number[][]} | null>(null);
  // リーチ演出済みフラグ
  const [reachShown, setReachShown] = useState<boolean>(false);
  // ゲーム終了モーダル表示状態
  const [showGameEndModal, setShowGameEndModal] = useState<boolean>(false);

  // 5x5のラインリスト（縦・横・斜め）
  const bingoLines = [
    // 横
    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
    // 縦
    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
    // 斜め
    [0,6,12,18,24], [4,8,12,16,20],
  ];

  // チームごとのビンゴ・リーチ判定
  function checkBingoAndReach(panels: Panel[], teamId: number): {bingoLines: number[][], reachLines: number[][]} {
    const answered = panels.filter(p => p.answeredTeamId === teamId).map(p => p.id);
    const bingo: number[][] = [];
    const reach: number[][] = [];
    for (const line of bingoLines) {
      const count = line.filter(idx => answered.includes(idx)).length;
      if (count === 5) bingo.push(line);
      else if (count === 4) reach.push(line);
    }
    return { bingoLines: bingo, reachLines: reach };
  }


  // 正解・不正解モーダル自動非表示
  useEffect(() => {
    if (lastAnswerCorrect !== null) {
      const timer = setTimeout(() => {
        setLastAnswerCorrect(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lastAnswerCorrect]);

  // 状態の永続化
  useEffect(() => {
    saveState({ teams, panels, currentTeam, isGameEnd });
  }, [teams, panels, currentTeam, isGameEnd, saveState]);

  // リセット
  const handleReset = () => {
    setTeams(initialTeams);
    setPanels(initialPanels);
    setCurrentTeam(0);
    setIsGameEnd(false);
    setShowGameEndModal(false);
    setShowQuiz(false);
    setSelectedPanel(null);
    setLastAnswerCorrect(null);
    setReachShown(false);
    setIsBingoed(false);
    setPanelQuizzes(resetPanelQuizzes());
    localStorage.removeItem(STORAGE_KEY);
  };

  // パネル選択時
  const handleSelectPanel = (panel: Panel) => {
    if (isGameEnd || panel.isAnswered) return;
    setSelectedPanel(panel);
    setQuiz(panelQuizzes[panel.id]);
    setShowQuiz(true);
    setLastAnswerCorrect(null);
  };

  // 回答時
  const handleSelectAnswer = (idx: number) => {
    if (!selectedPanel) return;
    const isCorrect = idx === quiz?.answer;
    setLastAnswerCorrect(isCorrect);
    // 正解なら得点加算
    if (isCorrect) {
      setTeams((prev) =>
        prev.map((t, i) =>
          i === currentTeam ? { ...t, score: t.score + selectedPanel.point } : t
        ),
      );
    }
    // 正解ならパネルをクローズ、不正解なら未回答に戻す
    setPanels((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPanel.id) return p;
        if (isCorrect) {
          return { ...p, isAnswered: true, answeredTeamId: currentTeam };
        } else {
          return { ...p, isAnswered: false, answeredTeamId: undefined };
        }
      }),
    );
    // ビンゴ・リーチ判定（全チーム）
    setTimeout(() => {
      let bingoFound = false;
      let bingoTeam: number | null = null;
      let bingoLines: number[][] = [];
      let reachTeam: number | null = null;
      let reachLines: number[][] = [];
      for (const team of teams) {
        const { bingoLines: bLines, reachLines: rLines } = checkBingoAndReach(
          // 回答直後の最新状態で判定
          panels.map((p) =>
            p.id === selectedPanel.id
              ? (isCorrect ? { ...p, isAnswered: true, answeredTeamId: currentTeam } : { ...p, isAnswered: false, answeredTeamId: undefined })
              : p
          ),
          team.id
        );
        if (!bingoFound && bLines.length > 0) {
          bingoFound = true;
          bingoTeam = team.id;
          bingoLines = bLines;
        }
        if (!bingoFound && rLines.length > 0) {
          reachTeam = team.id;
          reachLines = rLines;
        }
      }
      if (bingoFound) {
        setBingoInfo({ teamId: bingoTeam, lines: bingoLines });
        setIsBingoed(true);
        setIsGameEnd(true);
        setShowGameEndModal(false); // ビンゴ勝利時は通常終了モーダルは出さない
        setShowQuiz(false);
        setSelectedPanel(null);
        return;
      } else if (reachTeam !== null && !reachShown) {
        setReachInfo({ teamId: reachTeam, lines: reachLines });
        setReachShown(true);
        setTimeout(() => setReachInfo(null), 1500);
      }
      const allAnswered = panels.filter((p) => p.id !== selectedPanel.id && p.isAnswered).length === 24;
      if (allAnswered) {
        setIsGameEnd(true);
        setShowGameEndModal(true);
        setShowQuiz(false);
        setSelectedPanel(null);
        return;
      }
      setCurrentTeam((prev) => (prev + 1) % teams.length);
      setShowQuiz(false);
      setSelectedPanel(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      {/* ヘッダー */}
      <header className="w-full flex items-center justify-center bg-gradient-to-r from-pink-300 to-blue-300 py-4 mb-6 relative">
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-pink-600 rounded px-3 py-1 shadow font-bold border hover:bg-pink-50"
          onClick={handleReset}
        >
          リセット
        </button>
        <h1 className="text-3xl font-bold tracking-wider drop-shadow-lg text-white">Quiz & Bingo</h1>
        {/* タイマー（右上） */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-2xl font-mono bg-white bg-opacity-80 rounded px-3 py-1 shadow text-blue-700 border border-blue-200 min-w-[90px] text-center select-none">
            {`${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`}
          </span>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded shadow border border-blue-700 transition"
            onClick={handleTimerStart}
          >
            スタート
          </button>
        </div>
      </header>
      <TeamScoreBoard
        teams={teams}
        currentTeam={currentTeam}
        teamColors={TEAM_COLORS}
        teamTextColors={TEAM_TEXT_COLORS}
      />
      <PanelBoard
        panels={panels}
        onSelectPanel={handleSelectPanel}
        teams={teams}
        teamColors={TEAM_COLORS}
        bingoInfo={bingoInfo ?? undefined}
        reachInfo={isBingoed ? undefined : (() => {
          // 各チームの「他チームが埋めていない」リーチラインのみ抽出
          let allLines: { teamId: number; lines: number[][] }[] = [];
          teams.forEach(team => {
            const { reachLines } = checkBingoAndReach(panels, team.id);
            // 他チームが正解していないリーチラインのみ
            const validReachLines = reachLines.filter(line =>
              line.every(idx =>
                panels[idx].answeredTeamId === undefined || panels[idx].answeredTeamId === team.id
              )
            );
            if (validReachLines.length > 0) {
              allLines.push({ teamId: team.id, lines: validReachLines });
            }
          });
          return allLines.length > 0 ? allLines : undefined;
        })()}
      />
      {/* ビンゴ演出 */}
      {bingoInfo && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 animate-fade-in"
          onClick={() => setBingoInfo(null)}
        >
          <div
            className="relative bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 rounded-3xl shadow-2xl px-14 py-12 flex flex-col items-center border-0 animate-pop"
            onClick={e => e.stopPropagation()}
            style={{ minWidth: 360 }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl drop-shadow animate-bounce-slow">🎊</div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl opacity-80 animate-bounce-slow2">✨</div>
            <div className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 drop-shadow animate-glow">
              BINGO!
            </div>
            <div className="text-lg font-bold mt-2 drop-shadow animate-fade-in" style={{ color: TEAM_COLORS[bingoInfo.teamId] }}>
              「{teams[bingoInfo.teamId].name}」の勝利！
            </div>
            <div className="text-lg font-bold mt-2 drop-shadow animate-fade-in text-gray-700">おめでとうございます！</div>
          </div>
        </div>
      )}
      {/* リーチ演出 */}
      {reachInfo && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-blue-400 flex flex-col items-center animate-pulse">
            <div className="text-3xl font-bold text-blue-500 mb-2">リーチ！</div>
            <div className="text-lg font-bold" style={{ color: TEAM_COLORS[reachInfo.teamId] }}>「{teams[reachInfo.teamId].name}」があと1マス！</div>
          </div>
        </div>
      )}
      {isGameEnd && !bingoInfo && showGameEndModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-40"
          onClick={() => setShowGameEndModal(false)}
        >
          <div
            className="bg-gradient-to-br from-pink-200 via-blue-100 to-yellow-100 rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">🎉</div>
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 mb-2 drop-shadow">ゲーム終了！</div>
            <div className="text-lg text-gray-700 mt-2">お疲れ様でした！</div>
          </div>
        </div>
      )}
      {showQuiz && selectedPanel && quiz && (
        <QuizModal
          quiz={quiz}
          onSelectAnswer={handleSelectAnswer}
          onClose={() => setShowQuiz(false)}
        />
      )}
      {/* 正解・不正解のポップアップモーダル */}
      {lastAnswerCorrect !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg shadow-lg p-8 min-w-[220px] min-h-[100px] flex flex-col items-center justify-center border-2 ${lastAnswerCorrect ? 'border-green-500' : 'border-red-500'}`}
            style={{ fontSize: '2rem', fontWeight: 'bold', color: lastAnswerCorrect ? '#22c55e' : '#ef4444' }}>
            {lastAnswerCorrect ? '正解！' : '不正解'}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
