// Swara to Western note mappings.
const swaraToWestern = {
    'S': 'C',
    'R(k)': 'C#',
    'R': 'D',
    'G(k)': 'D#',
    'G': 'E',
    'm': 'F',
    'M': 'F#',
    'P': 'G',
    'D(k)': 'G#',
    'D': 'A',
    'N(k)': 'A#',
    'N': 'B'
};

// Reverse the map to get Western to Swara mappings.
const westernToSwara = Object.fromEntries(
    Object.entries(swaraToWestern).map(([key, value]) => [value, key])
);

// Array of all Western notes for easy access.
const westernNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major scale pattern: W-W-H-W-W-W-H (Whole and Half steps)
const majorPattern = [2, 2, 1, 2, 2, 2, 1];

// Function to generate a scale based on a root note and a given pattern.
function generateScale(rootNote, pattern) {
    const scale = [rootNote];
    let currentIndex = westernNotes.indexOf(rootNote);

    pattern.forEach(interval => {
        currentIndex = (currentIndex + interval) % westernNotes.length;
        scale.push(westernNotes[currentIndex]);
    });

    return scale;
}

// Function to update 'to-scale' dropdown options based on the selected 'from-scale' root.
function updateToScaleOptions(fromScaleRoot) {
    const toScaleSelect = document.getElementById('to-scale');
    toScaleSelect.innerHTML = ''; // Clear existing options.

    const derivedScale = generateScale(fromScaleRoot, majorPattern);
    derivedScale.forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        toScaleSelect.appendChild(option);
    });
}

// Function to calculate the difference (interval) between two root notes.
function calculateInterval(fromRoot, toRoot) {
    const fromIndex = westernNotes.indexOf(fromRoot);
    const toIndex = westernNotes.indexOf(toRoot);
    let interval = toIndex - fromIndex;

    // Adjust interval for negative values to wrap around.
    if (interval < 0) {
        interval += westernNotes.length;
    }

    return interval;
}

// Function to shift the Western scale based on the interval.
function shiftScale(scale, interval) {
    return scale.map(note => {
        let noteIndex = westernNotes.indexOf(note);
        return westernNotes[(noteIndex + interval) % westernNotes.length];
    });
}

// Function to create a conversion map between two scales.
function getConversionMap(fromRoot, toRoot) {
    const fromScale = generateScale(fromRoot, majorPattern);
    const interval = calculateInterval(fromRoot, toRoot);

    // Shift the Western notes based on the interval to get the target scale.
    const shiftedScale = shiftScale(fromScale, interval);

    // Create a mapping between swaras of the 'from' scale to notes in the 'to' scale.
    const map = {};
    fromScale.forEach((note, index) => {
        const swara = westernToSwara[note];
        if (swara) {
            map[swara] = westernToSwara[shiftedScale[index]];
        }
    });

    return map;
}

// Function to convert a swara notation with octave.
function convertWithOctave(word, conversionMap) {
    const baseSwara = word.replace(/['|,]+/g, ''); // Extract the base swara.
    const octaveIndicator = word.replace(baseSwara, ''); // Extract octave symbols.
    const convertedBaseSwara = conversionMap[baseSwara] || baseSwara; // Convert swara.

    // Return converted swara with original octave.
    return convertedBaseSwara + octaveIndicator;
}

// Event listener for the 'from-scale' dropdown.
document.getElementById('from-scale').addEventListener('change', function () {
    updateToScaleOptions(this.value);
});

// Event listener for the convert button.
document.getElementById('convert-button').addEventListener('click', () => {
    const inputNotation = document.getElementById('input-notation').value.trim();
    const fromScaleRoot = document.getElementById('from-scale').value; // Get root note of the input scale.
    const toScaleRoot = document.getElementById('to-scale').value; // Get root note of the output scale.

    // Create a conversion map between the scales.
    const conversionMap = getConversionMap(fromScaleRoot, toScaleRoot);

    // Process the input notation and convert it using the selected conversion map.
    const lines = inputNotation.split('\n');
    const outputLines = lines.map(line => {
        const words = line.split(' ');
        const convertedWords = words.map(word => convertWithOctave(word, conversionMap));
        return convertedWords.join(' ');
    });

    // Set the output notation.
    document.getElementById('output-notation').value = outputLines.join('\n');
});

// Event listener for pressing 'Enter' key in the input field.
document.getElementById('input-notation').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents a new line from being added in the text area.
        document.getElementById('convert-button').click(); // Simulates a click on the convert button.
    }
});

// Function to copy text to clipboard and change button appearance.
function copyToClipboard(buttonId, textAreaId) {
    const textArea = document.getElementById(textAreaId);
    textArea.select();
    document.execCommand('copy');

    // Change button text and icon to indicate the text was copied.
    const button = document.getElementById(buttonId);
    button.innerHTML = '<span class="mr-1">&#10003;</span> Copied';

    // Reset the button text and icon back to the original after 2 seconds.
    setTimeout(() => {
        button.innerHTML = '<span class="mr-1">&#128203;</span> Copy';
    }, 2000);
}

// Set the default value for the 'from-scale' and update 'to-scale' options on page load.
document.addEventListener('DOMContentLoaded', () => {
    const fromScaleSelect = document.getElementById('from-scale');
    fromScaleSelect.value = 'C'; // Set the default 'from-scale' value to 'C'.
    updateToScaleOptions('C'); // Update the 'to-scale' options based on 'C'.
});

// Event listeners for copy buttons.
document.getElementById('copy-input-button').addEventListener('click', () => {
    copyToClipboard('copy-input-button', 'input-notation');
});

document.getElementById('copy-output-button').addEventListener('click', () => {
    copyToClipboard('copy-output-button', 'output-notation');
});
