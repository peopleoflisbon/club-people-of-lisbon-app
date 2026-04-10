'use client';

const PHRASES = [
  { pt: 'Saudade', en: 'A deep longing for something loved and lost', pronunciation: 'saw-DAH-deh' },
  { pt: 'Tudo bem?', en: 'Everything good?', pronunciation: 'TOO-doo beng' },
  { pt: 'Que saudade!', en: 'How I\'ve missed this!', pronunciation: 'keh saw-DAH-deh' },
  { pt: 'À vontade', en: 'Make yourself at home', pronunciation: 'ah von-TAH-deh' },
  { pt: 'Com certeza', en: 'Certainly / absolutely', pronunciation: 'kong ser-TEH-zah' },
  { pt: 'Bom proveito', en: 'Enjoy your meal', pronunciation: 'bong pro-VAY-too' },
  { pt: 'Já está', en: 'That\'s it / all done', pronunciation: 'zhah esh-TAH' },
  { pt: 'Óptimo', en: 'Great / wonderful', pronunciation: 'OT-ee-moo' },
  { pt: 'Pois é', en: 'Indeed / exactly right', pronunciation: 'poysh eh' },
  { pt: 'Devagar se vai ao longe', en: 'Slowly one goes far — don\'t rush', pronunciation: 'deh-vah-GAR seh vay ow LONG-eh' },
  { pt: 'Amanhã', en: 'Tomorrow — also: don\'t worry about it today', pronunciation: 'ah-mah-NYAH' },
  { pt: 'Com calma', en: 'Take it easy / calmly', pronunciation: 'kong KAL-mah' },
  { pt: 'É fixe', en: 'It\'s cool / great — Lisbon slang', pronunciation: 'eh FEESH' },
  { pt: 'Está bem', en: 'It\'s fine / okay', pronunciation: 'esh-TAH beng' },
  { pt: 'Boa sorte', en: 'Good luck', pronunciation: 'BOH-ah SOR-teh' },
  { pt: 'Muito obrigado', en: 'Thank you very much', pronunciation: 'MWEE-too oh-bree-GAH-doo' },
  { pt: 'Com licença', en: 'Excuse me / with your permission', pronunciation: 'kong lee-SEN-sah' },
  { pt: 'Até logo', en: 'See you soon', pronunciation: 'ah-TEH LOH-goo' },
  { pt: 'Que maravilha', en: 'How wonderful', pronunciation: 'keh mah-rah-VEE-lyah' },
  { pt: 'Sem problema', en: 'No problem', pronunciation: 'seng pro-BLEH-mah' },
  { pt: 'Vai correr bem', en: 'It\'ll go well', pronunciation: 'vye koh-RER beng' },
  { pt: 'Lisboa é linda', en: 'Lisbon is beautiful', pronunciation: 'leezh-BOH-ah eh LEEN-dah' },
  { pt: 'Fado', en: 'Fate / melancholic Portuguese music', pronunciation: 'FAH-doo' },
  { pt: 'Petiscos', en: 'Portuguese tapas / small bites', pronunciation: 'peh-TEESH-koos' },
  { pt: 'Uma bica', en: 'An espresso — the Lisbon word for it', pronunciation: 'OO-mah BEE-kah' },
  { pt: 'Pastel de nata', en: 'Portuguese custard tart', pronunciation: 'pash-TEL deh NAH-tah' },
  { pt: 'Miradouro', en: 'A viewpoint / lookout terrace', pronunciation: 'mee-rah-DOH-roo' },
  { pt: 'Tenho saudades tuas', en: 'I miss you', pronunciation: 'TEN-yoo saw-DAH-dehs TOO-ash' },
  { pt: 'Fica à vontade', en: 'Feel free / help yourself', pronunciation: 'FEE-kah ah von-TAH-deh' },
  { pt: 'Boa tarde', en: 'Good afternoon', pronunciation: 'BOH-ah TAR-deh' },
];

export default function PortuguesePhrase() {
  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];

  return (
    <div className="overflow-hidden" style={{ background: 'linear-gradient(135deg, #166534, #15803d)' }}>
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">PT</span>
            </div>
            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Frase do Dia</span>
          </div>
          <span className="text-white/50 text-xs">Practice Portuguese</span>
        </div>

        {/* Phrase */}
        <p className="font-display text-white text-3xl leading-tight mb-2">{phrase.pt}</p>

        {/* Divider */}
        <div className="h-px bg-white/20 mb-3" />

        {/* Translation */}
        <p className="text-white text-base leading-snug mb-3">"{phrase.en}"</p>

        {/* Pronunciation */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">🔊</span>
          <span className="text-white/70 text-xs font-mono">{phrase.pronunciation}</span>
        </div>
      </div>
    </div>
  );
}
