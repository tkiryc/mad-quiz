export type Team = {
  id: number;
  name: string;
  score: number;
};

export type Panel = {
  id: number;
  point: number;
  isAnswered: boolean;
  answeredTeamId?: number; // 正解したチームID（未回答ならundefined）
};

export type Quiz = {
  question: string;
  options: string[];
  answer: number; // 正解のインデックス
};
