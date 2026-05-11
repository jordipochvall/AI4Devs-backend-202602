export interface CandidateRef {
  id: number;
}

export interface ICandidateRepository {
  exists(candidateId: number): Promise<boolean>;
}
