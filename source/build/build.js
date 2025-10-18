//npm install handlebars

const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const helpers = require("./js/handlebars.js");
const { registerPartials, getTemplates, getData, clean, generate } = require("./js/templating.js");
const { getRelativePathBack } = require("./js/helpers.js");
helpers.registerHelpers();

const templatesDir = path.join("..", "templates");
const partialsDir = path.join("..", "partials");
const outputDir = path.join("..", "..");

registerPartials(partialsDir);

clean(outputDir);

//const templates = getTemplates(templatesDir);

const generateFile = (templateName, postfix, templateData) => {
  const templatePath = path.join(templatesDir, templateName);
  const templateSource = fs.readFileSync(templatePath, "utf8");
  const relativePath = path.relative(templatesDir, templatePath).replace(/\.hbs$/, postfix + ".html");
  var fileName = relativePath.replace(/^.*[\\/]/, '');
  const pathEscaped = relativePath.replaceAll("/", "\\");
  const template = Handlebars.compile(templateSource);
  const data = {
    context: {
      fileName: fileName,
      relativePathDe: pathEscaped,
      rootDe: getRelativePathBack(pathEscaped),
    },
    global: global,
    data: templateData
  };
  data.labels = global.labels.en;
  generate(template, data, outputDir, relativePath, 'en');
  if (templateData && templateData.uk) {
    data.data.quizName = templateData.quizNameUk;
    data.data.question = templateData.uk.question;
    data.data.answers = templateData.uk.answers;
  }
  data.labels = global.labels.uk;
  generate(template, data, outputDir, relativePath, 'uk');
}

const global = getData(path.join("..", "global.json"));
generateFile("index.hbs", "", null);
for (const quiz of global.quizes) {
  console.log('Processing quiz: ' + quiz.id);
  generateFile("quiz.hbs", "_" + quiz.id, quiz);
  for (const question of quiz.questions) {
    console.log('  Processing question');
    question.quizName = quiz.name;
    question.quizNameUk = quiz.nameUk;
    question.quizId = quiz.id;
    generateFile("q.hbs", "_" + quiz.id + "_" + question.index, question);
  }
}
