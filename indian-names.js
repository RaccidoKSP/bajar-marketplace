// Indian Names in Hindi - Random Name Generator

const indianNames = {
    male: [
        'राज कुमार',
        'अमित शर्मा',
        'विक्रम सिंह',
        'राहुल वर्मा',
        'अर्जुन पटेल',
        'संजय गुप्ता',
        'मनोज कुमार',
        'आदित्य राठौर',
        'दीपक मेहता',
        'नितिन जोशी',
        'रोहित खन्ना',
        'अनिल त्रिपाठी',
        'कार्तिक अग्रवाल',
        'विशाल मल्होत्रा',
        'हर्ष पांडे',
        'प्रवीण राव',
        'सुरेश यादव',
        'अभिषेक दास',
        'गौरव बंसल',
        'नवीन चौहान'
    ],
    female: [
        'प्रिया शर्मा',
        'अनीता देवी',
        'पूजा सिंह',
        'नेहा गुप्ता',
        'काजल वर्मा',
        'स्नेहा पटेल',
        'रीना कुमारी',
        'मीरा राठौर',
        'दीपिका मेहता',
        'सोनिया जोशी',
        'निशा खन्ना',
        'रेखा त्रिपाठी',
        'श्वेता अग्रवाल',
        'वंदना मल्होत्रा',
        'संगीता पांडे',
        'मंजू राव',
        'रश्मि यादव',
        'कविता दास',
        'अंजलि बंसल',
        'सीमा चौहान'
    ],
    neutral: [
        'अर्जुन शर्मा',
        'दीपक पटेल',
        'राज गुप्ता',
        'विक्रम कुमार',
        'मोहित सिंह',
        'सुरेश वर्मा',
        'अनिल राठौर',
        'विजय मेहता',
        'रवि जोशी',
        'संजय खन्ना',
        'प्रवीण त्रिपाठी',
        'अमित अग्रवाल',
        'राहुल मल्होत्रा',
        'नवीन पांडे',
        'आदित्य राव',
        'हर्ष यादव',
        'कार्तिक दास',
        'मनोज बंसल',
        'रोहित चौहान',
        'गौरव वर्मा'
    ]
};

/**
 * Get a random Indian name in Hindi
 * @param {string} gender - 'male', 'female', or 'random' (default)
 * @returns {string} Random Indian name in Hindi
 */
function getRandomIndianName(gender = 'random') {
    let nameList;
    
    if (gender === 'male') {
        nameList = indianNames.male;
    } else if (gender === 'female') {
        nameList = indianNames.female;
    } else {
        // Random gender or use neutral list
        const allNames = [...indianNames.male, ...indianNames.female, ...indianNames.neutral];
        nameList = allNames;
    }
    
    const randomIndex = Math.floor(Math.random() * nameList.length);
    return nameList[randomIndex];
}

/**
 * Auto-fill the seller name field with a random Indian name
 * @param {boolean} forceRefresh - If true, always generate new name even if field is not empty
 */
function autoFillSellerName(forceRefresh = true) {
    const sellerNameInput = document.getElementById('sellerName');
    if (sellerNameInput && (forceRefresh || !sellerNameInput.value)) {
        const randomName = getRandomIndianName();
        sellerNameInput.value = randomName;
        
        // Add a subtle animation to show the field was auto-filled
        sellerNameInput.style.transition = 'background-color 0.5s ease';
        sellerNameInput.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
            sellerNameInput.style.backgroundColor = '';
        }, 1000);
    }
}
