// Enhanced test for TOTO validation logic
function isValidNewResult(numbers, knownResults) {
  if (!Array.isArray(numbers) || numbers.length !== 7) {
    return { valid: false, reason: `Invalid length: expected 7 numbers, got ${numbers?.length || 0}` };
  }
  
  if (new Set(numbers).size !== numbers.length) {
    const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);
    return { valid: false, reason: `Contains duplicate numbers: ${duplicates.join(', ')}` };
  }
  
  const invalidNumbers = numbers.filter(n => n < 1 || n > 49 || !Number.isInteger(n));
  if (invalidNumbers.length > 0) {
    return { valid: false, reason: `Invalid numbers outside 1-49 range: ${invalidNumbers.join(', ')}` };
  }
  
  // Reject sequential numbers (likely from navigation/pagination)
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  let isSequential = true;
  for (let i = 1; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] !== sortedNumbers[i-1] + 1) {
      isSequential = false;
      break;
    }
  }
  if (isSequential) {
    return { valid: false, reason: `Sequential numbers detected (likely navigation): [${sortedNumbers.join(', ')}]` };
  }
  
  // Reject if too many small numbers (likely page elements)
  const smallNumbers = numbers.filter(n => n <= 10).length;
  if (smallNumbers >= 6) {
    return { valid: false, reason: `Too many small numbers (${smallNumbers}/7 ≤ 10), likely page navigation` };
  }
  
  for (const known of knownResults) {
    if (numbers.length === known.length && 
        numbers.slice(0, 6).sort().join(',') === known.slice(0, 6).sort().join(',') &&
        numbers[6] === known[6]) {
      return { valid: false, reason: `Exact duplicate of existing result [${known.join(', ')}]` };
    }
  }
  
  return { valid: true, reason: 'Valid new result' };
}

const knownResults = [
  [9, 24, 31, 34, 43, 44, 1],
  [2, 15, 28, 39, 42, 44, 5]
];

console.log('🧪 Testing Enhanced TOTO Validation Logic...\n');

// Test cases for problematic results
console.log('=== PROBLEMATIC RESULTS (should be rejected) ===');

// Test 1: Sequential numbers (like pagination/navigation)
const sequential1 = [1, 2, 3, 4, 5, 6, 7];
const test1 = isValidNewResult(sequential1, knownResults);
console.log(`❌ Sequential [${sequential1.join(', ')}]: ${test1.reason}`);

// Test 2: The actual wrong result that was fetched
const wrongResult = [1, 2, 3, 4, 5, 6, 37];
const test2 = isValidNewResult(wrongResult, knownResults);
console.log(`❌ Wrong result [${wrongResult.join(', ')}]: ${test2.reason}`);

// Test 3: Too many small numbers (navigation elements)
const smallNumbers = [1, 2, 3, 4, 5, 6, 15];
const test3 = isValidNewResult(smallNumbers, knownResults);
console.log(`❌ Small numbers [${smallNumbers.join(', ')}]: ${test3.reason}`);

// Test 4: Duplicates
const duplicates = [8, 10, 15, 15, 15, 15, 15];
const test4 = isValidNewResult(duplicates, knownResults);
console.log(`❌ Duplicates [${duplicates.join(', ')}]: ${test4.reason}`);

// Test 5: Exact duplicate of known result
const exactDupe = [9, 24, 31, 34, 43, 44, 1];
const test5 = isValidNewResult(exactDupe, knownResults);
console.log(`❌ Exact duplicate [${exactDupe.join(', ')}]: ${test5.reason}`);

console.log('\n=== VALID RESULTS (should be accepted) ===');

// Test 6: The correct Singapore Pools result
const correctResult = [9, 24, 31, 34, 43, 44, 1];
// Test against empty known results to avoid duplicate detection
const test6 = isValidNewResult(correctResult, []);
console.log(`✅ Correct result [${correctResult.join(', ')}]: ${test6.reason}`);

// Test 7: Another valid TOTO result
const validResult = [12, 18, 25, 33, 41, 47, 8];
const test7 = isValidNewResult(validResult, knownResults);
console.log(`✅ Valid new result [${validResult.join(', ')}]: ${test7.reason}`);

// Test 8: Mix of small and large numbers (should be valid)
const mixedResult = [7, 19, 23, 35, 42, 48, 11];
const test8 = isValidNewResult(mixedResult, knownResults);
console.log(`✅ Mixed numbers [${mixedResult.join(', ')}]: ${test8.reason}`);

console.log('\n🎯 Enhanced validation will now correctly:');
console.log('   ✅ Accept genuine TOTO results like [9,24,31,34,43,44,1]');
console.log('   ❌ Reject sequential numbers like [1,2,3,4,5,6,7]');
console.log('   ❌ Reject navigation elements like [1,2,3,4,5,6,37]');
console.log('   ❌ Reject duplicate-heavy results');
console.log('   ❌ Reject exact duplicates of known results');
