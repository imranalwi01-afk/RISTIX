import { platformUsersAPI } from '@/services/api';

export interface PlatformUsersListParams {
  page: number;
  limit: number;
  search?: string;
}

export async function fetchPlatformUsers(params: PlatformUsersListParams) {
  return platformUsersAPI.getAll(params);
}

export async function createPlatformUser(input: Record<string, unknown>) {
  return platformUsersAPI.create(input);
}

export async function updatePlatformUser(id: string, input: Record<string, unknown>) {
  return platformUsersAPI.update(id, input);
}

export async function deletePlatformUser(id: string) {
  return platformUsersAPI.delete(id);
}
