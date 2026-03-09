export interface PrivacyPolicy {
  id: number;
  title: string;
  content: string;
  createdDate: string;
  modifiedDate: string;
}

export interface CreatePrivacyPolicyDto {
  title: string;
  content: string;
}

export interface UpdatePrivacyPolicyDto extends CreatePrivacyPolicyDto {
  id: number;
}
