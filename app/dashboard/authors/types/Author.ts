export interface Author {
  id: number;
  fullName: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
}

export interface CreateAuthorDto {
  fullName: string;
  bio?: string;
  profilePicture?: File;
}

export interface UpdateAuthorDto {
  fullName?: string;
  bio?: string;
  profilePicture?: File;
}
