export type Basis = '+' | 'x';
export type Bit = 0 | 1;
export type Photon = '↑' | '→' | '↗' | '↘';

export interface BB84Step {
  index: number;
  aliceBit: Bit;
  aliceBasis: Basis;
  alicePhoton: Photon;
  eveBasis?: Basis;
  eveBit?: Bit;
  evePhoton?: Photon;
  bobBasis: Basis;
  bobBit: Bit;
  basisMatch: boolean;
  isError: boolean; // True if basis matched but bits are different (caused by Eve)
}

export interface SimulationResult {
  steps: BB84Step[];
  aliceKey: Bit[];
  bobKey: Bit[];
  matchingBasesCount: number;
  errorCount: number;
  qber: number; // Quantum Bit Error Rate
  eavesdropperDetected: boolean;
}
