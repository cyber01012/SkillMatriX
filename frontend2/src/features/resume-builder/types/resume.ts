
export type Skill = {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
  category?: 'Hard' | 'Soft';
};

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string; // yyyy-mm
  endDate?: string;
  bullets: string[];
};

export type EducationItem = {
  id: string;
  institution: string;
  degree?: string;
  field?: string;
  location?: string;
  startDate?: string; // yyyy-mm
  endDate?: string;
  description?: string;
};

export type PersonalInfo = {
  fullName: string;
  title?: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;

  /** Optional photo as a Data URL or remote URL */
  photo?: string;

  /** Optional: where the photo should appear in header */
  photoPosition?: 'right' | 'left'; // default: 'right'
}


export type Resume = {
  personal: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: Skill[];
};

export const emptyResume: Resume = {
  personal: { fullName: '', email: '' },
  experience: [],
  education: [],
  skills: [],
};
