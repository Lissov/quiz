const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

module.exports.registerPartials = function(directory) {
  fs.readdirSync(directory).forEach(file => {
    if (file.endsWith(".hbs")) {
      const partialName = path.parse(file).name; // Get the name without extension
      const partialContent = fs.readFileSync(path.join(directory, file), "utf8");
      Handlebars.registerPartial(partialName, partialContent);
      console.log('Partial registered: ' + partialName);
    }
  });
}

function getTemplatesItnernal(directory) {
  let files = [];
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getTemplatesItnernal(fullPath)); // Recursively get files
    } else if (file.endsWith(".hbs")) {
      files.push(fullPath);
    }
  });
  return files;
}

module.exports.getTemplates = getTemplatesItnernal;

module.exports.getData = function(templatePath) {
  const dataFileName = templatePath.replace(/\.hbs$/, ".json");
  if (!fs.existsSync(dataFileName))
    return null;
  const content = fs.readFileSync(dataFileName, "utf8");
  return JSON.parse(content);
}

module.exports.clean = function(directory) {
  const noDeleteFile = '../.no_delete';
  let noDeleteList = new Set();
  if (!fs.existsSync(noDeleteFile))
    throw Error(`No [${noDeleteFile}] found, likely executed from the wrong folder`);

  const fileContent = fs.readFileSync(noDeleteFile, 'utf8');
  noDeleteList = new Set(fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line));

  // Get all files and folders in the current directory
  fs.readdirSync(directory).forEach(item => {
    const fullPath = path.join(directory, item);

    // Skip items that should not be deleted
    if (item.startsWith('.') || noDeleteList.has(item)) {
        console.log(`Skipping: ${item}`);
        return;
    }

    try {
        // Check if item is a directory
        if (fs.lstatSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`Deleted folder: ${item}`);
        } else {
            fs.unlinkSync(fullPath);
            console.log(`Deleted file: ${item}`);
        }
    } catch (error) {
        console.error(`Error deleting ${item}:`, error);
    }
  });
}

module.exports.generate = function(template, data, outputDir, relativePath, lang) {
    data.lang = lang; // switch language
    data.language = lang; // switch language
    data.context.root = lang === 'de' ? data.context.rootDe : (data.context.rootDe + "..\\");

    // Generate HTML
    const outputHtml = template(data);
    const outDir = lang === 'de' ? outputDir : path.join(outputDir, lang);
    const outputFilePath = path.join(outDir, relativePath);
  
    // Ensure subdirectories exist in outputs
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  
    fs.writeFileSync(outputFilePath, outputHtml);

    console.log(`Generated: ${outputFilePath}`);  
}

module.exports.buildTemplate = function(template, data, outputDir, relativePath, lang) {
    data.lang = lang; // switch language
    data.context.root = lang === 'de' ? data.context.rootDe : (data.context.rootDe + "..\\");

    // Generate HTML
    const outputHtml = template(data);
    const outDir = lang === 'de' ? outputDir : path.join(outputDir, lang);
    const outputFilePath = path.join(outDir, relativePath);
  
    // Ensure subdirectories exist in outputs
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  
    fs.writeFileSync(outputFilePath, outputHtml);

    console.log(`Generated: ${outputFilePath}`);  
}
