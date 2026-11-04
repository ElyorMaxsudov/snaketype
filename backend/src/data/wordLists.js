const wordsByLanguage = {
  uzbek_latin: [
    'salom', 'dunyo', 'dasturchi', 'kompyuter', 'klaviatura', 'tezlik', 'natija',
    'bilim', 'kelajak', 'yurak', 'quyosh', 'hayot', 'maqsad', 'harakat', 'tajriba',
    'muvaffaqiyat', 'kitob', 'o\'qish', 'yozish', 'fikr', 'aqlli', 'tizim', 'loyiha',
    'startup', 'ilon', 'do\'st', 'suhbat', 'inson', 'zamon', 'texnologiya', 'imkoniyat'
  ],
  uzbek_cyrillic: [
    'салом', 'дунё', 'дастурчи', 'компьютер', 'клавиатура', 'тезлик', 'натижа',
    'билим', 'келажак', 'юрак', 'қуёш', 'ҳаёт', 'мақсад', 'ҳаракат', 'тажриба'
  ],
  english: [
    'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for',
    'they', 'i', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you',
    'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there',
    'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other',
    'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state',
    'only', 'new', 'year', 'some', 'take', 'come', 'these', 'know', 'see', 'use',
    'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give',
    'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many',
    'must', 'look', 'before', 'great', 'back', 'through', 'long', 'where', 'much',
    'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each',
    'those', 'feel', 'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very',
    'still', 'nation', 'hand', 'old', 'life', 'tell', 'write', 'become', 'here',
    'show', 'house', 'both', 'between', 'need', 'mean', 'call', 'develop', 'under',
    'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another',
    'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want',
    'point', 'form', 'off', 'child', 'few', 'small', 'since', 'against', 'ask',
    'late', 'home', 'interest', 'large', 'person', 'end', 'open', 'public', 'follow',
    'during', 'present', 'without', 'again', 'hold', 'govern', 'around', 'possible',
    'head', 'consider', 'word', 'program', 'problem', 'however', 'lead', 'system',
    'set', 'order', 'eye', 'plan', 'run', 'keep', 'face', 'fact', 'group', 'play',
    'stand', 'increase', 'early', 'course', 'change', 'help', 'line'
  ],
  russian: [
    'время', 'человек', 'жизнь', 'день', 'рука', 'работа', 'слово', 'место', 'дело',
    'лицо', 'друг', 'глаз', 'вопрос', 'дом', 'сторона', 'страна', 'мир', 'случай'
  ],
  turkish: [
    'bir', 'olmak', 'bu', 've', 'için', 'ben', 'o', 'daha', 'değil', 'çok', 'yapmak',
    'onun', 'ile', 'ne', 'kadar', 'var', 'kendisi', 'sonra', 'hız', 'klavye'
  ],
  kazakh: [
    'бұл', 'және', 'үшін', 'болу', 'бір', 'мен', 'деген', 'ол', 'емес', 'қазақ',
    'адам', 'күн', 'жыл', 'уақыт', 'өмір', 'жылдамдық', 'мақсат'
  ],
  german: [
    'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des',
    'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'zeit', 'mensch', 'leben'
  ],
  french: [
    'le', 'de', 'un', 'à', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans',
    'temps', 'vie', 'homme', 'monde', 'jour', 'vitesse'
  ],
  spanish: [
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
    'tiempo', 'vida', 'año', 'día', 'hombre', 'mundo'
  ],
  italian: [
    'il', 'di', 'e', 'a', 'un', 'in', 'che', 'non', 'si', 'la', 'per', 'essere',
    'tempo', 'vita', 'anno', 'giorno', 'uomo', 'mondo', 'velocità'
  ],
  arabic: [
    'في', 'من', 'على', 'إلى', 'أن', 'هو', 'كان', 'ما', 'هذا', 'الذي', 'مع',
    'السرعة', 'اللوحة', 'الكتابة', 'الهدف', 'النجاح'
  ],
  javascript: [
    'const', 'let', 'function', 'return', 'async', 'await', 'import', 'export',
    'class', 'new', 'try', 'catch', 'if', 'else', 'map', 'filter', 'reduce'
  ],
  python: [
    'def', 'class', 'import', 'from', 'return', 'if', 'else', 'for', 'while',
    'try', 'except', 'print', 'len', 'range', 'enumerate'
  ],
  cpp: [
    'include', 'iostream', 'vector', 'string', 'namespace', 'std', 'int', 'float',
    'class', 'cout', 'cin', 'endl', 'main'
  ],
  html_css: [
    'html', 'head', 'body', 'div', 'span', 'display', 'flex', 'grid', 'margin', 'padding'
  ],
  java: [
    'public', 'private', 'class', 'interface', 'static', 'void', 'String', 'new', 'return'
  ],
  rust: [
    'fn', 'let', 'mut', 'pub', 'struct', 'enum', 'match', 'if', 'else', 'return', 'println'
  ],
  go: [
    'package', 'import', 'func', 'var', 'const', 'type', 'struct', 'return', 'fmt.Println'
  ],
  php: [
    'php', 'function', 'echo', 'return', 'public', 'private', 'class', 'new', 'foreach'
  ]
};

function getRandomWords(language = 'uzbek_latin', count = 30, options = {}) {
  const list = wordsByLanguage[language] || wordsByLanguage.uzbek_latin;
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * list.length);
    result.push(list[randomIndex]);
  }
  return result.join(' ');
}

module.exports = {
  wordsByLanguage,
  getRandomWords,
};
