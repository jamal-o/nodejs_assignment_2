class Patterns {
    
    static testMatch(pattern, string) {
        return pattern.test(string);
    }

//validate names
static fandlnamePattern = /^[A-Za-z]+$/;
 static othernamesPattern = /^[A-Za-z]+$/;


//validate email
 static emailPattern = /^[A-Za-z.]{1,20}@[A-Za-z.]{1,20}[.][A-Za-z.]{1,20}$/;

//validate phonenumber
static phonenumberPattern = /^\d{11}$/;

// validate gender
static genderPattern = /^male$|^female$/i;
}

exports.Patterns = Patterns;