export interface PositionRef {
  id: number;
  interviewFlowId: number;
}

export interface IPositionRepository {
  findById(positionId: number): Promise<PositionRef | null>;
}
