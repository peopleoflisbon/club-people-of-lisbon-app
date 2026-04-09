'use client';

const PHRASES = [
  { pt: 'Saudade', en: 'A deep longing for something or someone loved and lost', pronunciation: 'saw-DAH-deh' },
  { pt: 'Tudo bem?', en: 'Everything good?', pronunciation: 'TOO-doo beng' },
  { pt: 'Que saudade!', en: 'How I\'ve missed this!', pronunciation: 'keh saw-DAH-deh' },
  { pt: 'À vontade', en: 'Make yourself at home / be comfortable', pronunciation: 'ah von-TAH-deh' },
  { pt: 'Com certeza', en: 'Certainly / absolutely', pronunciation: 'kong ser-TEH-zah' },
  { pt: 'Fica à vontade', en: 'Feel free / help yourself', pronunciation: 'FEE-kah ah von-TAH-deh' },
  { pt: 'Bom proveito', en: 'Enjoy your meal', pronunciation: 'bong pro-VAY-too' },
  { pt: 'Já está', en: 'That\'s it / done', pronunciation: 'zhah esh-TAH' },
  { pt: 'Óptimo', en: 'Great / wonderful', pronunciation: 'OT-ee-moo' },
  { pt: 'Pois é', en: 'Indeed / exactly / that\'s right', pronunciation: 'poysh eh' },
  { pt: 'Devagar se vai ao longe', en: 'Slowly one goes far (don\'t rush)', pronunciation: 'deh-vah-GAR seh vay ow LONG-eh' },
  { pt: 'Amanhã', en: 'Tomorrow (also: don\'t worry about it today)', pronunciation: 'ah-mah-NYAH' },
  { pt: 'Com calma', en: 'Take it easy / calmly', pronunciation: 'kong KAL-mah' },
  { pt: 'É fixe', en: 'It\'s cool / great (Lisbon slang)', pronunciation: 'eh FEESH' },
  { pt: 'Está bem', en: 'It\'s fine / okay', pronunciation: 'esh-TAH beng' },
  { pt: 'Boa sorte', en: 'Good luck', pronunciation: 'BOH-ah SOR-teh' },
  { pt: 'Muito obrigado', en: 'Thank you very much', pronunciation: 'MWEE-too oh-bree-GAH-doo' },
  { pt: 'Com licença', en: 'Excuse me / with your permission', pronunciation: 'kong lee-SEN-sah' },
  { pt: 'Boa tarde', en: 'Good afternoon', pronunciation: 'BOH-ah TAR-deh' },
  { pt: 'Até logo', en: 'See you soon', pronunciation: 'ah-TEH LOH-goo' },
  { pt: 'Tenho saudades tuas', en: 'I miss you', pronunciation: 'TEN-yoo saw-DAH-dehs TOO-ash' },
  { pt: 'Que maravilha', en: 'How wonderful', pronunciation: 'keh mah-rah-VEE-lyah' },
  { pt: 'Sem problema', en: 'No problem', pronunciation: 'seng pro-BLEH-mah' },
  { pt: 'Vai correr bem', en: 'It\'ll go well', pronunciation: 'vye koh-RER beng' },
  { pt: 'Lisboa é linda', en: 'Lisbon is beautiful', pronunciation: 'leezh-BOH-ah eh LEEN-dah' },
  { pt: 'Fado', en: 'Fate / a genre of melancholic Portuguese music', pronunciation: 'FAH-doo' },
  { pt: 'Petiscos', en: 'Portuguese tapas / small bites', pronunciation: 'peh-TEESH-koos' },
  { pt: 'Uma bica', en: 'An espresso (Lisbon term)', pronunciation: 'OO-mah BEE-kah' },
  { pt: 'Pastel de nata', en: 'Portuguese custard tart', pronunciation: 'pash-TEL deh NAH-tah' },
  { pt: 'Miradouro', en: 'A viewpoint / lookout terrace', pronunciation: 'mee-rah-DOH-roo' },
];

function getDayIndex() {
  const start = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return days % PHRASES.length;
}

export default function PortuguesePhrase() {
  const phrase = PHRASES[getDayIndex()];

  return (
    <div className="bg-ink rounded-2xl px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-brand uppercase tracking-wider">Frase do Dia</span>
        <span className="text-xs text-stone-600">· Phrase of the Day</span>
      </div>
      <p className="font-display text-white text-2xl leading-tight mb-1">{phrase.pt}</p>
      <p className="text-stone-400 text-sm leading-snug mb-2">"{phrase.en}"</p>
      <p className="text-stone-600 text-xs">🔊 {phrase.pronunciation}</p>
    </div>
  );
}
