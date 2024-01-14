export default [
  {
    name: 'Empty Script',
    code: 'console.log("Hello World!");\n'
  },
  {
    name: 'Sum Of Integers',
    code:
`function hello() {
  var sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += i;
  }
  return sum;
}

var a = 10;
var b = hello();

if (a === b) {
  console.log("equal!");
} else {
  console.log("not equal!");
}
`
  },
  {
    name: 'Array Reversal',
    code: 
`var arr = [1, 2, 3, 4, 5];

for (var i = 0; i < arr.length / 2; i++) {
  var temp = arr[i];
  arr[i] = arr[arr.length - i - 1];
  arr[arr.length - i - 1] = temp;
}
`
  }
];
