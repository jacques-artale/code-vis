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
  },
  {
    name: 'Binary Search',
    code:
`function binarySearch(target, arr) {
  var low = 0;
  var high = arr.length - 1;

  while (low <= high) {
    var mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
}

var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var target = 6;
var result = binarySearch(target, arr);

console.log("Target found at index: " + result);
`
  },
  {
    name: 'Quick Sort',
    code:
`function quickSort(arr, left, right) {
  left = left || 0;
  right = right !== undefined ? right : arr.length - 1;

  if (left < right) {
      let pivotIndex = partition(arr, left, right);
      quickSort(arr, left, pivotIndex - 1);
      quickSort(arr, pivotIndex + 1, right);
  }
  return arr;
}

function partition(arr, left, right) {
  let pivot = arr[right];
  let i = left - 1;

  for (let j = left; j < right; j++) {
      if (arr[j] < pivot) {
          i++;
          swap(arr, i, j);
      }
  }
  swap(arr, i + 1, right);
  return i + 1;
}

function swap(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

// Example usage
let array = [10, 7, 8, 9, 1, 5];
quickSort(array);
console.log("Sorted array:", array);
`
  }
];
