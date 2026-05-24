import db from './mock.db';

/** Dev-сборка использует пути /src/assets вместо /assets */
function withDevAssetPaths<T>(data: T): T {
  const json = JSON.stringify(data).replace(/\/assets\//g, '/src/assets/');
  return JSON.parse(json) as T;
}

export const devDB = withDevAssetPaths(db);
