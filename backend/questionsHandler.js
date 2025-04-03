const fs = require('fs');
const path = require('path');

function loadQuestions(testNumber) {
    const questionsFile = path.join(__dirname, 'questions',`test${testNumber}.txt`);

    try {
        if (fs.existsSync(questionsFile)) {
            const data = fs.readFileSync(questionsFile, 'utf-8');
            return data.split('\n').map(q => q.trim()).filter(q => q !== '');
        } else {
            console.error(`🚨 File not found: ${questionsFile}`);
            return [];
        }
    } catch (err) {
        console.error(`❌ Error reading test${testNumber} questions file:`, err);
        return [];
    }
}

function getQuestion(testNumber, index) {
    const questions = loadQuestions(testNumber);

    if (index >= questions.length) {
        return { question: "Finish", isLast: true };
    }

    return { question: questions[index], isLast: index === questions.length - 1 };
}

module.exports = { loadQuestions, getQuestion };
