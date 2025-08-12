// Test validation function to ensure it correctly rejects malformed results
function isValidNewResult(numbers, knownResults) {
  // Check if this is a valid new result (not a duplicate, reasonable pattern)
  
  // First check: Must have exactly 7 numbers
  if (!Array.isArray(numbers) || numbers.length !== 7) {
    return { valid: false, reason: `Invalid length: expected 7 numbers, got ${numbers?.length || 0}` };
  }
  
  // Second check: No duplicate numbers within the result
  if (new Set(numbers).size !== numbers.length) {
    const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);
    return { valid: false, reason: `Contains duplicate numbers: ${duplicates.join(', ')}` };
  }
  
  // Third check: All numbers must be in valid range
  const invalidNumbers = numbers.filter(n => n < 1 || n > 49 || !Number.isInteger(n));
  if (invalidNumbers.length > 0) {
    return { valid: false, reason: `Invalid numbers outside 1-49 range: ${invalidNumbers.join(', ')}` };
  }
  
  // Fourth check: Don't allow exact duplicates of known results
  for (const known of knownResults) {
    if (numbers.length === known.length && 
        numbers.slice(0, 6).sort().join(',') === known.slice(0, 6).sort().join(',') &&
        numbers[6] === known[6]) {
      return { valid: false, reason: `Exact duplicate of existing result [${known.join(', ')}]` };
    }
  }
  
  return { valid: true, reason: 'Valid new result' };
}

// Test cases
const knownResults = [
  [9, 24, 31, 34, 43, 44, 1],
  [2, 15, 28, 39, 42, 44, 5]
];

console.log('🧪 Testing validation logic...\n');

// Test 1: Malformed result with duplicates (the issue you reported)
const badResult1 = [8, 10, 15, 15, 15, 15, 15];
const test1 = isValidNewResult(badResult1, knownResults);
console.log(`❌ Bad result [${badResult1.join(', ')}]:`, test1.reason);

// Test 2: Valid new result
const goodResult = [1, 12, 23, 35, 40, 46, 3];
const test2 = isValidNewResult(goodResult, knownResults);
console.log(`✅ Good result [${goodResult.join(', ')}]:`, test2.reason);

// Test 3: Exact duplicate (should be rejected)
const duplicateResult = [9, 24, 31, 34, 43, 44, 1];
const test3 = isValidNewResult(duplicateResult, knownResults);
console.log(`❌ Duplicate result [${duplicateResult.join(', ')}]:`, test3.reason);

// Test 4: Wrong length
const shortResult = [1, 2, 3, 4, 5];
const test4 = isValidNewResult(shortResult, knownResults);
console.log(`❌ Short result [${shortResult.join(', ')}]:`, test4.reason);

// Test 5: Numbers out of range
const invalidRangeResult = [0, 5, 10, 15, 20, 25, 50];
const test5 = isValidNewResult(invalidRangeResult, knownResults);
console.log(`❌ Invalid range [${invalidRangeResult.join(', ')}]:`, test5.reason);

console.log('\n✅ Validation logic test complete!');
console.log('The script will now properly reject results like [8,10,15,15,15,15,15]');
