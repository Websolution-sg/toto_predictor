const fs = require('fs');

function parseCsv(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
  return lines.map((line) => {
    const c = line.split(',').map((s) => s.trim());
    return {
      date: c[0],
      nums: c.slice(1, 7).map(Number),
      add: Number(c[7]) || 0,
    };
  });
}

function weightedHybridPredict(historicalDesc, baseNums, range, includeAdd) {
  const bases = [...baseNums].sort((a, b) => a - b);
  const baseSet = new Set(bases);
  const draws = historicalDesc.slice(0, range);

  const freq = Array(50).fill(0);
  const compat = Array(50).fill(0);
  const recency = Array(50).fill(0);
  const pairBoost = Array(50).fill(0);
  const age = Array(50).fill(range);

  draws.forEach((draw, idx) => {
    const pool = includeAdd ? draw.slice(0, 6).concat(draw[6]) : draw.slice(0, 6);
    const mainPool = draw.slice(0, 6);
    const recencyWeight = 1 / (1 + idx * 0.12);
    const matchedBases = bases.filter((b) => pool.includes(b));

    pool.forEach((n) => {
      freq[n]++;
      recency[n] += recencyWeight;
    });

    matchedBases.forEach((b) => {
      pool.filter((n) => n !== b).forEach((n) => {
        compat[n]++;
      });
    });

    if (matchedBases.length >= 2) {
      mainPool.forEach((n) => {
        pairBoost[n] += (matchedBases.length - 1);
      });
    }
  });

  for (let n = 1; n <= 49; n++) {
    for (let i = 0; i < draws.length; i++) {
      if (draws[i].slice(0, 6).includes(n)) {
        age[n] = i;
        break;
      }
    }
  }

  const scored = [];
  for (let n = 1; n <= 49; n++) {
    const score =
      recency[n] * 1.8 +
      compat[n] * 0.8 +
      freq[n] * 0.6 +
      pairBoost[n] * 1.2 +
      (age[n] / range) * 0.8 -
      (baseSet.has(n) ? 1.2 : 0);

    scored.push({ n, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.n - b.n)
    .slice(0, 6)
    .map((o) => o.n)
    .sort((a, b) => a - b);
}

function rotateBase(base, shift) {
  return base.map((n) => ((n - 1 + shift) % 49) + 1).sort((a, b) => a - b);
}

function uniquePredictions(predictions) {
  const seen = new Set();
  return predictions.filter((p) => {
    const key = p.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generate25Predictions(csvPath, range = 50, includeAdd = false) {
  const rowsDesc = parseCsv(csvPath);
  if (!rowsDesc.length) {
    throw new Error('No rows in CSV');
  }

  const latest = rowsDesc[0];
  const historicalDesc = rowsDesc.map((r) => [...r.nums, r.add]);

  const predictions = [];
  for (let shift = 0; shift < 49 && predictions.length < 40; shift += 2) {
    const base = rotateBase(latest.nums, shift);
    const pred = weightedHybridPredict(historicalDesc, base, range, includeAdd);
    predictions.push(pred);
  }

  const deduped = uniquePredictions(predictions).slice(0, 25);
  return {
    sourceDate: latest.date,
    sourceNumbers: latest.nums,
    model: 'weightedHybrid-standalone',
    range,
    includeAdd,
    predictions: deduped,
  };
}

function main() {
  const output = generate25Predictions('totoResult.csv', 50, false);

  console.log('STANDALONE PREDICTION MODEL');
  console.log('===========================');
  console.log('Latest draw date:', output.sourceDate);
  console.log('Latest numbers  :', output.sourceNumbers.join(', '));
  console.log('Model           :', output.model);
  console.log('Range/IncludeAdd:', output.range + '/' + output.includeAdd);
  console.log('');
  console.log('TOP 25 PREDICTIONS');
  console.log('------------------');
  output.predictions.forEach((p, i) => {
    console.log(String(i + 1).padStart(2, '0') + '. [' + p.join(', ') + ']');
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  parseCsv,
  weightedHybridPredict,
  generate25Predictions,
};
