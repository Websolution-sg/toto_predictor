// Enhanced 4D Analysis Module
class Analysis4D {
    constructor() {
        this.initializeUI();
        this.setupEventListeners();
        this.setupCharts();
    }

    initializeUI() {
        // Initialize digit checkboxes
        this.createDigitCheckboxes('excludeDigits');
        this.createDigitCheckboxes('requireDigits');
        
        // Initialize weight sliders
        this.setupWeightSliders();
        
        // Show analysis dashboard
        document.getElementById('analysisDashboard').style.display = 'block';
    }

    createDigitCheckboxes(containerId) {
        const container = document.getElementById(containerId);
        for (let i = 0; i < 10; i++) {
            const checkbox = document.createElement('div');
            checkbox.innerHTML = `
                <label style="display: inline-block; width: 30px; text-align: center;">
                    <input type="checkbox" value="${i}">
                    <span>${i}</span>
                </label>
            `;
            container.appendChild(checkbox);
        }
    }

    setupWeightSliders() {
        const updateValue = (sliderId, valueId) => {
            const slider = document.getElementById(sliderId);
            const value = document.getElementById(valueId);
            value.textContent = (slider.value / 100).toFixed(2);
            
            slider.addEventListener('input', () => {
                value.textContent = (slider.value / 100).toFixed(2);
                this.updateAnalysis();
            });
        };

        updateValue('historicalWeight', 'historicalValue');
        updateValue('trendWeight', 'trendValue');
        updateValue('patternWeight', 'patternValue');
    }

    setupEventListeners() {
        // Analysis period change
        document.getElementById('analysisPeriod').addEventListener('change', () => this.updateAnalysis());
        
        // Pattern type changes
        document.getElementById('sequencePattern').addEventListener('change', () => this.updateAnalysis());
        document.getElementById('numberType').addEventListener('change', () => this.updateAnalysis());
        
        // Ratio changes
        document.getElementById('evenOddRatio').addEventListener('change', () => this.updateAnalysis());
    }

    setupCharts() {
        // Initialize charts (using a charting library like Chart.js)
        this.initializeTrendChart();
        this.initializePatternChart();
        this.initializeHotColdList();
        this.initializeGapAnalysis();
    }

    initializeTrendChart() {
        // Implementation for trend chart
        const ctx = document.createElement('canvas');
        document.getElementById('trendChart').appendChild(ctx);
        // Setup chart using preferred charting library
    }

    initializePatternChart() {
        // Implementation for pattern distribution chart
        const ctx = document.createElement('canvas');
        document.getElementById('patternChart').appendChild(ctx);
        // Setup chart using preferred charting library
    }

    initializeHotColdList() {
        const container = document.getElementById('hotColdList');
        container.innerHTML = `
            <div class="hot-numbers">
                <h5>Hot Numbers</h5>
                <div id="hotNumbers" class="number-list"></div>
            </div>
            <div class="cold-numbers">
                <h5>Cold Numbers</h5>
                <div id="coldNumbers" class="number-list"></div>
            </div>
        `;
    }

    initializeGapAnalysis() {
        const container = document.getElementById('gapAnalysis');
        container.innerHTML = `
            <div class="gap-stats">
                <h5>Current Gaps</h5>
                <div id="currentGaps" class="gap-list"></div>
            </div>
        `;
    }

    updateAnalysis() {
        this.updateTrendChart();
        this.updatePatternChart();
        this.updateHotColdList();
        this.updateGapAnalysis();
    }

    updateTrendChart() {
        // Implementation for updating trend chart with new data
    }

    updatePatternChart() {
        // Implementation for updating pattern distribution chart
    }

    updateHotColdList() {
        // Implementation for updating hot/cold numbers list
    }

    updateGapAnalysis() {
        // Implementation for updating gap analysis
    }

    getAnalysisSettings() {
        return {
            analysisPeriod: document.getElementById('analysisPeriod').value,
            sequencePattern: document.getElementById('sequencePattern').value,
            numberType: document.getElementById('numberType').value,
            evenOddRatio: document.getElementById('evenOddRatio').value,
            weights: {
                historical: parseFloat(document.getElementById('historicalValue').textContent),
                trend: parseFloat(document.getElementById('trendValue').textContent),
                pattern: parseFloat(document.getElementById('patternValue').textContent)
            },
            digitConstraints: {
                minSum: document.getElementById('minDigitSum').value,
                maxSum: document.getElementById('maxDigitSum').value,
                excluded: this.getCheckedDigits('excludeDigits'),
                required: this.getCheckedDigits('requireDigits')
            }
        };
    }

    getCheckedDigits(containerId) {
        const container = document.getElementById(containerId);
        const checked = [];
        container.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            checked.push(parseInt(cb.value));
        });
        return checked;
    }
}

// Initialize analysis when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analysis4D = new Analysis4D();
});
