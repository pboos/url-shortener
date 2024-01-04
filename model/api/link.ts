import type { LinkPublic } from "~/model/api/linkPublic";

export interface Link extends LinkPublic {
  id: number;
  userId: number;
  totalVisits: number;
  createdAt: string;
}
