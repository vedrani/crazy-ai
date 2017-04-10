// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';
import DayDream from './screens/DayDream';

export const screens = {
  DayDream
};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
