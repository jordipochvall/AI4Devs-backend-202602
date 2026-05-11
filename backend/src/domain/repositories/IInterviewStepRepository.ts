export interface InterviewStepRef {
  id: number;
  name: string;
  interviewFlowId: number;
}

export interface IInterviewStepRepository {
  findById(stepId: number): Promise<InterviewStepRef | null>;
}
