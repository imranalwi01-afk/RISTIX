import { menuApi, type MenuConfigurationRequest } from '@/services/api/menu.api';

export async function fetchMenuConfigurations() {
  return menuApi.getMenuConfigurations();
}

export async function saveMenuConfiguration(input: MenuConfigurationRequest) {
  return menuApi.upsertMenuConfiguration(input);
}
