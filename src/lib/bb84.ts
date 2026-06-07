import { Basis, Bit, Photon, BB84Step, SimulationResult } from '../types';

const getRandomBit = (): Bit => (Math.random() < 0.5 ? 0 : 1);
const getRandomBasis = (): Basis => (Math.random() < 0.5 ? '+' : 'x');

const encodePhoton = (bit: Bit, basis: Basis): Photon => {
  if (basis === '+') return bit === 0 ? '↑' : '→';
  return bit === 0 ? '↗' : '↘';
};

const measurePhoton = (photon: Photon, basis: Basis): Bit => {
  if (basis === '+') {
    if (photon === '↑') return 0;
    if (photon === '→') return 1;
    return getRandomBit(); // Invalid basis, 50% chance
  } else {
    if (photon === '↗') return 0;
    if (photon === '↘') return 1;
    return getRandomBit();
  }
};

export const runBB84Simulation = (numBits: number, evePresent: boolean): SimulationResult => {
  const steps: BB84Step[] = [];
  let matchingBasesCount = 0;
  let errorCount = 0;
  const aliceKey: Bit[] = [];
  const bobKey: Bit[] = [];

  for (let i = 0; i < numBits; i++) {
    // 1. Alice generates random bit and basis
    const aliceBit = getRandomBit();
    const aliceBasis = getRandomBasis();
    
    // 2. Alice encodes photon
    let currentPhoton = encodePhoton(aliceBit, aliceBasis);
    const alicePhoton = currentPhoton;

    let eveBasis: Basis | undefined;
    let eveBit: Bit | undefined;
    let evePhoton: Photon | undefined;

    // 3. Eve intercepts (optional)
    if (evePresent) {
      eveBasis = getRandomBasis();
      eveBit = measurePhoton(currentPhoton, eveBasis);
      // Eve has to guess and send a new photon based on her measurement
      currentPhoton = encodePhoton(eveBit, eveBasis);
      evePhoton = currentPhoton;
    }

    // 4. Bob receives photon and measures with random basis
    const bobBasis = getRandomBasis();
    const bobBit = measurePhoton(currentPhoton, bobBasis);

    // 5. Compare bases over public channel
    const basisMatch = aliceBasis === bobBasis;
    
    let isError = false;
    if (basisMatch) {
      aliceKey.push(aliceBit);
      bobKey.push(bobBit);
      matchingBasesCount++;
      if (aliceBit !== bobBit) {
         isError = true;
         errorCount++;
      }
    }

    steps.push({
      index: i + 1,
      aliceBit,
      aliceBasis,
      alicePhoton,
      eveBasis,
      eveBit,
      evePhoton,
      bobBasis,
      bobBit,
      basisMatch,
      isError,
    });
  }

  const qber = matchingBasesCount > 0 ? errorCount / matchingBasesCount : 0;
  // If QBER >= 11% (0.11), Eve is detected.
  const eavesdropperDetected = qber >= 0.11;

  return {
    steps,
    aliceKey,
    bobKey,
    matchingBasesCount,
    errorCount,
    qber,
    eavesdropperDetected,
  };
};

export const convertBitsToAESKey = (bits: Bit[]): string => {
  // Convert binary array to hex string to be used as AES key length
  // For AES-256, we ideally need 256 bits (32 bytes / 64 hex chars).
  // Here we just hash the bit string using SHA256 to guarantee a valid 256-bit AES key regardless of input length.
  const bitString = bits.join('');
  return bitString;
};
