// import {validateRequestBody, testMatch, Patterns} from "./server.js";

const { Patterns } = require("./patterns.js");

const testMatch = Patterns.testMatch;

// const {testMatch} = validateRequestBody;

//empty name

test("empty name", () => {
  expect(testMatch(Patterns.othernamesPattern, "")).toBe(false);
});
// one character
test("one character", () => {
  expect(testMatch(Patterns.othernamesPattern, "d")).toBe(true);
});
//more than one character
test("more than one character", () => {
  expect(testMatch(Patterns.othernamesPattern, "dj")).toBe(true);
});
//digit or other invalid character
test("digit or other invalid character", () => {
  expect(testMatch(Patterns.othernamesPattern, "1jk")).toBe(false);
});

//good email

test("good email", () => {
  expect(testMatch(Patterns.emailPattern, "omotayoo@afolabi.com")).toBe(true);
});
//email without @
test("email without @", () => {
  expect(testMatch(Patterns.emailPattern, "omotayooafolabi.com")).toBe(false);
});
//email without . something
test("email without . something", () => {
  expect(testMatch(Patterns.emailPattern, "omotayoo@afolabicom")).toBe(false);
});

//correct phone number
test("correct phone number", () => {
  expect(testMatch(Patterns.phonenumberPattern, "08170216235")).toBe(true);
});
//phone number with smaller numbers
test("phone number with smaller numbers", () => {
  expect(testMatch(Patterns.phonenumberPattern, "0817021623")).toBe(false);
});

//phone number with more numbers
test("phone number with more numbers", () => {
  expect(testMatch(Patterns.phonenumberPattern, "081702162350")).toBe(false);
});

//phone number with invalid symbols
test("phone number with invalid symbols", () => {
  expect(testMatch(Patterns.phonenumberPattern, "08170216235l")).toBe(false);
});

//gender required
test("gender required", () => {
  expect(testMatch(Patterns.genderPattern, "")).toBe(false);
});

test("wrong gender", () => {
  expect(testMatch(Patterns.genderPattern, "cis-male")).toBe(false);
});

test("correct gender", () => {
  expect(testMatch(Patterns.genderPattern, "female")).toBe(true);
});




