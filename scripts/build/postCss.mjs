import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import comments from 'postcss-discard-comments';
import path from 'path';
import fs from 'fs/promises';

const __dirname = new URL('.', import.meta.url).pathname;
const directories = [
  path.join(__dirname, '../src'),
  path.join(__dirname, '../components')
];

/**
 * Recursively process CSS files in a directory and its subdirectories
 * @param {string} dir - Directory to process
 */
async function processCssFiles(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await processCssFiles(fullPath);
      } else if (path.extname(file.name).toLowerCase() === '.css') {
        await processPostCss(fullPath);
      }
    }
  } catch (err) {
    console.error(`Processing failed for directory ${dir}:`, err);
  }
}

/**
 * Process CSS file with PostCSS
 * Applies autoprefixer and removes comments starting with '@'
 * @param {string} filePath - Full path of CSS file to process
 */
async function processPostCss(filePath) {
  try {
    const css = await fs.readFile(filePath, 'utf8');
    const result = await postcss([
      autoprefixer,
      comments({
        remove: comment => comment[0] === '@'
      })
    ]).process(css, { from: filePath, to: filePath });
    await fs.writeFile(filePath, result.css);
    console.log(`Processed: ${filePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

// Main execution
(async () => {
  for (const dir of directories) {
    try {
      await fs.access(dir);
      console.log(`Processing CSS files in: ${dir}`);
      await processCssFiles(dir);
    } catch (error) {
      console.log(`Directory not found or not accessible: ${dir}`);
    }
  }
})();