const fs = require('fs');

function parseDate(dateStr) {
  const [day, mon, yy] = dateStr.split('-');
  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11
  };
  return new Date(2000 + parseInt(yy, 10), monthMap[mon], parseInt(day, 10));
}

function parseCsv(path) {
  const raw = fs.readFileSync(path, 'utf8').trim().split('\n');
  const lines = raw.filter((line) => /^\d+-[A-Za-z]+-\d+,/.test(line));
  return lines.map((line) => {
    const parts = line.split(',');
    return {
      dateStr: parts[0],
      date: parseDate(parts[0]),
      numbers: parts.slice(1, 7).map((x) => parseInt(x, 10)),
      additional: parseInt(parts[7], 10)
    };
  }).sort((a, b) => a.date - b.date);
}

function groupFromMatches(matchCount, hasAdditional) {
  if (matchCount === 6) return 'Group 1';
  if (matchCount === 5 && hasAdditional) return 'Group 2';
  if (matchCount === 5) return 'Group 3';
  if (matchCount === 4 && hasAdditional) return 'Group 4';
  if (matchCount === 4) return 'Group 5';
  if (matchCount === 3 && hasAdditional) return 'Group 6';
  if (matchCount === 3) return 'Group 7';
  return null;
}

function uniqueSet(arr) {
  return [...new Set(arr)].sort((a, b) => a - b);
}

function clipNumber(n) {
  if (n < 1) return 1;
  if (n > 49) return 49;
  return n;
}

function buildSetFromPools(pools, seed) {
  const selected = [];
  let p = 0;
  while (selected.length < 6 && p < pools.length) {
    const pool = pools[p];
    for (let i = 0; i < pool.length && selected.length < 6; i++) {
      const idx = (seed + i) % pool.length;
      const n = clipNumber(pool[idx]);
      if (!selected.includes(n)) {
        selected.push(n);
      }
    }
    p += 1;
  }

  for (let n = 1; selected.length < 6 && n <= 49; n++) {
    if (!selected.includes(n)) selected.push(n);
  }

  return selected.sort((a, b) => a - b);
}

function generatePredictionSets(history) {
  const recent = history.slice(-10);
  const freq = {};
  for (let n = 1; n <= 49; n++) freq[n] = 0;

  recent.forEach((draw) => {
    draw.numbers.forEach((n) => {
      freq[n] += 1;
    });
  });

  const sortedByFreqDesc = Object.keys(freq)
    .map((k) => ({ n: parseInt(k, 10), f: freq[k] }))
    .sort((a, b) => {
      if (b.f !== a.f) return b.f - a.f;
      return a.n - b.n;
    });

  const sortedByFreqAsc = [...sortedByFreqDesc].sort((a, b) => {
    if (a.f !== b.f) return a.f - b.f;
    return a.n - b.n;
  });

  const hot = sortedByFreqDesc.filter((x) => x.f >= 2).map((x) => x.n);
  const cold = sortedByFreqAsc.filter((x) => x.f === 0).map((x) => x.n);
  const warm = sortedByFreqAsc.filter((x) => x.f === 1).map((x) => x.n);

  const allNumbers = Array.from({ length: 49 }, (_, i) => i + 1);
  const decadeBuckets = [
    allNumbers.filter((n) => n >= 1 && n <= 10),
    allNumbers.filter((n) => n >= 11 && n <= 20),
    allNumbers.filter((n) => n >= 21 && n <= 30),
    allNumbers.filter((n) => n >= 31 && n <= 40),
    allNumbers.filter((n) => n >= 41 && n <= 49)
  ];

  const sets = [];

  // 5 "elite": cold-heavy + some warm support
  for (let i = 0; i < 5; i++) {
    sets.push(buildSetFromPools([
      cold,
      cold,
      warm,
      decadeBuckets[(i + 2) % 5],
      decadeBuckets[(i + 3) % 5],
      hot
    ], i * 2 + 1));
  }

  // 10 "premium": balanced cold/warm/hot
  for (let i = 0; i < 10; i++) {
    sets.push(buildSetFromPools([
      cold,
      warm,
      warm,
      hot,
      decadeBuckets[i % 5],
      decadeBuckets[(i + 3) % 5],
      allNumbers
    ], i + 3));
  }

  // 10 "strategic": decade-spread and anti-cluster
  for (let i = 0; i < 10; i++) {
    sets.push(uniqueSet([
      decadeBuckets[0][(i + 1) % decadeBuckets[0].length],
      decadeBuckets[1][(i + 2) % decadeBuckets[1].length],
      decadeBuckets[2][(i + 3) % decadeBuckets[2].length],
      decadeBuckets[3][(i + 4) % decadeBuckets[3].length],
      decadeBuckets[4][(i + 5) % decadeBuckets[4].length],
      warm.length ? warm[i % warm.length] : allNumbers[(i * 7) % 49]
    ]));
  }

  // Ensure each set has 6 numbers.
  const finalized = sets.map((s, i) => {
    const set = [...s];
    let filler = (i * 5) % 49;
    while (set.length < 6) {
      const n = allNumbers[filler % 49];
      if (!set.includes(n)) set.push(n);
      filler += 1;
    }
    return set.sort((a, b) => a - b);
  });

  return finalized.slice(0, 25);
}

function runBacktest(draws, startDate, endDate) {
  const targetDraws = draws.filter((d) => d.date >= startDate && d.date <= endDate);

  const drawReports = [];
  const groupCounts = {
    'Group 1': 0,
    'Group 2': 0,
    'Group 3': 0,
    'Group 4': 0,
    'Group 5': 0,
    'Group 6': 0,
    'Group 7': 0
  };

  let totalSets = 0;
  let totalWinningSets = 0;
  let drawsWithAnyWin = 0;
  let sumBestMatches = 0;

  targetDraws.forEach((target) => {
    const history = draws.filter((d) => d.date < target.date);

    if (history.length < 20) {
      return;
    }

    const sets = generatePredictionSets(history);
    totalSets += sets.length;

    let winCountThisDraw = 0;
    let bestMatches = 0;
    const winners = [];

    sets.forEach((set, idx) => {
      const matched = set.filter((n) => target.numbers.includes(n));
      const hasAdditional = set.includes(target.additional);
      const grp = groupFromMatches(matched.length, hasAdditional);

      if (matched.length > bestMatches) {
        bestMatches = matched.length;
      }

      if (grp) {
        winCountThisDraw += 1;
        groupCounts[grp] += 1;
        winners.push({
          setIndex: idx + 1,
          set,
          matchCount: matched.length,
          matched,
          hasAdditional,
          group: grp
        });
      }
    });

    if (winCountThisDraw > 0) drawsWithAnyWin += 1;
    totalWinningSets += winCountThisDraw;
    sumBestMatches += bestMatches;

    drawReports.push({
      date: target.dateStr,
      winningNumbers: target.numbers,
      additional: target.additional,
      setsTested: sets.length,
      winningSets: winCountThisDraw,
      bestMatches,
      winners
    });
  });

  const testedDraws = drawReports.length;
  return {
    period: {
      start: '2-Apr-26',
      end: '7-May-26'
    },
    testedDraws,
    totalSets,
    totalWinningSets,
    drawsWithAnyWin,
    drawHitRate: testedDraws ? (drawsWithAnyWin / testedDraws) : 0,
    setWinRate: totalSets ? (totalWinningSets / totalSets) : 0,
    avgBestMatches: testedDraws ? (sumBestMatches / testedDraws) : 0,
    groupCounts,
    drawReports
  };
}

function printSummary(report) {
  console.log('ROLLING BACKTEST (APR-MAY 2026)');
  console.log('================================');
  console.log(`Period: ${report.period.start} to ${report.period.end}`);
  console.log(`Draws tested: ${report.testedDraws}`);
  console.log(`Total sets tested: ${report.totalSets}`);
  console.log(`Winning sets: ${report.totalWinningSets}`);
  console.log(`Draws with any win: ${report.drawsWithAnyWin}/${report.testedDraws}`);
  console.log(`Draw-level hit rate: ${(report.drawHitRate * 100).toFixed(1)}%`);
  console.log(`Set-level win rate: ${(report.setWinRate * 100).toFixed(2)}%`);
  console.log(`Average best-match per draw: ${report.avgBestMatches.toFixed(2)}`);
  console.log('');
  console.log('Group breakdown:');
  Object.keys(report.groupCounts).forEach((g) => {
    console.log(`  ${g}: ${report.groupCounts[g]}`);
  });
  console.log('');
  console.log('Per-draw summary:');
  report.drawReports.forEach((d) => {
    console.log(`  ${d.date} -> wins: ${d.winningSets}, best match: ${d.bestMatches}/6`);
  });
}

(function main() {
  const draws = parseCsv('totoResult.csv');
  const startDate = parseDate('2-Apr-26');
  const endDate = parseDate('7-May-26');

  const report = runBacktest(draws, startDate, endDate);

  fs.writeFileSync('rolling_backtest_apr_may_2026.json', JSON.stringify(report, null, 2));
  printSummary(report);

  console.log('');
  console.log('Saved report: rolling_backtest_apr_may_2026.json');
})();
