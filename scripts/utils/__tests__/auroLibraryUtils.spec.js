import { describe, it, expect, vi } from 'vitest';
import AuroLibraryUtils from '../auroLibraryUtils.mjs';

describe('AuroLibraryUtils', () => {
  describe('projectRootFromBuildScriptDir', () => {
    it('should return the current directory if node_modules is not in the path', () => {
      const utils = new AuroLibraryUtils();
      const mockDirname = '/user/project/scripts/utils';
      vi.spyOn(utils, 'getDirname').mockReturnValue(mockDirname);

      const result = utils.projectRootFromBuildScriptDir;
      expect(result).toBe(mockDirname);
    });

    it('should return the project root directory if node_modules is in the path', () => {
      const utils = new AuroLibraryUtils();
      const mockDirname = '/user/project/node_modules/some-package';
      vi.spyOn(utils, 'getDirname').mockReturnValue(mockDirname);

      const result = utils.projectRootFromBuildScriptDir;
      expect(result).toBe('/user/project/');
    });
  });
});
