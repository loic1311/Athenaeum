export function worldHistory(volume, locator, page) {
  return {
    author: 'Ann Kordas, Ryan J. Lynch, Brooke Nelson en Julie Tatlock',
    title: 'World History ' + (volume === 1 ? 'Volume 1, to 1500' : 'Volume 2, from 1400'),
    year: volume === 1 ? '2023' : '2022',
    locator,
    url: 'https://openstax.org/books/world-history-volume-' + volume + '/pages/' + page,
  };
}

export const textileGuilds = {
  author: 'Hugo Soly',
  year: '2008',
  title: 'The Political Economy of European Craft Guilds',
  locator: 'pp. 52–56, Flanders and Brabant: powerful craft guilds',
  url: 'https://doi.org/10.1017/S002085900800360X',
};

export function historyCourse(track, entries) {
  return entries.map(({ dimensions, connection, caseIds, tasks, ...lesson }) => {
    const headings = ['Economie', 'Samenleving', 'Politiek', 'Cultuur', 'Verandering verklaren'];
    const structure = [...dimensions, connection].map(([lead, text], index) => ({
      heading: headings[index], lead, text,
    }));
    const items = tasks.map(({ focus, prompt, answer, options, criteria, feedback }, index) => ({
      id: 'analyse-' + (index + 1), label: focus, explanation: feedback, source: 0,
      questions: [{
        kind: options ? 'choice' : 'open', text: prompt, answer,
        ...(options ? { options: [answer, ...options] } : { criteria }), feedback,
      }],
    }));
    return { ...lesson, track, structure, caseIds, items };
  });
}

export const choose = (focus, prompt, answer, options, feedback) => ({ focus, prompt, answer, options, feedback });
export const reason = (focus, prompt, answer, criteria, feedback) => ({ focus, prompt, answer, criteria, feedback });
