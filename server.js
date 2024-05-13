const { createServer } = require("http");
const fs = require("fs");
const url = require("url");

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
  console.log(requestBody);
  const testMatch = Patterns.testMatch;

  let validInput = {
    fnameValid: testMatch(Patterns.fandlnamePattern, fname),
    lnameValid: testMatch(Patterns.fandlnamePattern, lname),
    onameValid: testMatch(Patterns.othernamesPattern, oname),
    emailValid: testMatch(Patterns.emailPattern, email),
    phoneNoValid: testMatch(Patterns.phonenumberPattern, phoneNo),
    genderValid: testMatch(Patterns.genderPattern, gender),
  };

  console.log(validInput);

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
  console.log("all inputs valid: " + allInputsValid);
  //write content to database.json if good response
  if (allInputsValid) {
    fs.appendFile("database.json", JSON.stringify(requestBody), (err) => {
      if (err) throw err;
      console.log("Data written to file");
    });

    return `
        {
            "message": "Form filled successfully"
            
        }
        `;
  } else {
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
  if (req.url === "/" || req.url === "/html_form") {
    res.writeHead(200, { "Content-type": "text/html" });
    res.write(htmlForm);
    res.end();
    
    
  } else if(req.url.toString().match("/html_form")){
    let requestBody = url.parse(req.url, true).query;
    res.write(responseToJson(validateRequestBody(requestBody)));
    // console.log(result.end);
    res.end();

  }
  else {
    res.writeHead(404, { "Content-type": "text/html" });
    res.end(`
    <h1>404 Not Found</h1>
    `);
  }
}

function postHandler(req, res) {
  let data = "";
  req.on("data", (chunk) => {
    data = data.concat(chunk);
  });

  req.on("end", () => {
    let requestBody = JSON.parse(data);
    let responseBody = validateRequestBody(requestBody);

    res.end(responseToJson(validateRequestBody(req.body)));
    res.end(responseBody);
  });
}

function requestHandler(req, res) {
  switch (req.method) {
    case "GET":      
      getHandler(req, res);
      break;

    case "POST":
      res.writeHead(200, { "Content-type": "application/json" });
      postHandler(req, res);

    default:
      res.writeHead(404, { "Content-type": "application/json" });
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
server.listen(3000, () => {
  console.log("Server up and running!");
});

const htmlForm = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML FORM</title>
    <!-- <style>
        body{
            text-align: center;
            align-items: center;
        }

        label{
            width
        }
    </style> -->
</head>
<body>
    <form>
        <fieldset>
            <legend>Information Form</legend>

        <!-- first name -->
        <label for="fname">First Name</label><br>
        <input type="text" name="fname" id="fname"><br>

        <!-- last name -->
        <label for="lname">Last Name</label><br>
        <input type="text" name="lname" id="lname"><br>

        
        <!-- other names -->
        <label for="oname">Other Names</label><br>
        <input type="text" name="oname" id="oname"><br>

        
        <!-- email address -->
        <label for="email">Email</label><br>
        <input type="email" name="email" id="email"><br>

        
        <!-- phone number -->
        <label for="phoneNo">Phone Number</label><br>
        <input type="tel" name="phoneNo" id="phoneNo"><br>

        
        <!-- gender -->
        <label for="gender">Gender</label><br>
        <select id="gender" name="gender"><br>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
        </select><br>
        
        
        <!-- submit  -->
        <input type="submit"></input><br>

        </fieldset>
    </form>
</body>
</html>
`
