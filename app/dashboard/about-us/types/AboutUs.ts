export interface AboutUs {
  id: number;
  title: string;
  content: string;
  createdDate: string;
  modifiedDate: string;
}

export interface CreateAboutUsDto {
  title: string;
  content: string;
}

export interface UpdateAboutUsDto extends CreateAboutUsDto {
  id: number;
}
