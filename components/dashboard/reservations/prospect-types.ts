export type ProspectRow = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  courseSlug: string;
  courseLabel: string;
  status: "ACTIVE" | "CONVERTED" | "PAID_TRIAL";
  convertedMemberId?: string | null;
};

export type ProspectConversionContext = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  courseLabel: string;
};
