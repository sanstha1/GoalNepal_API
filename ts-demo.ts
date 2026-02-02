export {};

let message = "Hello"; 
let message2 : string = "TypeScript"; 
console.log(message, message2); 
//message = 1; //auto
//message2 = true //error -type enforced 


//Primitive Data types
let booleanVar : boolean = true; 
let numberVar : number  = 42; 
let stringVar : string  = "TypeScript"; 
let nullVar : null = null ; 
let undefinedVar : undefined  = undefined; 
let symbolVar : symbol = Symbol("unique"); 



// yo tala ko chahi type of data tha xaina bhaney any ra unknown chalaunu paryo hai 
// any and unkwon types 
//any allows any type of operation like multiplication subtraction 
let anyVar: any = "10"; 
anyVar : anyVar + 1; //no error 


//unknown ma further operation mildaina ek choti assign garesi value jasto ni halna milxa 
let unknownVar: unknown = "10"; 
//unknownVar = unkwonVar +1; // error 
//any type can be used for any operation 

//array/tuples 
let scores: number[]= [90, 80, 70];
let userData: [string, number] = ["Alice", 30];// fixed length and types .
//userData[0] = 1; //error

console.log(scores, userData);

//Union 
let age: number | string = 25; //can be either 
console.log(age);
age = "Thirty";
console.log(age);
// age  = false //error

console.log("End of file");

//Functions with types 

function add(num1: number, num2: number) : string {
    let sum : number = num1+num2; 
    return `Sum is ${sum}`;

}

let result : string = add(10, 20); 
console.log(result); 

const greet = (name : string ="Guest") : void =>{//GUest is a default or optional value void is to return null or nothing 
    console.log(`Hello, ${name}`);
}

greet(); // name optional 
greet("Bob"); 

//greet(123); // error 


//Object types  - Definition and structure 
//1. Object Iterals
let person : {name: string, age: number}; 
person = {name: "Charlie", age : 28}; 
console.log(person.name); 

//2.interfaces 
interface Product {
    id: number; 
    name: string ; 
    price : number; 
    description ?: string ; //optional 
}

let product1 : Product  = {id: 1, name : "Laptop", price : 990.99}; 
console.log(product1);


//3. type aliases 
type Student  = { 
    id : number; 
    name : string ; 
    product ? : Product ; // optional 
}

let student1 : Student  = { id : 101, name : "David"}; 
console.log(student1);


//Generics 
//Datatype injection at runtime 
function identity<T>(arg: T): T {
    return arg; 
}
let output1: string = identity<string> ("Hello Generics");
let output2: number = identity<number>(12345); 
console.log(output1, output2);
// differs from any as it preserves type information 

// Enum -named constants (collection of constants ) 
enum Direction {
    ADMIN,// in default - ADMIN= 0  
    USER, 
    GUEST
}

let userRole : Direction  = Direction.USER; 
console.log(userRole) ; //1
console.log(Direction[userRole]); //USER
// compare usecase 
console.log(userRole === Direction.USER) //exact comparison
let usrRole : string = "USER"; 
console.log(usrRole === "User")// inconsistant prone in typo and mistake 


interface User{
    id: number; 
    name: string; 
    role: Direction; 
}
let user1 :User  = {id : 1, name : "Eve", role : Direction.ADMIN}; 

let user2 : Partial<User>  = {id : 2} ; // all properties optional 
console.log(user2); 

let user3 : Readonly<User> = { id : 3, name:"Frank", role : Direction.GUEST
}; 
//user3.name = "New Name" ; // error - readonly 
console.log(user3); 

//Tasks 
//Create enum for carType : Sedan , SUV, Truck , Coupe
// create a type carModel 
// -name : string, description : string
// create an interface for a car with properties; 
// make : string or number, model : CarModel,
// year : number, 
// type : carType , and 
//isElectric(optional) boolean or number or string, 
// create and array of cars with at least 3 car objects 
// filter the cars whose year is greater than 2015 

enum CarType{
    SEDAN, 
    SUV, 
    TRUCK, 
    COUPE
}

type CarModel ={
    name: string, 
    description : string
}

interface Car{
    make : string|number,
    model : CarModel, 
    year : number, 
    type : CarType, 
    isElectric ? : boolean |number |string  
}

let carArray : Car[] = [{make : "Anish", model : {name: "anishkobuggati", description : "Anish ko gadi is babbal"
} , year : 2000, type : CarType.SEDAN},
{make : "Anish1", model : {name: "anishkobuggati1", description : "Anish ko gadi is babbal1"
} , year : 2002, type : CarType.SUV},
{make : "Anish2", model : {name: "anishkobuggati2", description : "Anish ko gadi is babbal2"
} , year : 2003, type : CarType.TRUCK},
]

//cars.filter 













































































































































































































































