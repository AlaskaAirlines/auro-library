import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuroFileHandler } from '../../auroFileHandler.mjs';
import fs from 'node:fs/promises';
import { Logger } from '../../logger.mjs';

vi.mock('node:fs/promises');
vi.mock('../../../utils/logger.mjs');

describe('AuroFileHandler', () => {
  const filePath = 'test.txt';
  const fileContents = 'Hello, world!';
  const source = 'source.txt';
  const destination = 'destination.txt';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true if file exists', async () => {
    fs.access.mockResolvedValue();

    const result = await AuroFileHandler.exists(filePath);

    expect(result).toBe(true);
  });

  it('should return false if file does not exist', async () => {
    fs.access.mockRejectedValue(new Error('File not found'));

    const result = await AuroFileHandler.exists(filePath);

    expect(result).toBe(false);
  });

  it('should read file contents if file exists', async () => {
    fs.readFile.mockResolvedValue(fileContents);

    const result = await AuroFileHandler.tryReadFile(filePath);

    expect(result).toBe(fileContents);
  });

  it('should return null if file cannot be read', async () => {
    fs.readFile.mockRejectedValue(new Error('Read error'));

    const result = await AuroFileHandler.tryReadFile(filePath);

    expect(result).toBeNull();
    expect(Logger.error).toHaveBeenCalledWith(`Error reading file: ${filePath}, Read error`);
  });

  it('should write file contents successfully', async () => {
    fs.writeFile.mockResolvedValue();

    const result = await AuroFileHandler.tryWriteFile(filePath, fileContents);

    expect(result).toBe(true);
  });

  it('should return false if file cannot be written', async () => {
    fs.writeFile.mockRejectedValue(new Error('Write error'));

    const result = await AuroFileHandler.tryWriteFile(filePath, fileContents);

    expect(result).toBe(false);
    expect(Logger.error).toHaveBeenCalledWith(`Error writing file: ${filePath}, Write error`);
  });

  it('should copy file successfully', async () => {
    fs.copyFile.mockResolvedValue();

    const result = await AuroFileHandler.tryCopyFile(source, destination);

    expect(result).toBe(true);
  });

  it('should return false if file cannot be copied', async () => {
    fs.copyFile.mockRejectedValue(new Error('Copy error'));

    const result = await AuroFileHandler.tryCopyFile(source, destination);

    expect(result).toBe(false);
    expect(Logger.error).toHaveBeenCalledWith(`Error copying file: ${source}, Copy error`);
  });
});
