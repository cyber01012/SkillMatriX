
export type SkillMap = Record<string, string[]>;

export type JobResponseDTO = {
  id?: string;
  url?: string;
  jobTitle: string;
  companyName?: string;
  companyLogo?: string;
  jobIndustry?: string;
  jobType?: string;
  jobGeo?: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate?: string;

  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;

  matchScore: number; // int
  matchedSkills?: string[];
  recommendationType: 'RECOMMENDED' | 'RELATED' | 'OTHER';
};

export type RecommendBundle = {
  recId: string;
  extractedSkills?: SkillMap;
  recommendedJobs: JobResponseDTO[];
  relatedJobs: JobResponseDTO[];
  otherJobs: JobResponseDTO[];
  error?: string;
};
