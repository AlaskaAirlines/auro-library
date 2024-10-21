import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuroTemplateFiller } from '../../auroTemplateFiller.mjs';
import fs from 'node:fs/promises';

vi.mock('node:fs/promises');

const handlebarsTemplate = `
# {{Name}} Documentation

## Installing {{ withAuroNamespace name}}
`;

const legacyTemplate = `
# [name] Documentation

## Installing [namespace]-[name]
`;

describe('AuroTemplateFiller', () => {

  /* @type {AuroTemplateFiller} */
  let filler = null;

  beforeEach(() => {
    filler = new AuroTemplateFiller();
  });

  it('should initialize values to null', () => {
    expect(filler.values).toBeNull();
  });

  it('should extract names from package.json', async () => {
    const mockPackageJson = JSON.stringify({
      name: '@aurodesignsystem/auro-button',
      version: '1.0.0',
      peerDependencies: {
        '@aurodesignsystem/design-tokens': '^2.0.0',
        '@aurodesignsystem/webcorestylesheets': '^3.0.0'
      }
    });

    fs.readFile.mockResolvedValue(mockPackageJson);

    await filler.extractNames();

    expect(filler.values).toEqual({
      npm: '@aurodesignsystem',
      namespace: 'auro',
      namespaceCap: 'Auro',
      name: 'button',
      nameCap: 'Button',
      version: '1.0.0',
      tokensVersion: '2.0.0',
      wcssVersion: '3.0.0'
    });
  });

  it('should replace template values correctly', async () => {
    filler.values = {
      name: 'button',
      nameCap: 'Button',
      namespace: 'auro',
      namespaceCap: 'Auro',
      version: '1.0.0',
      tokensVersion: '2.0.0',
      wcssVersion: '3.0.0'
    };

    const template = 'Component: {{Name}}, Version: {{Version}}';
    const result = filler.replaceTemplateValues(template);

    expect(result).toBe('Component: Button, Version: 1.0.0');
  });
});
