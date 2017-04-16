// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';
import DayDream from './screens/DayDream';
import Results from './screens/Results';

export const screens = {
  DayDream,
  Results
};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
