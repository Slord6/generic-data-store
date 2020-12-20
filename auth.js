const keys = [
    '6782109gguh89awyda9k9a'
];

const validateKey = (key) => {
    return keys.includes(key);
}

exports.validateKey = validateKey;