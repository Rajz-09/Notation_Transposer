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

// Function to create a key-value mapping of classical swar to adjusted western notes
function createMapping(rotatedWesternNotes) {
    const mapping = {};
    for (let i = 0; i < classicalSwar.length; i++) {
        mapping[classicalSwar[i]] = rotatedWesternNotes[i];
    }
    return mapping;
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
        option.value = note;
        option.textContent = note;
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

// Populate the "from-scale" dropdown and set the default selection to 'C'
window.onload = () => {
    const fromScaleDropdown = document.getElementById('from-scale');
    westernNotes.forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        fromScaleDropdown.appendChild(option);
    });

    // Set the default selection to 'C'
    fromScaleDropdown.value = 'C';

    // Update the 'to-scale' dropdown based on the default 'from-scale' selection
    updateToScaleOptions('C');

    fromScaleDropdown.addEventListener('change', (event) => {
        const selectedRoot = event.target.value;
        updateToScaleOptions(selectedRoot); // Update 'to-scale' based on selected 'from-scale'
    });
};

// Function to convert scales based on the selected 'from' and 'to' scales
document.getElementById('convert-button').onclick = () => {
    const fromScale = document.getElementById('from-scale').value;
    const toScale = document.getElementById('to-scale').value;
    const inputNotation = document.getElementById('input-notation').value.trim().split(' ');
    const outputTextarea = document.getElementById('output-notation');

    // Validate selection and input
    if (!fromScale || !toScale || inputNotation.length === 0) {
        alert('Please select both scales and provide input notation.');
        return;
    }

    // Create and show the loader overlay
    const loaderOverlay = document.createElement("div");
    loaderOverlay.classList.add("loader-overlay");

    const loader = document.createElement("div");
    loader.classList.add("loader");
    loaderOverlay.appendChild(loader);

    // Append the loader overlay within the container
    document.querySelector(".container").appendChild(loaderOverlay);

    // Show the loader overlay
    loaderOverlay.style.display = "flex";

    // Delay the output generation until the loader finishes
    setTimeout(() => {
        // Step 1: Rotate the westernNotes array starting from the selected 'from-scale'
        const rotatedWesternNotes = rotateArray(westernNotes, fromScale);

        // Step 2: Create the key-value mapping of classical swar to adjusted western notes
        const swarMapping = createMapping(rotatedWesternNotes);

        // Step 3: Find the interval between from-scale and to-scale
        const interval = westernNotes.indexOf(toScale) - westernNotes.indexOf(fromScale);

        // Step 4: Transpose input notation with octave indicators
        const transposedNotes = transposeNotesWithOctave(inputNotation, interval);

        // Display the output notation
        outputTextarea.value = transposedNotes.join(' ');

        // Remove loader overlay
        loaderOverlay.style.display = "none";
        loaderOverlay.remove();

        // Scroll to the output notation textarea
        outputTextarea.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 2000); // Delay of 2 seconds
};

// Event listener for pressing 'Enter' key in the input field
document.getElementById('input-notation').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents a new line from being added in the text area.
        document.getElementById('convert-button').click(); // Simulates a click on the convert button.
    }
});

// Function to copy text to clipboard and change button appearance
function copyToClipboard(buttonId, textAreaId) {
    const textArea = document.getElementById(textAreaId);
    textArea.select();
    document.execCommand('copy');

    // Change button text and icon to indicate the text was copied
    const button = document.getElementById(buttonId);
    button.innerHTML = '<span class="mr-1">&#10003;</span> Copied';

    // Reset the button text and icon back to the original after 2 seconds
    setTimeout(() => {
        button.innerHTML = '<span class="mr-1">&#128203;</span> Copy';
    }, 2000);
}

// Event listeners for copy buttons
document.getElementById('copy-input-button').addEventListener('click', () => {
    copyToClipboard('copy-input-button', 'input-notation');
});

document.getElementById('copy-output-button').addEventListener('click', () => {
    copyToClipboard('copy-output-button', 'output-notation');
});
