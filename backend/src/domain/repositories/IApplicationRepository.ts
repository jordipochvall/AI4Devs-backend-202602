export interface ApplicationListItem {
  id: number;
  candidateId: number;
  positionId: number;
  applicationDate: Date;
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
  };
  currentInterviewStep: {
    id: number;
    name: string;
  };
  interviews: { score: number | null }[];
}

export interface ApplicationForStageUpdate {
  id: number;
  candidateId: number;
  positionId: number;
  currentInterviewStepId: number;
  position: {
    interviewFlowId: number;
  };
}

export interface IApplicationRepository {
  findByPositionPaginated(
    positionId: number,
    offset: number,
    limit: number,
  ): Promise<ApplicationListItem[]>;

  countByPosition(positionId: number): Promise<number>;

  findByIdAndCandidate(
    applicationId: number,
    candidateId: number,
  ): Promise<ApplicationForStageUpdate | null>;

  updateCurrentStep(applicationId: number, newStepId: number): Promise<void>;
}
