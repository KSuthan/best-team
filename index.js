const inquirer = require("inquirer");
const fs = require("fs");
const util = require('util');

// callback function to return responses
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// importing modules
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const Manager = require("./lib/Manager");


// employee questions
const questions = {
    type: function() {
        return {
            message: "Which type of team member would you like to add?",
            type: "list",
            name: "member",
            choices: ["Engineer", "Intern", "I am done"]
        }
    },
    item: function(member, variable, item = variable, validate) {
        return {
            message: `What is your ${member.toLowerCase()}'s ${item}?`,
            type: "input",
            name: variable,
            validate: validate
        }
    }
};

let employees = [];

async function addRole(member) {
    let { name } = await inquirer.prompt(questions.item(member, "name", "full name"));
    let { id } = await inquirer.prompt(questions.item(member, "id", "ID number"));
    let { email } = await inquirer.prompt(questions.item(member, "email", "email address"));
    switch (member) {
        case "Manager":
            let { officeNumber } = await inquirer.prompt(questions.item(member, "officeNumber", "office phone number"));
            employees.push(new Manager(name, id, email, officeNumber));
            break;
        case "Engineer":
            let { github } = await inquirer.prompt(questions.item(member, "github", "GitHub username"));
            employees.push(new Engineer(name, id, email, github));
            break;
        case "Intern":
            let { school } = await inquirer.prompt(questions.item(member, "school", "school" ));
            employees.push(new Intern(name, id, email, school));
            break;
    }
}

function getHTMLModule(file) {
    return readFile(file, "utf8");
}

// Generating employee html 
async function generateHTML() {
    let Template = {
        index: await getHTMLModule("./src/index.html"),
        Manager: await getHTMLModule("./src/manager.html"),
        Engineer: await getHTMLModule("./src/engineer.html"),
        Intern: await getHTMLModule("./src/intern.html")
  
    }

    let employeesHTML = "";

    for (let employee of employees) {
        let html = Template[employee.constructor.name]
        .replace(/{% name %}/gi, employee.name)
        .replace(/{% id %}/gi, employee.id)
        .replace(/{% email %}/gi, employee.email);
        switch (employee.constructor.name) {
            case "Manager":
                html = html.replace(/{% officeNumber %}/gi, employee.officeNumber);
                break;
            case "Engineer":
                html = html.replace(/{% github %}/gi, employee.github);
                break;
            case "Intern":
                html = html.replace(/{% school %}/gi, employee.school);
                break;
        }
        employeesHTML += html;
    }
    let completeHTML = Template["index"].replace(/{% employees %}/gi, employeesHTML);

    createHTML(completeHTML);
}

// Creating a output html file
async function createHTML(html) {
    console.log("Creating HTML...");
    let file = `team-profile.html`;
    let dir = "./dist";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    await writeFile(`${dir}/${file}`, html);
    console.log(`HTML has been created to "${dir}/${file}".`);
    return;
}

async function team() {
    console.log("Please build your team");
    await addRole("Manager");
    let member = "";
    let exit = "I am done";
    while (member != exit) {
        let { member } = await inquirer.prompt(questions.type());
        if (member === exit) {
            return generateHTML();
        }
        await addRole(member);
    }
}

team();
