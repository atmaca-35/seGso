document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('searchBox');
    const searchButton = document.getElementById('searchButton');
    const suggestionsDiv = document.getElementById('suggestions');
    const wordCountMessage = document.getElementById('wordCountMessage');
    const resultDiv = document.getElementById('result');

    let dictionaryData = {};

    // Fetch dictionary data on page load
    try {
        const response = await fetch('semantic.json');
        dictionaryData = await response.json();
        updateWordCountMessage();
    } catch (error) {
        console.error('Error fetching dictionary:', error);
        wordCountMessage.textContent = 'Error loading dictionary.';
    }

    // Search box input event listener
    searchBox.addEventListener('input', () => {
        const query = searchBox.value.trim().toLowerCase();
        suggestionsDiv.innerHTML = '';

        if (query.length > 0) {
            const filteredWords = Object.keys(dictionaryData)
                .filter(word => word.toLowerCase().includes(query))
                .sort();

            const ul = document.createElement('ul');
            filteredWords.forEach(word => {
                const li = document.createElement('li');
                li.innerHTML = highlightMatchingText(word, query);
                li.addEventListener('click', () => {
                    searchBox.value = word;
                    suggestionsDiv.innerHTML = '';
                    suggestionsDiv.classList.remove('active'); 
                    searchWord(word);
                });
                ul.appendChild(li);
            });

            suggestionsDiv.appendChild(ul);
            suggestionsDiv.classList.add('active'); 
        } else {
            suggestionsDiv.classList.remove('active'); 
        }

        searchButton.textContent = query ? 'Search' : 'Random';
    });

    // Search button click event listener
    searchButton.addEventListener('click', () => {
        if (searchBox.value.trim() === '') {
            showRandomWord();
        } else {
            searchWord(searchBox.value.trim().toLowerCase());
        }
    });

    // Enter key press event listener for search
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord(searchBox.value.trim().toLowerCase());
            suggestionsDiv.classList.remove('active'); 
        }
    });

    // Allow only letters and spaces
    searchBox.addEventListener('keypress', (e) => {
        const charCode = e.charCode || e.keyCode;
        const char = String.fromCharCode(charCode);
        if (!char.match(/[a-zA-Z\sçÇðÐýÝöÖþÞüÜ]/)) { // Türkçe karakterlere izin ver
            e.preventDefault();
        }
    });

    // Function to update word count message
    function updateWordCountMessage() {
        const wordCount = Object.keys(dictionaryData).length;
        wordCountMessage.textContent = `Currently, there are ${wordCount} words and suffixes in our dictionary. Our dictionary includes the meanings of the words, their origins, the suffixes they take, and the functions of those suffixes.`;
    }

    // Function to search for a word
    function searchWord(query) {
        resultDiv.innerHTML = '';

        if (!dictionaryData[query]) {
            resultDiv.innerHTML = '<h3 class="error">No results found.</h3>';
            return;
        }

        const wordDetails = dictionaryData[query];
        const wordOrigin = wordDetails.origin || 'Unknown'; 

        resultDiv.innerHTML = `
            <div class="word">
                <h3>${query}</h3>
                <p><i>${wordDetails.type}</i></p>
            </div>
            <div class="details">
                <p><b>Origin:</b> ${wordOrigin}</p>
            </div>
            <p class="description"><b class='green'>I.</b> ${highlightWords(sanitizeHTML(wordDetails.description))}</p>
        `;
    }

    // Function to show a random word
    function showRandomWord() {
        const wordKeys = Object.keys(dictionaryData);
        const randomWordKey = wordKeys[Math.floor(Math.random() * wordKeys.length)];
        searchWord(randomWordKey);
    }

    // Function to sanitize HTML content
    function sanitizeHTML(htmlString) {
        return DOMPurify.sanitize(htmlString, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
            ALLOWED_ATTR: ['href'],
        });
    }

    // Function to highlight matching text
    function highlightMatchingText(text, query) {
        const regex = new RegExp(query, 'gi');
        return text.replace(regex, match => `<span class="highlight">${match}</span>`);
    }

    // Function to highlight specific words
    function highlightWords(text) {
        const highlightWords = ['Ottoman', 'Middle', 'Proto'];
        highlightWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            text = text.replace(regex, `<span class="highlight">${word}</span>`);
        });
        return text;
    }
});
