export type AdminCoach = {
  id: string;
  imageUrl: string | null;
  firstName: string;
  lastName: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CoachFilters = {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
};
