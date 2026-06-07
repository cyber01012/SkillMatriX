
type RoadmapNode = {
  id?: number;
  skillName: string;
  status: 'STRONG' | 'WEAK' | 'MISSING' | 'MILESTONE' | string;
  guidance?: string | null;
  resources?: string | null;
  strategicAction?: string | null;
  stepOrder?: number;
};

type RoadmapLatestResponse = {
  id?: number;
  role?: string;
  createdAt?: string;
  roadmap?: RoadmapNode[]; // when /latest returns { roadmap: [...] }
  nodes?: RoadmapNode[];   // (just in case you ever return nodes under a different key)
  error?: string;
};
