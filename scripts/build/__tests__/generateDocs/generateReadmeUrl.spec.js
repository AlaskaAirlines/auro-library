import {beforeEach, describe, expect, assert, it} from "vitest";
import {generateReadmeUrl, templateFiller} from "../../generateDocs.mjs";


describe('generateReadmeUrl', () => {
  beforeEach(async () => {
    await templateFiller.extractNames();
  });

  describe('when given no arguments', () => {
    it('should generate an _esm markdown url on the master branch', () => {
      expect(generateReadmeUrl()).toEqual('https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/master/componentDocs/README_esm.md');
    });
  });

  describe('when passing a specific readme version', () => {
    it('should generate a tag url when given a version tag', () => {
      expect(generateReadmeUrl('v1.1.1')).toEqual('https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/refs/tags/v1.1.1/componentDocs/README_esm.md');
    });

    it('should generate a branch url when given a branch name other than master', () => {
      expect(generateReadmeUrl('feature/branch')).toEqual('https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/refs/heads/feature/branch/componentDocs/README_esm.md');
    });

    it('should still work when directly passing master', () => {
      expect(generateReadmeUrl('master')).toEqual('https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/master/componentDocs/README_esm.md');
    });
  });

  describe('when passing a specific variant string', () => {
    it('should add variant to README filename', () => {
      assert(generateReadmeUrl('master', '_some_variant').endsWith('README_some_variant.md'));
    });

    it('should add variant to README filename when given a version tag', () => {
      assert(generateReadmeUrl('v1.1.1', '_some_variant').endsWith('README_some_variant.md'));
    });

    it('should add variant to README filename when given a branch name other than master', () => {
      assert(generateReadmeUrl('feature/branch', '_some_variant').endsWith('README_some_variant.md'));
    });
  });
});
