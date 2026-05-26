export interface League {
  id: string; // UUID
  name: string;
  ownerId: string; // user id of creator
  memberIds: string[]; // list of user ids
  inviteCode: string; // short code for joining
  createdAt: string; // ISO timestamp
  password?: string; // optional password for private leagues
}
