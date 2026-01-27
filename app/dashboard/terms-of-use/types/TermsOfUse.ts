export interface TermsOfUse {
  id: number;
  title: string;
  content: string;
  createdDate: string;
  modifiedDate: string;
}

export interface CreateTermsOfUseDto {
  title: string;
  content: string;
}

export interface UpdateTermsOfUseDto extends CreateTermsOfUseDto {
  id: number;
}
