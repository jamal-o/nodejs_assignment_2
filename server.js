const { createServer } = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");

class Patterns {
  static testMatch(pattern, string) {
    return pattern.test(string);
  }

  //validate names
  static fandlnamePattern = /^[A-Za-z]+$/;
  static othernamesPattern = /(^[A-Za-z]+$)|^$/;

  //validate email
  static emailPattern = /^[A-Za-z.]{1,20}@[A-Za-z.]{1,20}[.][A-Za-z.]{1,20}$/;

  //validate phonenumber
  static phonenumberPattern = /^\d{11}$/;

  // validate gender
  static genderPattern = /^male$|^female$/i;
}

exports.Patterns = Patterns;
function responseToJson(response) {
  return JSON.stringify(JSON.parse(response));
}

function validateRequestBody(requestBody) {
  const { fname, lname, oname, email, phoneNo, gender } = requestBody;

  const testMatch = Patterns.testMatch;

  let validInput = {
    fnameValid: testMatch(Patterns.fandlnamePattern, fname),
    lnameValid: testMatch(Patterns.fandlnamePattern, lname),
    onameValid: testMatch(Patterns.othernamesPattern, oname),
    emailValid: testMatch(Patterns.emailPattern, email),
    phoneNoValid: testMatch(Patterns.phonenumberPattern, phoneNo),
    genderValid: testMatch(Patterns.genderPattern, gender),
  };

  let inputValuesArray = Object.values(validInput);

  let allInputsValid = true;

  //test values until a false value is found
  for (let index = 0; index < inputValuesArray.length; index++) {
    if (inputValuesArray[index]) {
      continue;
    } else {
      allInputsValid = false;
      break;
    }
  }

  //write content to database.json if good response
  if (allInputsValid) {
    let forms = [];

    //handle file already exists
    if (fs.existsSync("database.json")) {
      console.log("file already exists");
      let rawFile = fs.readFileSync(
        "database.json",
        { encoding: "utf-8" },
        (err, data) => {
          if (err.code === "ENOENT") {
            return;
          }
          if (err) {
            console.error(err.toString());
            return;
          }
        }
      );

      forms = JSON.parse(rawFile).forms;
    }

    forms.push(requestBody);

    formsObj = {
      forms: forms,
    };

    fs.writeFile("database.json", JSON.stringify(formsObj), (err) => {
      if (err) throw err;
      console.log("Data written to file");
      // console.log
    });

    return `
        {
            "message": "Form filled successfully",
            "forms": ${JSON.stringify(forms)}
            
        }
        `;
  } else {
    //provide error message
    let errors = "";

    if (!validInput.fnameValid) {
      errors = errors.concat(`First name is not valid, `);
    }

    if (!validInput.lnameValid) {
      errors = errors.concat(`Last name is not valid, `);
    }

    if (!validInput.onameValid) {
      errors = errors.concat(`Other name is not valid, `);
    }

    if (!validInput.emailValid) {
      errors = errors.concat(`Email address is not valid, `);
    }

    if (!validInput.phoneNoValid) {
      errors = errors.concat(`Phone number is not valid, `);
    }

    if (!validInput.genderValid) {
      errors = errors.concat(`Gender is not valid, `);
    }

    return `
        {
            "message": "One or more inputs is not valid",
            "invalidInputs": "${errors}"
        }
        `;
  }
}

function getHandler(req, res) {
  //handle user getting form
  if (req.url === "/" || req.url === "/html_form") {
    res.writeHead(200, { "Content-type": "text/html" });
    let html_form = fs.readFileSync(
      "html_form.html",
      { encoding: "utf-8" },
      (err, data) => {
        if (err.code === "ENOENT") {
          return;
        }
        if (err) {
          console.error(err.toString());
          return;
        }
      }
    );
    res.write(html_form);
    res.end();
    return;
  }

  //handle user submitting with get
  let requestBody = url.parse(req.url, true).query;
  if (req.url.match("//html_form?/") && requestBody !== undefined) {
    res.writeHead(200, { "Content-type": "application/json" });
    res.write(responseToJson(validateRequestBody(requestBody)));
    res.end();
  } else {
    //handle user wrong url
    res.writeHead(404, { "Content-type": "text/html" });
    res.end(`
    <h1>404 Not Found</h1>
    `);
  }
}

//handle user submit with post
function postHandler(req, res) {
  if (req.url.match("/") || req.url === "/html_form") {
    res.writeHead(200, { "Content-type": "application/json" });
    let data = "";
    req.on("data", (chunk) => {
      
      data = data.concat(chunk);
    });

    req.on("end", () => {
      // console.log(`Data: \n\n ${data}`)
      let requestBody;
      
      try {
       requestBody = JSON.parse(data);  
      } catch (error) {
        requestBody = qs.parse(data);
      }
      // if (requestBody == '') requestBody = JSON.parse(data);
      console.log(`Data: \n\n ${data.toString()}`);

      let responseBody = validateRequestBody(requestBody);
      res.end(responseToJson(responseBody));
    });
  } else {
    res.writeHead(404, { "Content-type": "text/html" });
    res.end(`
    <h1>404 Not Found</h1>
    `);
  }
}

function requestHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  switch (req.method) {
    case "GET":
      getHandler(req, res);
      break;

    case "POST":
      postHandler(req, res);
      break;

    default:
      res.writeHead(400, { "Content-type": "application/json" });
      res.end(
        JSON.stringify(
          `
                "error": 
                {
                    "statusCode": 404
                    "message": "Http method not supported"
                }
                `
        )
      );
      break;
  }
}

const server = createServer(requestHandler);
const port = 5000;
server.listen(port, () => {
  console.log(`Server up and running on port ${port}!`);
});

module.exports = server;