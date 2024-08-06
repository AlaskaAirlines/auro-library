import fs from 'fs';

function removeExport(path, type) {
  fs.readFile(path, type, (err, data) => {
    if (err) {
      throw err;
    };

    const exportPos = data.indexOf('export');
    const exampleScript = data.substring(0, exportPos);
    const writer = fs.createWriteStream(path);
    writer.write(exampleScript, (writeErr) => {
      if (writeErr) {
        throw writeErr;
      };

      writer.end();
    });
  });
}

removeExport('./demo/index.min.js', 'utf8');
removeExport('./demo/api.min.js', 'utf8');
