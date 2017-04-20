// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';
import ClassifierScreen from './screens/ClassifierScreen';
import ResultsScreen from './screens/ResultsScreen';

export const screens = {
  ClassifierScreen,
  ResultsScreen,
};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
