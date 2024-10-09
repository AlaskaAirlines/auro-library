import {beforeEach, describe, expect, assert, it} from "vitest";
import {generateReadmeUrl, templateFiller} from "../../generateDocs.mjs";


describe('generateReadmeUrl', () => {
  beforeEach(async () => {
    await templateFiller.extractNames();
  });

  it('should generate an _esm markdown url by default', () => {
    expect(generateReadmeUrl()).toEqual('https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/master/componentDocs/README_esm.md');
  });

  describe('when passing a specific readme version', () => {
    it('should generate a url path to the tag', () => {
      expect(generateReadmeUrl('v1.1.1')).toEqual('https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/refs/tags/v1.1.1/componentDocs/README_esm.md');
    });

    it('should still work when directly passing master', () => {
      expect(generateReadmeUrl('master')).toEqual('https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/master/componentDocs/README_esm.md');
    });
  });

  describe('when passing a specific variant string', () => {
    it('should add variant to README filename', () => {
      assert(generateReadmeUrl('master', '_some_variant').endsWith('README_some_variant.md'));
    });
  });
});
