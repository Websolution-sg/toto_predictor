import csv

print("=" * 70)
print("🎯 VALIDATING DEC 29, 2025 PREDICTIONS vs ACTUAL RESULT")
print("=" * 70)
print()

# Actual Dec 29, 2025 result from Singapore Pools
actual_numbers = [2, 4, 22, 24, 30, 33]
additional = 49

print(f"📅 Draw Date: 29-Dec-25")
print(f"🎯 Winning Numbers: {', '.join(map(str, actual_numbers))}")
print(f"➕ Additional: {additional}")
print(f"💰 Jackpot: $1,336,997 (No Group 1 winner)")
print()
print("=" * 70)
print()

# Load CSV to recreate predictions
with open('totoResult.csv', 'r') as f:
    lines = f.readlines()

historical = []
for line in lines:
    parts = line.strip().split(',')
    historical.append({
        'date': parts[0],
        'numbers': [int(n) for n in parts[1:7]],
        'additional': int(parts[7])
    })

print(f"📊 Loaded {len(historical)} historical draws")
print(f"Latest in dataset: {historical[0]['date']} - {historical[0]['numbers']} + {historical[0]['additional']}")
print()

# Base numbers from the prediction file
base_numbers = [10, 49, 2]

def get_frequency(draws, include_additional=True):
    freq = [0] * 50
    for draw in draws:
        for n in draw['numbers']:
            freq[n] += 1
        if include_additional and draw['additional']:
            freq[draw['additional']] += 1
    return freq

def select_with_balance(candidates, count=6):
    selected = []
    even_count = 0
    odd_count = 0
    
    for candidate in candidates:
        if len(selected) >= count:
            break
        num = candidate['n'] if isinstance(candidate, dict) else candidate
        
        if num in base_numbers:
            continue
        
        is_even = num % 2 == 0
        
        if (is_even and even_count < 3) or (not is_even and odd_count < 3) or len(selected) >= 4:
            selected.append(num)
            if is_even:
                even_count += 1
            else:
                odd_count += 1
    
    while len(selected) < count:
        for n in range(1, 50):
            if len(selected) >= count:
                break
            if n not in base_numbers and n not in selected:
                selected.append(n)
                break
    
    return sorted(selected)

# Recreate the 10 prediction methods
def enhanced_frequency_compatibility():
    recent25 = historical[:25]
    recent50 = historical[:50]
    
    recent_freq = get_frequency(recent25, True)
    overall_freq = get_frequency(recent50, True)
    compatibility = [0] * 50
    
    for draw in historical[:30]:
        for base in base_numbers:
            if base in draw['numbers'] or draw['additional'] == base:
                for n in draw['numbers']:
                    if n != base:
                        compatibility[n] += 1
                if draw['additional'] != base:
                    compatibility[draw['additional']] += 0.5
    
    suggestions = []
    for n in range(1, 50):
        if n not in base_numbers:
            freq_score = recent_freq[n] * 0.4 + overall_freq[n] * 0.2
            compat_score = compatibility[n] * 0.3
            recent_bonus = 0.1 if recent_freq[n] >= 2 else 0
            
            suggestions.append({
                'n': n,
                'score': freq_score + compat_score + recent_bonus
            })
    
    suggestions.sort(key=lambda x: x['score'], reverse=True)
    return select_with_balance(suggestions)

# Generate prediction 1 (the top method)
pred1 = enhanced_frequency_compatibility()

print("🎲 PREDICTION #1: Enhanced Frequency + Compatibility ⭐⭐⭐⭐⭐")
print(f"   Predicted: {pred1}")

# Validate
matches = [n for n in pred1 if n in actual_numbers]
has_additional = additional in pred1

print(f"   ✅ Matches: {len(matches)}/6 main numbers", end="")
if len(matches) > 0:
    print(f" → {matches}")
else:
    print()
    
if has_additional:
    print(f"   🌟 BONUS: Additional number ({additional}) also predicted!")

accuracy = (len(matches) / 6) * 100
print(f"   📊 Accuracy: {accuracy:.1f}%")
print()

# For Group 4 prize, need 4 matches
if len(matches) == 4:
    print("   🏆 Would have won Group 4 prize!")
elif len(matches) == 5:
    if has_additional:
        print("   🏆🏆 Would have won Group 2 prize!")
    else:
        print("   🏆 Would have won Group 3 prize!")
elif len(matches) == 6:
    print("   🏆🏆🏆 JACKPOT! Would have won Group 1!")
elif len(matches) == 3:
    if has_additional:
        print("   🎁 Would have won Group 5 prize ($50)")
    else:
        print("   🎁 Would have won Group 6 prize ($25)")

print()
print("=" * 70)
print("Note: Only showing top prediction method.")
print("Full validation requires running all 10 methods from generate_predictions_dec29.js")
print("=" * 70)
