// Arrays representing Western and Classical scales
const westernNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const classicalSwar = ['S', 'R(k)', 'R', 'G(k)', 'G', 'm', 'M', 'P', 'D(k)', 'D', 'N(k)', 'N'];

// Mapping between classical swaras and Western notes
const swaraToWestern = {
    'S': 'C', 'R(k)': 'C#', 'R': 'D', 'G(k)': 'D#', 'G': 'E',
    'm': 'F', 'M': 'F#', 'P': 'G', 'D(k)': 'G#', 'D': 'A',
    'N(k)': 'A#', 'N': 'B'
};

const westernToSwara = Object.fromEntries(
    Object.entries(swaraToWestern).map(([key, value]) => [value, key])
);

// Function to create a rotated array starting from the given note
function rotateArray(array, startNote) {
    const startIndex = array.indexOf(startNote);
    return array.slice(startIndex).concat(array.slice(0, startIndex));
}

// Function to generate a scale based on a given root and pattern
function generateScale(root, pattern) {
    const rotatedNotes = rotateArray(westernNotes, root);
    let scale = [rotatedNotes[0]]; // Start with the root note
    let currentIndex = 0;

    for (let step of pattern) {
        currentIndex = (currentIndex + step) % rotatedNotes.length;
        scale.push(rotatedNotes[currentIndex]);
    }

    return scale;
}

// Function to update 'to-scale' dropdown options
function updateToScaleOptions(fromScaleRoot) {
    const toScaleSelect = document.getElementById('to-scale');
    toScaleSelect.innerHTML = ''; // Clear existing options.

    // Determine the pattern based on the presence of '#' in the root note
    const isMinor = fromScaleRoot.includes('#');
    const pattern = isMinor ? [2, 1, 2, 2, 1, 2, 2] : [2, 2, 1, 2, 2, 2, 1]; // Minor or Major scale pattern

    // Generate the scale based on the root note and selected pattern
    const derivedScale = generateScale(fromScaleRoot, pattern);

    // Populate the 'to-scale' dropdown with the generated scale
    derivedScale.forEach(note => {
        const option = document.createElement('option');
        const classicalSwara = westernToSwara[note] || ''; // Get corresponding swara
        option.value = note;
        option.textContent = `${note} - ${classicalSwara}`;
        toScaleSelect.appendChild(option);
    });

    // Set the first option as selected by default
    if (toScaleSelect.options.length > 0) {
        toScaleSelect.options[0].selected = true;
    }
}

// Function to transpose notes while retaining octave indicators (',', "'")
function transposeNotesWithOctave(notes, interval) {
    return notes.map(note => {
        const baseSwara = note.replace(/['|,]+/g, ''); // Extract base swara
        const octaveIndicator = note.replace(baseSwara, ''); // Extract octave symbols
        const westernNote = swaraToWestern[baseSwara];

        if (!westernNote) return note; // Skip if not a valid swara

        const originalIndex = westernNotes.indexOf(westernNote);
        const transposedIndex = (originalIndex + interval + westernNotes.length) % westernNotes.length; // Ensure positive index
        const transposedNote = westernNotes[transposedIndex];

        // Convert back to swara with the octave symbol.
        const convertedSwara = westernToSwara[transposedNote] || transposedNote;
        return convertedSwara + octaveIndicator; // Preserve octave indicators
    });
}

// Populate the "to-scale" dropdown based on a default "from-scale"
window.onload = () => {
    const defaultFromScale = 'C'; // Set default "from-scale"
    updateToScaleOptions(defaultFromScale);

    const fromScaleDropdown = document.getElementById('from-scale');
    fromScaleDropdown.addEventListener('change', (event) => {
        const selectedRoot = event.target.value;
        updateToScaleOptions(selectedRoot); // Update 'to-scale' based on selected 'from-scale'
    });
};

let convertButtonClickCount = 0; // Counter for "Convert" button clicks

// Add loader display and perform conversion after loader timeout
document.getElementById("convert-button").addEventListener("click", function () {
    const loaderOverlay = document.createElement("div");
    loaderOverlay.classList.add("loader-overlay");

    const loader = document.createElement("div");
    loader.classList.add("loader");
    loaderOverlay.appendChild(loader);

    // Append the loader overlay within the container
    document.querySelector(".container").appendChild(loaderOverlay);

    // Show the loader overlay
    loaderOverlay.style.display = "flex";

    // Delay conversion and output rendering until the loader timeout ends
    setTimeout(() => {
        loaderOverlay.style.display = "none";
        loaderOverlay.remove(); // Remove from DOM after hiding

        // Scroll to the output notation textarea
        document.getElementById("output-notation").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        // Perform the conversion and render the output
        const fromScale = document.getElementById('from-scale').value;
        const toScale = document.getElementById('to-scale').value;
        const inputNotation = document.getElementById('input-notation').value.trim();
        const outputTextarea = document.getElementById('output-notation');

        // Validate selection and input
        if (!fromScale || !toScale || inputNotation.length === 0) {
            alert('Please select both scales and provide input notation.');
            return;
        }

        // Calculate the transposition interval
        const interval = westernNotes.indexOf(toScale) - westernNotes.indexOf(fromScale);

        // Handle multi-line input notation
        const lines = inputNotation.split('\n');
        const outputLines = lines.map(line => {
            const words = line.split(' ');
            const transposedWords = transposeNotesWithOctave(words, interval);
            return transposedWords.join(' ');
        });

        // Display the output notation
        outputTextarea.value = outputLines.join('\n');
        outputTextarea.focus(); // Focus on the output textarea
        
    }, 2000); // Match loader timeout duration
});

// Add event listener for 'Enter' key in the input field
document.getElementById('input-notation').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents a new line from being added in the text area
        document.getElementById('convert-button').click(); // Simulates a click on the convert button
    }
});

// Add copy-to-clipboard functionality
function copyToClipboard(buttonId, textAreaId) {
    const textArea = document.getElementById(textAreaId);
    textArea.select();
    document.execCommand('copy');

    const button = document.getElementById(buttonId);
    button.innerHTML = '<span class="mr-1">&#10003;</span> Copied';

    setTimeout(() => {
        button.innerHTML = '<span class="mr-1">&#128203;</span> Copy';
    }, 2000);
}

document.getElementById('copy-input-button').addEventListener('click', () => {
    copyToClipboard('copy-input-button', 'input-notation');
});

document.getElementById('copy-output-button').addEventListener('click', () => {
    copyToClipboard('copy-output-button', 'output-notation');
});
