import type { InvestorProfile } from '@/data/types';
import { PROFILES } from '@/lib/config';
import type { Weights } from '@/lib/weighting';

export interface SavedProfile {
  id: string;
  name: string;
  weights: Weights;
  /** Vorlage aus config/kpis.json: lässt sich übernehmen, aber nicht ändern. */
  builtIn: boolean;
}

export interface ProfileInput {
  name: string;
  weights: Weights;
}

const TEMPLATE_ORDER: InvestorProfile[] = ['ausgewogen', 'konservativ', 'renditeorientiert'];

export const TEMPLATES: SavedProfile[] = TEMPLATE_ORDER.map((id) => ({
  id,
  name: id[0].toUpperCase() + id.slice(1),
  weights: PROFILES[id],
  builtIn: true,
}));

/** Einziger Weg zu den eigenen Anlegerprofilen. Implementierungen: Supabase (Konto) und Local (Gastmodus). */
export interface ProfileStore {
  list(): Promise<SavedProfile[]>;
  create(input: ProfileInput): Promise<SavedProfile>;
  update(id: string, input: ProfileInput): Promise<void>;
  remove(id: string): Promise<void>;
}
