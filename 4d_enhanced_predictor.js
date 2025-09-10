// Initialize enhanced predictor
let predictor = new Enhanced4DPredictor();

function predict4D() {
    // Get prediction options
    const method = document.getElementById('predictionMethod').value;
    if (method !== 'enhanced') {
        // Use existing prediction logic for other methods
        return originalPredict4D();
    }

    // Get advanced options
    const options = {
        count: parseInt(document.getElementById('predictionCount').value) || 5,
        minDigitSum: parseInt(document.getElementById('minDigitSum').value) || 0,
        maxDigitSum: parseInt(document.getElementById('maxDigitSum').value) || 36,
        excludeDigits: Array.from(document.querySelectorAll('#excludeDigits input:checked')).map(cb => parseInt(cb.value)),
        requireDigits: Array.from(document.querySelectorAll('#requireDigits input:checked')).map(cb => parseInt(cb.value)),
        probabilityThreshold: parseInt(document.getElementById('probabilityThreshold').value) / 100
    };

    // Analyze historical data
    predictor.analyzeHistoricalData(historical4D);

    // Generate predictions
    const predictions = predictor.generatePredictions(options);

    // Display predictions
    displayEnhancedPredictions(predictions);
    displayStatistics();
}

function displayEnhancedPredictions(predictions) {
    const container = document.getElementById('predictionCards');
    container.innerHTML = '';

    predictions.forEach(prediction => {
        const card = document.createElement('div');
        card.className = 'prediction-card';
        card.style.width = '200px';
        card.style.backgroundColor = getConfidenceColor(prediction.probability);
        
        card.innerHTML = `
            <div class="prediction-number">${prediction.number.toString().padStart(4, '0')}</div>
            <div style="margin-top: 10px; font-size: 14px;">
                <div>Probability: ${(prediction.probability * 100).toFixed(2)}%</div>
                <div>Pattern Score: ${prediction.analysis.patternScore.toFixed(2)}</div>
                <div>Digit Sum: ${prediction.analysis.digitSum}</div>
                <div>Even/Odd: ${prediction.analysis.evenOddRatio}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function displayStatistics() {
    const stats = predictor.getDigitStatistics();
    const statsDiv = document.getElementById('statistics');
    statsDiv.style.display = 'block';

    // Display digit frequency
    document.getElementById('digitStats').innerHTML = `
        <h4>Most Frequent Digits</h4>
        <p>${stats.mostFrequent.map(d => 
            `${d.digit}: ${d.freq} times`).join(', ')}</p>
    `;

    // Display positional preferences
    document.getElementById('positionStats').innerHTML = `
        <h4>Position Analysis</h4>
        ${stats.positionPreference.map(pos => `
            <p>Position ${pos.position}: ${pos.preferredDigits.map(d => 
                `${d.digit} (${d.freq})`).join(', ')}</p>
        `).join('')}
    `;

    // Display common pairs
    document.getElementById('pairStats').innerHTML = `
        <h4>Common Digit Pairs</h4>
        <p>${stats.commonPairs.map(([pair, freq]) => 
            `${pair}: ${freq} times`).join(', ')}</p>
    `;
}

function getConfidenceColor(probability) {
    // Convert probability to a color from green (high) to yellow (medium) to red (low)
    const hue = probability * 120; // 120 is green, 60 is yellow, 0 is red
    return `hsl(${hue}, 80%, 90%)`;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    predictor = new Enhanced4DPredictor();
    initializeDigitCheckboxes();

    // Update probability threshold display
    document.getElementById('probabilityThreshold').addEventListener('input', function(e) {
        document.getElementById('probabilityValue').textContent = 
            (parseInt(e.target.value) / 100).toFixed(2);
    });

    // Show/hide advanced options based on prediction method
    document.getElementById('predictionMethod').addEventListener('change', function(e) {
        const advancedOptions = document.getElementById('advancedOptions');
        advancedOptions.style.display = e.target.value === 'enhanced' ? 'block' : 'none';
    });
});
