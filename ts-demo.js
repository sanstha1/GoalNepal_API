var message = "Hello";
var message2 = "TypeScript";
console.log(message, message2);
//message = 1; //auto
//message2 = true //error -type enforced 
//Primitive Data types
var booleanVar = true;
var numberVar = 42;
var stringVar = "TypeScript";
var nullVar = null;
var undefinedVar = undefined;
var symbolVar = Symbol("unique");
// yo tala ko chahi type of data tha xaina bhaney any ra unknown chalaunu paryo hai 
// any and unkwon types 
//any allows any type of operation like multiplication subtraction 
var anyVar = "10";
anyVar: anyVar + 1; //no error 
//unknown ma further operation mildaina ek choti assign garesi value jasto ni halna milxa 
var unknownVar = "10";
//unknownVar = unkwonVar +1; // error 
//any type can be used for any operation 
//array/tuples 
var scores = [90, 80, 70];
var userData = ["Alice", 30]; // fixed length and types .
//userData[0] = 1; //error
console.log(scores, userData);
//Union 
var age = 25; //can be either 
console.log(age);
age = "Thirty";
console.log(age);
// age  = false //error
console.log("End of file");
//Functions with types 
function add(num1, num2) {
    var sum = num1 + num2;
    return "Sum is ".concat(sum);
}
var result = add(10, 20);
console.log(result);
var greet = function (name) {
    if (name === void 0) { name = "Guest"; }
    console.log("Hello, ".concat(name));
};
greet(); // name optional 
greet("Bob");
//greet(123); // error 
//Object types  - Definition and structure 
//1. Object Iterals
var person;
person = { name: "Charlie", age: 28 };
console.log(person.name);
var product1 = { id: 1, name: "Laptop", price: 990.99 };
console.log(product1);
var student1 = { id: 101, name: "David" };
console.log(student1);
//Generics 
//Datatype injection at runtime 
function identity(arg) {
    return arg;
}
var output1 = identity("Hello Generics");
var output2 = identity(12345);
console.log(output1, output2);
// differs from any as it preserves type information 
// Enum -named constants (collection of constants ) 
var Direction;
(function (Direction) {
    Direction[Direction["ADMIN"] = 0] = "ADMIN";
    Direction[Direction["USER"] = 1] = "USER";
    Direction[Direction["GUEST"] = 2] = "GUEST";
})(Direction || (Direction = {}));
var userRole = Direction.USER;
console.log(userRole); //1
console.log(Direction[userRole]); //USER
// compare usecase 
console.log(userRole === Direction.USER); //exact comparison
var usrRole = "USER";
console.log(usrRole === "User"); // inconsistant prone in typo and mistake 
