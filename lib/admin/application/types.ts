export type Roles = { roles: string[] };

export interface StudentApplicantListingFilterOptions {
  pageSize: string;
  search: string;
  categoryId: string;
  currentPage: number;
  state: string;
}


export interface ServiceProviderApplicantListingFilterOptions {
  pageSize: string;
  search: string;
  category: string;
  currentPage: number;
  state: string;
  discipline: string;
}

export interface AdminListingFilterOptions {
  discipline: string;
  search: string;
  pageSize: string;
  currentPage: number;
}