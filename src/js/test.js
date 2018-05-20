const t = (n, t, e) => {
  t !== e ? console.error(`\u2715 ${n}: ${t}`) : console.log(`%c\u2714 ${n}`, 'color:#83BD75');
};

console.log('CONSOLE.JS');

console.log('DATA.JS');

t('data.parse (empty [])', Log.data.parse([]), undefined);
t('data.parse [!{}]', Log.data.parse([1]), undefined);
t('data.parse (non-array)', Log.data.parse(1), undefined);

console.log('');

t('entByDate !Date', Log.data.entByDate(0), undefined);
t('entByDate past', Log.data.entByDate(new Date(1997, 2, 2)), undefined);
t('entByDate future', Log.data.entByDate(new Date(2019, 2, 2)), undefined);

console.log('');

t('entByPeriod !Date', Log.data.entByPeriod(1), undefined);
t('entByPeriod !Date', Log.data.entByPeriod(new Date(), 1), undefined);
t('entByPeriod impossible range', Log.data.entByPeriod(new Date(2018, 0, 2), new Date(2018, 0, 1)), undefined);

console.log('');

t('recEnt string', Log.data.recEnt('1'), undefined);
t('recEnt 0', Log.data.recEnt(0), undefined);

console.log('');

t('entByDay string', Log.data.entByDay('Sunday'), undefined);
t('entByDay invalid number', Log.data.entByDay(-1), undefined);
t('entByDay invalid number', Log.data.entByDay(8), undefined);
t('entByDay empty []', Log.data.entByDay(0, []), undefined);
t('entByDay invalid array', Log.data.entByDay(0, [1]), undefined);

console.log('');

t('entByPro nonexistent', Log.data.entByPro('Egg'), undefined);
t('entByPro [!{}]', Log.data.entByPro('Log', [1]), undefined);
t('entByPro non-string', Log.data.entByPro(1), undefined);

console.log('');

t('entBySec nonexistent', Log.data.entBySec('Egg'), undefined);
t('entBySec [!{}]', Log.data.entBySec('Code', [1]), undefined);
t('entBySec non-string', Log.data.entBySec(1), undefined);

console.log('');

t('sortEnt [!{}]', Log.data.sortEnt([1]), undefined);
t('sortEnt !Date', Log.data.sortEnt(undefined, 1), undefined);

t('sortentByDay [!{}]', Log.data.sortEntByDay([1]), undefined);

console.log('');

const a = [1, 2, 3, 4, 5];

t('Min value [num]', Log.data.min(a), 1);
t('Max value [num]', Log.data.max(a), 5);
t('Avg value [num]', Log.data.avg(a), 3);

t('Min value [!num]', Log.data.min(['a']), '-');
t('Max value [!num]', Log.data.max(['a']), '-');
t('Avg value [!num]', Log.data.avg(['a']), '-');

t('Min value (empty set)', Log.data.min([]), 0);
t('Max value (empty set)', Log.data.max([]), 0);
t('Avg value (empty set)', Log.data.avg([]), 0);

console.log('');

t('Log.journal.displayEntry', Log.journal.displayEntry(0), undefined);
